<template>
  <el-card class="analysis-card">
    <div class="controls">
      <el-select v-model="cellType" placeholder="Cell Type" filterable @change="loadData">
        <el-option v-for="ct in cellTypes" :key="ct" :label="ct" :value="ct" />
      </el-select>
    </div>
    <div ref="chartRef" style="height:360px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px" @sort-change="handleSort">
      <el-table-column prop="gene" label="Gene" sortable="custom" />
      <el-table-column prop="logFC" label="logFC" sortable="custom" />
      <el-table-column prop="pval_adj" label="padj" sortable="custom" />
      <el-table-column prop="neg_log10_padj" label="-log10(padj)" sortable="custom" />
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[10, 20, 50]" :total="total"
        layout="total, sizes, prev, pager, next" @current-change="loadData" @size-change="loadData" />
    </div>
  </el-card>
</template>
<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import analysisApi from '@/services/analysis'
const chartRef = ref(null)
let chart = null
const cellTypes = ref([])
const cellType = ref('')
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const rows = ref([])
const loading = ref(false)
const sort = ref('neg_log10_padj_desc')
const render = () => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  const data = rows.value.map(r => [Number(r.logFC), Number(r.neg_log10_padj), r.gene, Number(r.pval_adj)])
  chart.setOption({
    tooltip: { trigger: 'item', formatter: p => `Gene: ${p.data[2]}<br/>logFC: ${p.data[0]}<br/>-log10(padj): ${p.data[1]}` },
    xAxis: { name: 'logFC' }, yAxis: { name: '-log10(padj)' }, grid: { top: 20, left: 40, right: 20, bottom: 30 },
    series: [{ type: 'scatter', data, symbolSize: 8, itemStyle: { color: p => (p.data[3] < 0.05 && Math.abs(p.data[0]) > 1) ? '#d62728' : '#1f77b4' } }]
  })
}
const loadData = async () => {
  loading.value = true
  const params = { cell_type: cellType.value || undefined, page: page.value, limit: limit.value, sort: sort.value }
  const resp = await analysisApi.getDegs(params)
  rows.value = resp.data || []
  total.value = resp.pagination?.totalItems ?? (Array.isArray(resp.data) ? resp.data.length : 0)
  await nextTick()
  render()
  loading.value = false
}
const handleSort = ({ prop, order }) => {
  if (!order) return
  if (prop === 'logFC' && order === 'descending') sort.value = 'logfc_desc'
  else if (prop === 'pval_adj' && order === 'ascending') sort.value = 'pval_adj_asc'
  else sort.value = 'neg_log10_padj_desc'
  loadData()
}
const handleResize = () => {
  if (chart) {
    chart.resize()
  } else {
    render()
  }
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
    if (!cellType.value && cellTypes.value.length) cellType.value = cellTypes.value[0]
  } catch (e) {
    console.error('Failed to load filters:', e)
  }
  loadData()
})
onUnmounted(() => { window.removeEventListener('resize', handleResize); if (ro && chartRef.value) ro.unobserve(chartRef.value); if (chart) chart.dispose() })
watch([cellType], () => { page.value = 1; loadData() })
</script>
<style scoped>
.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 8px
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px
}
</style>
