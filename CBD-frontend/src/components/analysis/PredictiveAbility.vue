<template>
  <el-card class="analysis-card">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="T/N Prediction" name="tn" />
      <el-tab-pane label="Celltype Prediction" name="celltype" />
    </el-tabs>
    <div class="controls">
      <el-select v-model="celltype" placeholder="Celltype" filterable clearable style="width:200px" @change="loadData">
        <el-option v-for="ct in celltypeOptions" :key="ct" :label="ct" :value="ct" />
      </el-select>
      <el-select v-model="geneSearch" multiple filterable remote allow-create default-first-option clearable
        reserve-keyword placeholder="Search gene(s)" style="width:220px"
        :remote-method="queryGeneSearch" :loading="geneSearchLoading" @change="onGeneChange">
        <el-option v-for="g in geneOptions" :key="g" :label="g" :value="g" />
      </el-select>
      <div style="display:flex;align-items:center;gap:8px;min-width:260px">
        <span style="white-space:nowrap">AUC ≥ {{ minAuc.toFixed(2) }}</span>
        <el-slider v-model="minAuc" :min="0.5" :max="1" :step="0.01" style="flex:1" @change="loadData" />
      </div>
    </div>
    <div ref="chartRef" style="height:360px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px" @sort-change="handleSort">
      <el-table-column prop="gene" label="Gene" sortable="custom" />
      <el-table-column prop="celltype" label="Celltype" />
      <el-table-column prop="auc" label="AUC" sortable="custom">
        <template #default="{ row }">
          <span :style="{ color: labelColor(row.roc_label), fontWeight: 'bold' }">{{ Number(row.auc).toFixed(4) }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="p_value" label="P-value" sortable="custom">
        <template #default="{ row }">{{ Number(row.p_value).toExponential(2) }}</template>
      </el-table-column>
      <el-table-column prop="direction" label="Direction">
        <template #default="{ row }">
          <el-tag :type="directionType(row.direction)" size="small">{{ row.direction }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="roc_label" label="Label">
        <template #default="{ row }">
          <el-tag :color="labelColor(row.roc_label)" effect="dark" size="small" style="border:none;color:#fff">{{ row.roc_label }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[10, 20, 50]" :total="total"
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
const activeTab = ref('tn')
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const rows = ref([])
const chartData = ref([])
const loading = ref(false)
const sort = ref('auc_desc')
const celltype = ref('')
const geneSearch = ref([])
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
      const resp = await analysisApi.searchRocGenes({ q, limit: 20 })
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
const minAuc = ref(0.5)

const tnCelltypes = ref([])
const rocCelltypes = ref([])

const celltypeOptions = computed(() => activeTab.value === 'tn' ? tnCelltypes.value : rocCelltypes.value)

const labelColor = (label) => {
  const map = { Poor: '#ff6b6b', Fair: '#ffd93d', Good: '#6bcb77', Excellent: '#4d96ff' }
  return map[label] || '#999'
}

const directionType = (dir) => {
  const map = { Tumor_high: 'warning', Tumor_low: 'info' }
  return map[dir] || ''
}

const render = () => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  const top = chartData.value.slice(0, 30)
  const genes = top.map(r => r.gene)
  const barData = top.map(r => ({
    value: Number(r.auc),
    itemStyle: { color: labelColor(r.roc_label) }
  }))
  chart.setOption({
    tooltip: {
      trigger: 'axis',
      formatter: (params) => {
        const d = params[0]
        const row = top[d.dataIndex]
        return `${row.gene}<br/>AUC: ${Number(row.auc).toFixed(4)}<br/>P-value: ${Number(row.p_value).toExponential(2)}<br/>Label: ${row.roc_label}`
      }
    },
    grid: { top: 20, left: 50, right: 20, bottom: 80 },
    xAxis: {
      type: 'category',
      data: genes,
      axisLabel: { rotate: 45, fontSize: 10 }
    },
    yAxis: {
      type: 'value',
      name: 'AUC',
      min: 0,
      max: 1
    },
    series: [{
      type: 'bar',
      data: barData,
      markLine: {
        silent: true,
        data: [{ yAxis: 0.5, lineStyle: { type: 'dashed', color: '#999' }, label: { formatter: 'AUC=0.5' } }]
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
    const geneParam = geneSearch.value.length ? geneSearch.value.join(',') : undefined
    const params = {
      celltype: celltype.value || undefined,
      gene: geneParam,
      min_auc: minAuc.value > 0.5 ? minAuc.value : undefined,
      page: page.value,
      limit: limit.value,
      sort: sort.value
    }
    const chartParams = {
      tab: activeTab.value,
      celltype: celltype.value || undefined,
      gene: geneParam,
      min_auc: minAuc.value > 0.5 ? minAuc.value : undefined
    }
    const apiCall = activeTab.value === 'tn' ? analysisApi.getRocTn : analysisApi.getRocCelltype
    const [tableResp, chartResp] = await Promise.all([apiCall(params), analysisApi.getRocChart(chartParams)])
    if (seq !== reqSeq) return
    rows.value = tableResp.data || []
    total.value = tableResp.pagination?.totalItems ?? (Array.isArray(tableResp.data) ? tableResp.data.length : 0)
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
  const dir = order === 'descending' ? 'desc' : 'asc'
  if (prop === 'auc') sort.value = `auc_${dir}`
  else if (prop === 'p_value') sort.value = `p_value_${dir}`
  else sort.value = `gene_${dir}`
  loadData()
}

const onTabChange = () => {
  page.value = 1
  sort.value = 'auc_desc'
  celltype.value = ''
  const opts = activeTab.value === 'tn' ? tnCelltypes.value : rocCelltypes.value
  if (opts.length) celltype.value = opts[0]
  loadData()
}

watch([celltype], () => { page.value = 1; loadData() })

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
    tnCelltypes.value = f.data?.rocTnCelltypes || []
    rocCelltypes.value = f.data?.rocCelltypes || []
    if (tnCelltypes.value.length && !celltype.value) celltype.value = tnCelltypes.value[0]
  } catch (e) { console.error('Failed to load filters:', e) }
  loadData()
})
onUnmounted(() => { window.removeEventListener('resize', handleResize); if (ro && chartRef.value) ro.unobserve(chartRef.value); if (chart) chart.dispose() })
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
