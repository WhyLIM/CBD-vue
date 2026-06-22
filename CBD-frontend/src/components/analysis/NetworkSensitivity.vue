<template>
  <el-card class="analysis-card">
    <div class="mode-switch">
      <el-radio-group v-model="mode" @change="onModeChange">
        <el-radio-button value="database">Database</el-radio-button>
        <el-radio-button value="custom">Custom Network</el-radio-button>
      </el-radio-group>
    </div>

    <!-- Database 模式：从数据库浏览预计算结果 -->
    <div v-if="mode === 'database'" class="controls">
      <el-select v-model="celltype" placeholder="Celltype" filterable clearable style="width:200px" @change="onCelltypeChange">
        <el-option v-for="ct in celltypes" :key="ct" :label="ct" :value="ct" />
      </el-select>
      <el-autocomplete v-model="geneSearch" :fetch-suggestions="queryGeneSearch" placeholder="Search gene" clearable style="width:180px" @select="onGeneSelect" @clear="loadData" />
    </div>

    <!-- Custom 模式：输入基因列表，后端用 STRING 构建子网络后即时计算 -->
    <div v-else class="custom-input">
      <el-input v-model="geneText" type="textarea" :rows="6" :disabled="loading"
        placeholder="Enter gene symbols (one per line, or separated by spaces / commas; lines starting with # are comments)&#10;The backend will look up interactions among these genes using STRING v12.0 human PPI (combined_score ≥ 700), then compute PRS&#10;Example:&#10;TP53&#10;MDM2 ATM&#10;CHEK2, BAX, BCL2" />
      <div class="custom-actions">
        <el-button type="primary" :loading="loading" @click="computeCustom">Compute PRS</el-button>
        <span v-if="lastElapsed" class="elapsed-info">Time {{ lastElapsed }}ms · {{ nodeCount }} nodes · {{ edgeCount }} edges</span>
        <span class="hint">Max 500 genes; largest connected component must have ≥ 3</span>
      </div>
      <div v-if="unresolvedGenes.length" class="unresolved-info">
        <el-tooltip effect="dark" :content="unresolvedGenes.join(', ')" placement="top">
          <span>{{ unresolvedGenes.length }} gene(s) not found in STRING: {{ unresolvedGenes.slice(0, 5).join(', ') }}{{ unresolvedGenes.length > 5 ? ' ...' : '' }}</span>
        </el-tooltip>
      </div>
    </div>

    <!-- 上：子网络 + 散点图（左右布局） -->
    <div class="vis-grid">
      <div class="vis-cell network-cell">
        <div class="vis-title">STRING Subnetwork</div>
        <div ref="networkRef" class="cy-container"></div>
        <div v-if="networkMeta" class="vis-caption">
          {{ networkMeta.nodeCount }} nodes · {{ networkMeta.edgeCount }} edges
          <span v-if="networkMeta.unresolved.length"> · {{ networkMeta.unresolved.length }} unresolved</span>
        </div>
      </div>
      <div class="vis-cell scatter-cell">
        <div class="vis-title">Sensitivity vs Degree</div>
        <div ref="chartRef" class="chart-container"></div>
        <div v-if="mode === 'database' && scatterRows.length" class="scatter-caption">
          Scatter: <b>{{ scatterRows.length }}</b> total genes in current celltype; <b>{{ rows.length }}</b> on current page are highlighted
        </div>
      </div>
    </div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="gene" label="Gene" />
      <el-table-column v-if="mode === 'database'" prop="celltype" label="Celltype" />
      <el-table-column prop="deg" label="Deg">
        <template #default="{ row }">{{ Number(row.deg).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="eff" label="Eff">
        <template #default="{ row }">{{ Number(row.eff).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="sens" label="Sens">
        <template #default="{ row }">{{ Number(row.sens).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="trans" label="Trans">
        <template #default="{ row }">{{ Number(row.trans).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="eigenvec_centr" label="Eigenvec Centrality">
        <template #default="{ row }">{{ Number(row.eigenvec_centr).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="closeness_centr" label="Closeness Centrality">
        <template #default="{ row }">{{ Number(row.closeness_centr).toFixed(4) }}</template>
      </el-table-column>
    </el-table>
    <div v-if="mode === 'database'" class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[10, 20, 50]" :total="total"
        layout="total, sizes, prev, pager, next" @current-change="loadData" @size-change="loadData" />
    </div>
  </el-card>
</template>
<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import cytoscape from 'cytoscape'
import analysisApi from '@/services/analysis'

const mode = ref('database')

// Database 模式状态
const chartRef = ref(null)
let chart = null
const celltypes = ref([])
const celltype = ref('')
const geneSearch = ref('')
let _geneTimer = null
const queryGeneSearch = (qs, cb) => {
  clearTimeout(_geneTimer)
  const q = qs.trim()
  if (!q) { cb([]); return }
  _geneTimer = setTimeout(async () => {
    try {
      const resp = await analysisApi.searchPrsGenes({ q, limit: 20 })
      cb((resp.data || []).map(g => ({ value: g })))
    } catch { cb([]) }
  }, 300)
}
const onGeneSelect = (item) => { if (item?.value) { geneSearch.value = item.value; loadData() } }
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const rows = ref([])
const loading = ref(false)
// Database 模式散点图全量数据（当前 celltype）
const scatterRows = ref([])

// 左侧 STRING 子网络（Database / Custom 共用）
const networkRef = ref(null)
let cyInstance = null
const networkMeta = ref(null)

// Custom 模式状态
const geneText = ref('')
const lastElapsed = ref('')
const nodeCount = ref(0)
const edgeCount = ref(0)
const unresolvedGenes = ref([])
let customRows = []

// 解析基因列表：支持换行 / 空格 / 制表符 / 逗号；忽略 # 注释行；去重
const parseGenes = (text) => {
  const genes = []
  const seen = new Set()
  for (const line of (text || '').split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    for (const tok of t.split(/[\s,\t]+/).filter(Boolean)) {
      const s = tok.trim().toUpperCase()
      if (s && !seen.has(s)) { seen.add(s); genes.push(s) }
    }
  }
  return genes
}

const computeCustom = async () => {
  const genes = parseGenes(geneText.value)
  if (genes.length < 2) {
    ElMessage.warning('Please enter at least 2 genes')
    return
  }
  loading.value = true
  lastElapsed.value = ''
  unresolvedGenes.value = []
  // 子网络独立于 PRS 计算：只要基因有效就刷新左侧 STRING 子网络
  loadNetwork(genes)
  try {
    const resp = await analysisApi.computePrsByGenes({ genes })
    customRows = resp.data?.metrics || []
    rows.value = customRows
    total.value = customRows.length
    nodeCount.value = resp.data?.metrics?.length || 0
    edgeCount.value = resp.data?.meta?.edgeCount || 0
    unresolvedGenes.value = resp.data?.meta?.unresolved || []
    const gnm = resp.data?.elapsed_ms?.gnm
    lastElapsed.value = gnm != null ? Number(gnm).toFixed(0) : ''
    await nextTick()
    render()
    if (!customRows.length) ElMessage.info('Computation finished, but no results returned')
    else if (unresolvedGenes.value.length) ElMessage.info(`${unresolvedGenes.value.length} gene(s) not found in STRING, automatically ignored`)
  } catch (e) {
    // PRS 失败时清空散点图/表格，但保留左侧子网络（STRING 数据源独立）
    customRows = []
    rows.value = []
    total.value = 0
    await nextTick()
    render()
    const msg = e?.response?.data?.error || e?.message || 'Computation failed'
    ElMessage.error(`PRS computation failed: ${msg}`)
  } finally {
    loading.value = false
  }
}

const onModeChange = (m) => {
  if (m === 'database') {
    loadData()
    // 切回 Database 时刷新左侧子网络（用当前 celltype 全量基因）
    nextTick(() => {
      loadNetwork(scatterRows.value.map(r => r.gene))
    })
  } else {
    rows.value = customRows
    total.value = customRows.length
    nextTick(() => {
      render()
      // Custom 模式未计算前清空子网络
      loadNetwork([])
    })
  }
}

// celltype 变化：重置分页，并刷新散点图全量数据 + 左侧子网络
const onCelltypeChange = () => {
  page.value = 1
  loadScatter().then(() => {
    loadNetwork(scatterRows.value.map(r => r.gene))
  })
  loadData()
}

// 加载散点图全量数据（仅 Database 模式）
const loadScatter = async () => {
  if (mode.value !== 'database' || !celltype.value) {
    scatterRows.value = []
    return
  }
  try {
    const resp = await analysisApi.getPrsScatter({ celltype: celltype.value })
    scatterRows.value = resp.data || []
  } catch {
    scatterRows.value = []
  }
}

// 加载 STRING 子网络（两种模式共用）
// Database 模式：用当前 celltype 的全量基因；Custom 模式：用 parseGenes 后的基因
const loadNetwork = async (genes) => {
  if (!genes || genes.length < 1) {
    networkMeta.value = null
    renderNetwork({ nodes: [], edges: [] })
    return
  }
  try {
    const resp = await analysisApi.getPrsSubnetwork({ genes })
    const d = resp.data || {}
    networkMeta.value = d.meta || null
    renderNetwork({ nodes: d.nodes || [], edges: d.edges || [] })
  } catch (e) {
    networkMeta.value = null
    renderNetwork({ nodes: [], edges: [] })
  }
}

// Cytoscape 渲染
const renderNetwork = ({ nodes, edges }) => {
  if (!networkRef.value || networkRef.value.clientWidth === 0) return
  if (cyInstance) {
    cyInstance.destroy()
    cyInstance = null
  }
  if (!nodes.length) return
  cyInstance = cytoscape({
    container: networkRef.value,
    elements: [...nodes, ...edges],
    style: [
      { selector: 'node', style: {
        'background-color': '#5B8FF9', 'label': 'data(label)',
        'width': 14, 'height': 14, 'font-size': '8px',
        'text-valign': 'bottom', 'text-halign': 'center', 'color': '#444',
        'border-width': 1, 'border-color': '#fff'
      } },
      { selector: 'node[!resolved]', style: { 'background-color': '#ccc' } },
      { selector: 'edge', style: {
        'width': 1, 'line-color': '#bbb', 'opacity': 0.6,
        'curve-style': 'bezier'
      } },
      { selector: ':selected', style: { 'background-color': '#F6BD16', 'line-color': '#F6BD16' } }
    ],
    layout: { name: 'cose', animate: false, nodeRepulsion: 8000, idealEdgeLength: 50 }
  })
}

const render = () => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  // Database 模式：散点图用全量数据；当前页基因正常饱和，其余降低透明度
  // Custom 模式：用用户输入的全部基因
  const source = mode.value === 'database' ? scatterRows.value : customRows
  const currentGenes = new Set(rows.value.map(r => r.gene))

  const data = source.map(r => {
    const sens = Number(r.sens)
    const deg = Number(r.deg)
    const eigen = Number(r.eigenvec_centr)
    const close = Number(r.closeness_centr)
    if (!isFinite(sens) || !isFinite(deg)) return null
    const isCurrent = mode.value !== 'database' || currentGenes.has(r.gene)
    return {
      name: r.gene,
      value: [sens, deg, eigen, close],
      _row: r,
      itemStyle: isCurrent
        ? { opacity: 1, borderColor: '#101010', borderWidth: 1 }
        : { opacity: 0.35 },
      emphasis: isCurrent ? { focus: 'self' } : { disabled: true }
    }
  }).filter(Boolean)

  if (!data.length) {
    chart.setOption({ title: { text: 'No data', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } })
    return
  }

  const eigenValues = data.map(d => d.value[2]).filter(v => v > 0)
  const closeValues = data.map(d => d.value[3])
  const minClose = Math.min(...closeValues)
  const maxClose = Math.max(...closeValues)
  const maxEigen = eigenValues.length ? Math.max(...eigenValues) : 1

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const r = params.data._row
        return `<b>${r.gene}</b>` + (r.celltype ? `<br/>Celltype: ${r.celltype}` : '') +
          `<br/>Sens: ${Number(r.sens).toFixed(4)}<br/>Deg: ${Number(r.deg).toFixed(4)}` +
          `<br/>Eff: ${Number(r.eff).toFixed(4)}<br/>Trans: ${Number(r.trans).toFixed(4)}`
      }
    },
    grid: { top: 30, right: 30, bottom: 40, left: 50 },
    xAxis: { name: 'Sensitivity', type: 'value' },
    yAxis: { name: 'Degree', type: 'value' },
    visualMap: {
      min: minClose,
      max: maxClose,
      dimension: 3,
      inRange: { color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'] },
      text: ['High', 'Low'],
      right: 0,
      top: 'middle',
      calculable: true
    },
    series: [{
      type: 'scatter',
      data,
      symbolSize: (val) => 6 + Math.min(30, Math.max(4, (val[2] / maxEigen) * 30))
    }]
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      celltype: celltype.value || undefined,
      gene: geneSearch.value || undefined,
      page: page.value,
      limit: limit.value
    }
    const resp = await analysisApi.getPrs(params)
    rows.value = resp.data || []
    total.value = resp.pagination?.totalItems ?? (Array.isArray(resp.data) ? resp.data.length : 0)
    await nextTick()
    render()
  } finally {
    loading.value = false
  }
}

const handleResize = () => { if (chart) chart.resize() }
let ro

onMounted(async () => {
  window.addEventListener('resize', handleResize)
  if (chartRef.value) {
    ro = new ResizeObserver(() => { if (chart) chart.resize(); else render() })
    ro.observe(chartRef.value)
  }
  try {
    const f = await analysisApi.getFilters()
    celltypes.value = f.data?.prsCelltypes || []
    if (!celltype.value && celltypes.value.length) celltype.value = celltypes.value[0]
  } catch (e) {
    console.error('Failed to load filters:', e)
  }
  await loadScatter()
  // 初始化左侧 STRING 子网络
  loadNetwork(scatterRows.value.map(r => r.gene))
  loadData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (ro && chartRef.value) ro.unobserve(chartRef.value)
  if (chart) chart.dispose()
  if (cyInstance) { cyInstance.destroy(); cyInstance = null }
})
</script>
<style scoped>
.mode-switch {
  margin-bottom: 10px;
}
.vis-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 10px;
}
.vis-cell {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 8px;
  background: #fff;
}
.vis-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  margin-bottom: 6px;
}
.cy-container {
  height: 400px;
  width: 100%;
  background: #fafbfc;
  border-radius: 3px;
}
.chart-container {
  height: 400px;
  width: 100%;
}
.vis-caption {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
  text-align: center;
}
.scatter-caption {
  margin-top: 4px;
  font-size: 12px;
  color: #888;
  text-align: center;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.custom-input {
  margin-bottom: 8px;
}

.custom-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.elapsed-info {
  color: #67c23a;
  font-size: 12px;
}

.hint {
  color: #909399;
  font-size: 12px;
}

.unresolved-info {
  margin-top: 6px;
  color: #e6a23c;
  font-size: 12px;
  cursor: help;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
