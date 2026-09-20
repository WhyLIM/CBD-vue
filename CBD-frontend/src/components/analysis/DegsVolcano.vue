<template>
  <el-card class="analysis-card">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="Original" name="original" />
      <el-tab-pane label="By Celltype" name="celltype" />
      <el-tab-pane label="Tumor vs Normal" name="tvsn" />
    </el-tabs>
    <div class="controls">
      <el-select v-if="activeTab === 'original'" v-model="cellType" placeholder="Cell Type" filterable style="width:200px" @change="loadData">
        <el-option v-for="ct in cellTypes" :key="ct" :label="ct" :value="ct" />
      </el-select>
      <template v-if="activeTab === 'celltype'">
        <el-select v-model="gdCelltype" placeholder="Celltype" filterable clearable style="width:200px" @change="loadData">
          <el-option v-for="ct in gdCelltypes" :key="ct" :label="ct" :value="ct" />
        </el-select>
        <el-select v-model="geneSearch" multiple filterable remote allow-create default-first-option clearable
          reserve-keyword placeholder="Search gene(s)" style="width:220px"
          :remote-method="queryGeneSearch" :loading="geneSearchLoading" @change="onGeneChange">
          <el-option v-for="g in geneOptions" :key="g" :label="g" :value="g" />
        </el-select>
      </template>
      <template v-if="activeTab === 'tvsn'">
        <el-select v-model="tvsnCelltype" placeholder="Celltype" filterable clearable style="width:200px" @change="loadData">
          <el-option v-for="ct in tvsnCelltypes" :key="ct" :label="ct" :value="ct" />
        </el-select>
        <el-select v-model="geneSearch" multiple filterable remote allow-create default-first-option clearable
          reserve-keyword placeholder="Search gene(s)" style="width:220px"
          :remote-method="queryGeneSearch" :loading="geneSearchLoading" @change="onGeneChange">
          <el-option v-for="g in geneOptions" :key="g" :label="g" :value="g" />
        </el-select>
      </template>
    </div>
    <div ref="chartRef" style="height:360px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px" @sort-change="handleSort">
      <el-table-column prop="gene" label="Gene" sortable="custom" />
      <el-table-column v-if="activeTab !== 'original'" prop="celltype" label="Celltype" />
      <el-table-column :prop="fcProp" :label="fcLabel" sortable="custom" />
      <el-table-column v-if="activeTab !== 'original'" prop="pct_1" label="pct_1" />
      <el-table-column v-if="activeTab !== 'original'" prop="pct_2" label="pct_2" />
      <el-table-column :prop="pvalProp" :label="pvalLabel" sortable="custom" />
      <el-table-column :prop="negLogProp" :label="negLogLabel" sortable="custom" />
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[20, 50, 100, 200]" :total="total"
        layout="total, sizes, prev, pager, next" @current-change="loadData" @size-change="loadData" />
    </div>
  </el-card>
</template>
<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import analysisApi from '@/services/analysis'

const chartRef = ref(null)
let chart = null
const activeTab = ref('original')
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const rows = ref([])
const chartData = ref([])
const loading = ref(false)
const sort = ref('neg_log10_padj_desc')
const geneSearch = ref([])
const geneOptions = ref([])
const geneSearchLoading = ref(false)

// Original tab filters
const cellTypes = ref([])
const cellType = ref('')

// By Celltype tab filters
const gdCelltypes = ref([])
const gdCelltype = ref('')

// TvsN tab filters
const tvsnCelltypes = ref([])
const tvsnCelltype = ref('')

// 基因自动补全（远程搜索，多选）
let _geneTimer = null
const queryGeneSearch = (queryString) => {
  const q = String(queryString || '').trim()
  if (!q) { geneOptions.value = []; return }
  geneSearchLoading.value = true
  clearTimeout(_geneTimer)
  _geneTimer = setTimeout(async () => {
    try {
      // 基因搜索框只存在于 By Celltype / Tumor vs Normal 两个标签页，统一走 gene-diff 的搜索
      const resp = await analysisApi.searchGeneDiffGenes({ q, limit: 20 })
      geneOptions.value = resp.data || []
    } catch { geneOptions.value = [] }
    geneSearchLoading.value = false
  }, 300)
}
const onGeneChange = (vals) => {
  // 支持粘贴逗号/分号/空格/换行分隔的批量基因（如 "TP53, KRAS" 或一行一个的列表）
  const flat = (vals || []).flatMap(v => String(v).split(/[,;\s]+/)).filter(Boolean)
  const uniq = Array.from(new Set(flat))
  if (uniq.length !== (vals || []).length) geneSearch.value = uniq
  page.value = 1
  loadData()
}

// Computed column props per tab
const fcProp = computed(() => activeTab.value === 'original' ? 'logFC' : 'avg_log2FC')
const fcLabel = computed(() => activeTab.value === 'original' ? 'logFC' : 'avg_log2FC')
const pvalProp = computed(() => activeTab.value === 'original' ? 'pval_adj' : 'p_val_adj')
const pvalLabel = computed(() => activeTab.value === 'original' ? 'padj' : 'p_val_adj')
const negLogProp = computed(() => activeTab.value === 'original' ? 'neg_log10_padj' : 'neg_log10_pval_adj')
const negLogLabel = computed(() => '-log10(padj)')

const render = () => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  let data
  if (activeTab.value === 'original') {
    data = chartData.value.map(r => [Number(r.logFC), Number(r.neg_log10_padj), r.gene, Number(r.pval_adj)])
  } else {
    data = chartData.value.map(r => {
      const fc = Number(r.avg_log2FC)
      const padj = Number(r.p_val_adj)
      const negLog = padj > 0 ? -Math.log10(padj) : 0
      return [fc, negLog, r.gene, padj]
    })
  }
  const xName = activeTab.value === 'original' ? 'logFC' : 'avg_log2FC'
  // 选中的基因在火山图上高亮显示（橙色）
  const selected = new Set(geneSearch.value)
  chart.setOption({
    tooltip: { trigger: 'item', formatter: p => `Gene: ${p.data[2]}<br/>${xName}: ${p.data[0]}<br/>-log10(padj): ${p.data[1]}` },
    xAxis: { name: xName }, yAxis: { name: '-log10(padj)' }, grid: { top: 20, left: 40, right: 20, bottom: 30 },
    series: [{
      type: 'scatter', data, symbolSize: 8,
      itemStyle: {
        color: p => selected.has(p.data[2]) ? '#ff7f0e'
          : ((p.data[3] < 0.05 && Math.abs(p.data[0]) > 1) ? '#d62728' : '#1f77b4')
      }
    }]
  })
}

// 请求序号守卫：连续触发时只采纳最新一次请求的结果
let reqSeq = 0
const loadData = async () => {
  const seq = ++reqSeq
  loading.value = true
  try {
    let tableReq, chartReq
    const geneParam = geneSearch.value.length ? geneSearch.value.join(',') : undefined
    if (activeTab.value === 'original') {
      const common = { cell_type: cellType.value || undefined }
      tableReq = analysisApi.getDegs({ ...common, gene: geneParam, page: page.value, limit: limit.value, sort: sort.value })
      chartReq = analysisApi.getDegsChart(common)
    } else if (activeTab.value === 'celltype') {
      const common = { celltype: gdCelltype.value || undefined }
      tableReq = analysisApi.getGeneDiffCelltype({ ...common, gene: geneParam, page: page.value, limit: limit.value, sort: sort.value })
      chartReq = analysisApi.getGeneDiffCelltypeChart(common)
    } else {
      const common = { celltype: tvsnCelltype.value || undefined }
      tableReq = analysisApi.getGeneDiffTvsN({ ...common, gene: geneParam, page: page.value, limit: limit.value, sort: sort.value })
      chartReq = analysisApi.getGeneDiffTvsNChart(common)
    }
    const [tableResp, chartResp] = await Promise.all([tableReq, chartReq])
    if (seq !== reqSeq) return
    // 表格数据（分页）
    const raw = tableResp.data || []
    if (activeTab.value !== 'original') {
      rows.value = raw.map(r => ({ ...r, neg_log10_pval_adj: Number(r.p_val_adj) > 0 ? -Math.log10(Number(r.p_val_adj)) : 0 }))
    } else {
      rows.value = raw
    }
    total.value = tableResp.pagination?.totalItems ?? (Array.isArray(tableResp.data) ? tableResp.data.length : 0)
    // 图表数据（全量）
    chartData.value = chartResp.data || []
    await nextTick()
    if (seq !== reqSeq) return
    render()
  } finally {
    if (seq === reqSeq) loading.value = false
  }
}

const handleSort = ({ prop, order }) => {
  if (!order) return
  if (activeTab.value === 'original') {
    if (prop === 'logFC' && order === 'descending') sort.value = 'logfc_desc'
    else if (prop === 'pval_adj' && order === 'ascending') sort.value = 'pval_adj_asc'
    else sort.value = 'neg_log10_padj_desc'
  } else {
    if (prop === 'avg_log2FC' && order === 'descending') sort.value = 'avg_log2fc_desc'
    else if (prop === 'avg_log2FC' && order === 'ascending') sort.value = 'avg_log2fc_asc'
    else if (prop === 'p_val_adj' && order === 'ascending') sort.value = 'p_val_adj_asc'
    else sort.value = 'neg_log10_pval_adj_desc'
  }
  loadData()
}

const onTabChange = () => {
  page.value = 1
  sort.value = activeTab.value === 'original' ? 'neg_log10_padj_desc' : 'neg_log10_pval_adj_desc'
  loadData()
}

const handleResize = () => {
  if (chart) { chart.resize() } else { render() }
}

let ro
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  if (chartRef.value) {
    ro = new ResizeObserver(() => { if (chart) chart.resize(); else render() })
    ro.observe(chartRef.value)
  }
  try {
    const f = await analysisApi.getFilters()
    cellTypes.value = f.data?.degsCellTypes || []
    gdCelltypes.value = f.data?.gdCelltypes || []
    tvsnCelltypes.value = f.data?.gdTvsNCelltypes || []
    if (!cellType.value && cellTypes.value.length) cellType.value = cellTypes.value[0]
    if (!gdCelltype.value && gdCelltypes.value.length) gdCelltype.value = gdCelltypes.value[0]
    if (!tvsnCelltype.value && tvsnCelltypes.value.length) tvsnCelltype.value = tvsnCelltypes.value[0]
  } catch (e) { console.error('Failed to load filters:', e) }
  loadData()
})
onUnmounted(() => { window.removeEventListener('resize', handleResize); if (ro && chartRef.value) ro.unobserve(chartRef.value); if (chart) chart.dispose() })

watch([cellType, gdCelltype, tvsnCelltype], () => { page.value = 1; loadData() })
</script>
<style scoped>
.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>
