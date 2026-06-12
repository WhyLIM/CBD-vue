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
      <el-input v-model="geneSearch" placeholder="Search gene" clearable style="width:180px" @clear="loadData" @keyup.enter="loadData" />
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
const geneSearch = ref('')
let _geneTimer = null
const queryGeneSearch = (qs, cb) => {
  clearTimeout(_geneTimer)
  const q = qs.trim()
  if (!q) { cb([]); return }
  _geneTimer = setTimeout(async () => {
    try {
      const resp = await analysisApi.searchRocGenes({ q, limit: 20 })
      cb((resp.data || []).map(g => ({ value: g })))
    } catch { cb([]) }
  }, 300)
}
const onGeneSelect = (item) => { if (item?.value) { geneSearch.value = item.value; loadData() } }
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

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      celltype: celltype.value || undefined,
      gene: geneSearch.value || undefined,
      min_auc: minAuc.value > 0.5 ? minAuc.value : undefined,
      page: page.value,
      limit: limit.value,
      sort: sort.value
    }
    const chartParams = {
      tab: activeTab.value,
      celltype: celltype.value || undefined,
      gene: geneSearch.value || undefined,
      min_auc: minAuc.value > 0.5 ? minAuc.value : undefined
    }
    const apiCall = activeTab.value === 'tn' ? analysisApi.getRocTn : analysisApi.getRocCelltype
    const [tableResp, chartResp] = await Promise.all([apiCall(params), analysisApi.getRocChart(chartParams)])
    rows.value = tableResp.data || []
    total.value = tableResp.pagination?.totalItems ?? (Array.isArray(tableResp.data) ? tableResp.data.length : 0)
    chartData.value = chartResp.data || []
    await nextTick()
    render()
  } finally {
    loading.value = false
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
