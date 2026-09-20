<template>
  <el-card class="analysis-card">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="Full Interactions" name="full" />
      <el-tab-pane label="Dual-specific Biomarker Interactions" name="all" />
      <el-tab-pane label="Biomarker as Ligand" name="ligand" />
      <el-tab-pane label="Biomarker as Receptor" name="receptor" />
    </el-tabs>
    <div v-if="activeTab === 'ligand' || activeTab === 'receptor'" class="biomk-filters">
      <el-select v-model="biomkGene" multiple filterable remote allow-create default-first-option clearable
        reserve-keyword placeholder="All genes" style="width:260px"
        :remote-method="queryGeneSearch" :loading="geneSearchLoading" @change="onGeneChange">
        <el-option v-for="g in geneOptions" :key="g" :label="g" :value="g" />
      </el-select>
    </div>
    <div v-else-if="activeTab === 'full'" class="biomk-filters raw-filters">
      <el-select v-model="rawFilters.source" clearable filterable placeholder="All sources" style="width:150px" @change="onRawFilterChange">
        <el-option v-for="s in rawMeta.sources" :key="s" :label="s" :value="s" />
      </el-select>
      <el-select v-model="rawFilters.target" clearable filterable placeholder="All targets" style="width:150px" @change="onRawFilterChange">
        <el-option v-for="t in rawMeta.targets" :key="t" :label="t" :value="t" />
      </el-select>
      <el-select v-model="rawFilters.pathway_name" clearable filterable placeholder="All pathways" style="width:150px" @change="onRawFilterChange">
        <el-option v-for="p in rawMeta.pathways" :key="p" :label="p" :value="p" />
      </el-select>
      <el-select v-model="rawFilters.annotation" clearable filterable placeholder="All annotations" style="width:170px" @change="onRawFilterChange">
        <el-option v-for="a in rawMeta.annotations" :key="a" :label="a" :value="a" />
      </el-select>
      <el-input v-model="rawFilters.gene" clearable placeholder="Ligand / receptor genes (comma sep.)" style="width:220px"
        @keyup.enter="onRawFilterChange" @clear="onRawFilterChange" />
      <el-button @click="onRawReset">Reset</el-button>
    </div>
    <div ref="chartRef" style="height:520px; width:100%"></div>
    <div v-if="!displayRows.length" class="empty-hint">No interactions for current filters</div>
    <el-table v-if="activeTab === 'full'" :data="rawRows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="source" label="Source" />
      <el-table-column prop="target" label="Target" />
      <el-table-column prop="ligand" label="Ligand" />
      <el-table-column prop="receptor" label="Receptor" />
      <el-table-column prop="pathway_name" label="Pathway" />
      <el-table-column prop="annotation" label="Annotation" />
      <el-table-column prop="prob" label="Prob" />
      <el-table-column prop="pval" label="P-value" />
      <el-table-column label="Evidence" width="150">
        <template #default="{ row }">
          <EvidenceLinks :evidence="row.evidence" />
        </template>
      </el-table-column>
    </el-table>
    <el-table v-else-if="activeTab === 'all'" :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="source" label="Source" />
      <el-table-column prop="target" label="Target" />
      <el-table-column prop="ligand" label="Ligand" />
      <el-table-column prop="receptor" label="Receptor" />
      <el-table-column prop="prob" label="Prob" />
      <el-table-column prop="pathway_name" label="Pathway" />
      <el-table-column label="Evidence" width="150">
        <template #default="{ row }">
          <EvidenceLinks :evidence="row.evidence" />
        </template>
      </el-table-column>
    </el-table>
    <el-table v-else :data="biomkRows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="gene" label="Gene" />
      <el-table-column prop="biomark_as" label="As" />
      <el-table-column prop="source" label="Source" />
      <el-table-column prop="target" label="Target" />
      <el-table-column prop="ligand" label="Ligand" />
      <el-table-column prop="receptor" label="Receptor" />
      <el-table-column prop="pathway_name" label="Pathway" />
      <el-table-column prop="prob" label="Prob" />
      <el-table-column prop="pvalue" label="P-value" />
      <el-table-column label="Evidence" width="150">
        <template #default="{ row }">
          <EvidenceLinks :evidence="row.evidence" />
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[10, 20, 50]" :total="total"
        layout="total, sizes, prev, pager, next" @current-change="loadCurrentData" @size-change="loadCurrentData" />
    </div>
  </el-card>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import analysisApi from '@/services/analysis'
import EvidenceLinks from './EvidenceLinks.vue'

const chartRef = ref(null)
let chart = null
let resizeObserver = null

const activeTab = ref('full')
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const total = ref(0)

const rows = ref([])
const chartAllData = ref([])
const rawRows = ref([])
const rawNetwork = ref({ nodes: [], edges: [] })
const rawMeta = ref({ sources: [], targets: [], pathways: [], annotations: [] })
let rawMetaLoaded = false
const rawFilters = ref({ source: '', target: '', pathway_name: '', annotation: '', gene: '' })
const biomkRows = ref([])
const biomkNetwork = ref({ nodes: [], edges: [] })
const biomkGene = ref([])
const geneOptions = ref([])
const geneSearchLoading = ref(false)
let _geneTimer = null
const queryGeneSearch = (queryString) => {
  const q = String(queryString || '').trim()
  if (!q) { geneOptions.value = []; return }
  geneSearchLoading.value = true
  clearTimeout(_geneTimer)
  _geneTimer = setTimeout(async () => {
    try {
      const resp = await analysisApi.searchBiomkCellchatGenes({ q, limit: 20 })
      geneOptions.value = resp.data || []
    } catch { geneOptions.value = [] }
    geneSearchLoading.value = false
  }, 300)
}
const onGeneChange = (vals) => {
  // 支持粘贴逗号/分号/空格/换行分隔的批量基因
  const flat = (vals || []).flatMap(v => String(v).split(/[,;\s]+/)).filter(Boolean)
  const uniq = Array.from(new Set(flat))
  if (uniq.length !== (vals || []).length) biomkGene.value = uniq
  page.value = 1
  loadBiomkData()
}

const displayRows = computed(() => {
  if (activeTab.value === 'all') return rows.value
  if (activeTab.value === 'full') return rawRows.value
  return biomkRows.value
})

const renderChart = (nodeNames, links) => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  const nodes = nodeNames.map(n => ({ name: n }))
  try {
    chart.setOption({
      tooltip: {},
      legend: { top: 'bottom', left: 'center', orient: 'horizontal', padding: [10, 0, 0, 0] },
      series: [{
        type: 'chord', padAngle: 1, center: ['50%', '45%'], radius: ['68%', '85%'],
        data: nodes, itemStyle: { borderRadius: [0, 12], borderWidth: 2, borderColor: '#fff' },
        lineStyle: { opacity: 0.35, color: 'gradient' },
        emphasis: { focus: 'adjacency' },
        label: { show: true, position: 'inside', color: '#fff', fontWeight: 'bold', fontSize: 12 },
        links
      }]
    })
  } catch {
    chart.setOption({
      tooltip: {},
      series: [{
        type: 'graph', layout: 'circular', roam: true,
        data: nodes, links,
        label: { show: true, position: 'right', fontSize: 10 },
        lineStyle: { width: 2, color: '#7f7f7f' }
      }]
    })
  }
}

const renderAll = () => {
  const filtered = chartAllData.value
  const nodeNames = Array.from(new Set(filtered.flatMap(r => [r.source, r.target])))
  const agg = new Map()
  for (const r of filtered) {
    const key = `${r.source}||${r.target}`
    agg.set(key, (agg.get(key) || 0) + Number(r.prob || 0))
  }
  const links = Array.from(agg.entries()).map(([key, value]) => {
    const [source, target] = key.split('||')
    return { source, target, value }
  })
  renderChart(nodeNames, links)
}

const renderNetworkData = ({ nodes, edges }) => {
  const nodeNames = nodes.map(n => n.id)
  const agg = new Map()
  for (const e of edges) {
    const key = `${e.source}||${e.target}`
    agg.set(key, (agg.get(key) || 0) + Number(e.prob || 0))
  }
  const links = Array.from(agg.entries()).map(([key, value]) => {
    const [source, target] = key.split('||')
    return { source, target, value }
  })
  renderChart(nodeNames, links)
}

// 请求序号守卫：三个标签页共用一个序号，连续触发或切换标签时旧请求的结果作废
let reqSeq = 0

const loadData = async () => {
  const seq = ++reqSeq
  loading.value = true
  const params = { page: page.value, limit: limit.value }
  const [tableResp, chartResp] = await Promise.all([
    analysisApi.getCellChat(params),
    analysisApi.getCellChatChart()
  ])
  if (seq !== reqSeq) return
  rows.value = tableResp.data || []
  total.value = tableResp.pagination?.totalItems ?? (Array.isArray(tableResp.data) ? tableResp.data.length : 0)
  chartAllData.value = chartResp.data || []
  await nextTick()
  if (seq !== reqSeq) return
  renderAll()
  loading.value = false
}

const loadBiomkData = async () => {
  const seq = ++reqSeq
  loading.value = true
  const biomark_as = activeTab.value
  const gene = biomkGene.value.length ? biomkGene.value.join(',') : undefined
  try {
    const [tableResp, netResp] = await Promise.all([
      analysisApi.getBiomkCellchat({ gene, biomark_as, page: page.value, limit: limit.value }),
      analysisApi.getBiomkCellchatNetwork({ gene, biomark_as })
    ])
    if (seq !== reqSeq) return
    biomkRows.value = tableResp.data || []
    total.value = tableResp.pagination?.totalItems ?? (Array.isArray(tableResp.data) ? tableResp.data.length : 0)
    biomkNetwork.value = netResp.data || { nodes: [], edges: [] }
  } catch {
    if (seq !== reqSeq) return
    biomkRows.value = []
    biomkNetwork.value = { nodes: [], edges: [] }
    total.value = 0
  }
  await nextTick()
  if (seq !== reqSeq) return
  renderNetworkData(biomkNetwork.value)
  loading.value = false
}

const loadRawData = async () => {
  const seq = ++reqSeq
  loading.value = true
  try {
    if (!rawMetaLoaded) {
      const metaResp = await analysisApi.getCellChatRawMeta()
      rawMeta.value = metaResp.data || rawMeta.value
      rawMetaLoaded = true
    }
    const filters = { ...rawFilters.value }
    Object.keys(filters).forEach(k => { if (!filters[k]) delete filters[k] })
    const [tableResp, netResp] = await Promise.all([
      analysisApi.getCellChatRaw({ ...filters, page: page.value, limit: limit.value }),
      analysisApi.getCellChatRawNetwork(filters)
    ])
    if (seq !== reqSeq) return
    rawRows.value = tableResp.data || []
    total.value = tableResp.pagination?.totalItems ?? (Array.isArray(tableResp.data) ? tableResp.data.length : 0)
    rawNetwork.value = netResp.data || { nodes: [], edges: [] }
  } catch {
    if (seq !== reqSeq) return
    rawRows.value = []
    rawNetwork.value = { nodes: [], edges: [] }
    total.value = 0
  }
  await nextTick()
  if (seq !== reqSeq) return
  renderNetworkData(rawNetwork.value)
  loading.value = false
}

const loadCurrentData = () => {
  if (activeTab.value === 'all') return loadData()
  if (activeTab.value === 'full') return loadRawData()
  return loadBiomkData()
}

const onRawFilterChange = () => {
  page.value = 1
  loadRawData()
}

const onRawReset = () => {
  rawFilters.value = { source: '', target: '', pathway_name: '', annotation: '', gene: '' }
  onRawFilterChange()
}

const onTabChange = () => {
  page.value = 1
  loadCurrentData()
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => { if (chart) chart.resize() })
  if (chartRef.value) resizeObserver.observe(chartRef.value)
  loadCurrentData()
})
onUnmounted(() => {
  if (resizeObserver) resizeObserver.disconnect()
  if (chart) chart.dispose()
})
</script>
<style scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px
}

.empty-hint {
  padding: 8px 12px;
  color: #666
}

.biomk-filters {
  margin-bottom: 10px
}

.raw-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center
}
</style>
