<template>
  <el-card class="analysis-card">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="All Interactions" name="all" />
      <el-tab-pane label="Biomarker as Ligand" name="ligand" />
      <el-tab-pane label="Biomarker as Receptor" name="receptor" />
    </el-tabs>
    <div v-if="activeTab !== 'all'" class="biomk-filters">
      <el-autocomplete v-model="biomkGene" :fetch-suggestions="queryGeneSearch" clearable placeholder="All genes" style="width:220px" @select="onGeneSelect" @clear="onGeneChange" />
    </div>
    <div ref="chartRef" style="height:520px; width:100%"></div>
    <div v-if="!displayRows.length" class="empty-hint">No interactions for current filters</div>
    <el-table v-if="activeTab === 'all'" :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="source" label="Source" />
      <el-table-column prop="target" label="Target" />
      <el-table-column prop="ligand" label="Ligand" />
      <el-table-column prop="receptor" label="Receptor" />
      <el-table-column prop="prob" label="Prob" />
      <el-table-column prop="pathway_name" label="Pathway" />
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

const chartRef = ref(null)
let chart = null
let resizeObserver = null

const activeTab = ref('all')
const loading = ref(false)
const page = ref(1)
const limit = ref(20)
const total = ref(0)

const rows = ref([])
const chartAllData = ref([])
const biomkRows = ref([])
const biomkNetwork = ref({ nodes: [], edges: [] })
const biomkGene = ref('')
let _geneTimer = null
const queryGeneSearch = (qs, cb) => {
  clearTimeout(_geneTimer)
  const q = qs.trim()
  if (!q) { cb([]); return }
  _geneTimer = setTimeout(async () => {
    try {
      const resp = await analysisApi.searchBiomkCellchatGenes({ q, limit: 20 })
      cb((resp.data || []).map(g => ({ value: g })))
    } catch { cb([]) }
  }, 300)
}
const onGeneSelect = (item) => { if (item?.value) { biomkGene.value = item.value; onGeneChange() } }

const displayRows = computed(() => activeTab.value === 'all' ? rows.value : biomkRows.value)

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

const renderBiomk = () => {
  const { nodes, edges } = biomkNetwork.value
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

const loadData = async () => {
  loading.value = true
  const params = { page: page.value, limit: limit.value }
  const [tableResp, chartResp] = await Promise.all([
    analysisApi.getCellChat(params),
    analysisApi.getCellChatChart()
  ])
  rows.value = tableResp.data || []
  total.value = tableResp.pagination?.totalItems ?? (Array.isArray(tableResp.data) ? tableResp.data.length : 0)
  chartAllData.value = chartResp.data || []
  await nextTick()
  renderAll()
  loading.value = false
}

const loadBiomkData = async () => {
  loading.value = true
  const biomark_as = activeTab.value
  const gene = biomkGene.value || undefined
  try {
    const [tableResp, netResp] = await Promise.all([
      analysisApi.getBiomkCellchat({ gene, biomark_as, page: page.value, limit: limit.value }),
      analysisApi.getBiomkCellchatNetwork({ gene, biomark_as })
    ])
    biomkRows.value = tableResp.data || []
    total.value = tableResp.pagination?.totalItems ?? (Array.isArray(tableResp.data) ? tableResp.data.length : 0)
    biomkNetwork.value = netResp.data || { nodes: [], edges: [] }
  } catch {
    biomkRows.value = []
    biomkNetwork.value = { nodes: [], edges: [] }
    total.value = 0
  }
  await nextTick()
  renderBiomk()
  loading.value = false
}

const loadCurrentData = () => activeTab.value === 'all' ? loadData() : loadBiomkData()

const onTabChange = () => {
  page.value = 1
  loadCurrentData()
}

const onGeneChange = () => {
  page.value = 1
  loadBiomkData()
}

onMounted(() => {
  resizeObserver = new ResizeObserver(() => { if (chart) chart.resize() })
  if (chartRef.value) resizeObserver.observe(chartRef.value)
  loadData()
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
</style>
