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
      <el-select v-model="celltype" placeholder="Celltype" filterable clearable style="width:200px" @change="loadData">
        <el-option v-for="ct in celltypes" :key="ct" :label="ct" :value="ct" />
      </el-select>
      <el-autocomplete v-model="geneSearch" :fetch-suggestions="queryGeneSearch" placeholder="Search gene" clearable style="width:180px" @select="onGeneSelect" @clear="loadData" />
    </div>

    <!-- Custom 模式：输入基因列表，后端用 STRING 构建子网络后即时计算 -->
    <div v-else class="custom-input">
      <el-input v-model="geneText" type="textarea" :rows="6" :disabled="loading"
        placeholder="输入基因 symbol（每行一个或用空格 / 逗号分隔，# 开头为注释）&#10;后端会用 STRING v12.0 全人类 PPI（combined_score ≥ 700）查找这些基因之间的相互作用，然后计算 PRS&#10;例如：&#10;TP53&#10;MDM2 ATM&#10;CHEK2, BAX, BCL2" />
      <div class="custom-actions">
        <el-button type="primary" :loading="loading" @click="computeCustom">Compute PRS</el-button>
        <span v-if="lastElapsed" class="elapsed-info">计算耗时 {{ lastElapsed }}ms · {{ nodeCount }} 节点 · {{ edgeCount }} 边</span>
        <span class="hint">基因上限 500；最大连通分量需 ≥ 3</span>
      </div>
      <div v-if="unresolvedGenes.length" class="unresolved-info">
        <el-tooltip effect="dark" :content="unresolvedGenes.join(', ')" placement="top">
          <span>{{ unresolvedGenes.length }} 个基因在 STRING 中未找到：{{ unresolvedGenes.slice(0, 5).join(', ') }}{{ unresolvedGenes.length > 5 ? ' ...' : '' }}</span>
        </el-tooltip>
      </div>
    </div>

    <div ref="chartRef" style="height:400px; width:100%"></div>
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
    ElMessage.warning('请至少输入 2 个基因')
    return
  }
  loading.value = true
  lastElapsed.value = ''
  unresolvedGenes.value = []
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
    if (!customRows.length) ElMessage.info('计算完成，但未返回结果')
    else if (unresolvedGenes.value.length) ElMessage.info(`${unresolvedGenes.value.length} 个基因在 STRING 中未找到，已自动忽略`)
  } catch (e) {
    const msg = e?.response?.data?.error || e?.message || '计算失败'
    ElMessage.error(`PRS 计算失败：${msg}`)
  } finally {
    loading.value = false
  }
}

const onModeChange = (m) => {
  if (m === 'database') {
    loadData()
  } else {
    rows.value = customRows
    total.value = customRows.length
    nextTick(() => render())
  }
}

const render = () => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const data = rows.value.map(r => ({
    name: r.gene,
    value: [Number(r.sens), Number(r.deg), Number(r.eigenvec_centr), Number(r.closeness_centr)],
    _row: r
  })).filter(d => isFinite(d.value[0]) && isFinite(d.value[1]))

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
  loadData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (ro && chartRef.value) ro.unobserve(chartRef.value)
  if (chart) chart.dispose()
})
</script>
<style scoped>
.mode-switch {
  margin-bottom: 10px;
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
