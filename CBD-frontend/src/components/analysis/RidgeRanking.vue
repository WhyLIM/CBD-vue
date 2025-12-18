<template>
  <el-card class="analysis-card">
    <div class="controls">
      <el-select v-model="cellType" placeholder="Cell Type" filterable @change="loadData">
        <el-option v-for="ct in cellTypes" :key="ct" :label="ct" :value="ct" />
      </el-select>
    </div>
    <div ref="chartRef" style="height:360px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="gene" label="Gene" />
      <el-table-column prop="auc" label="AUC" />
      <el-table-column prop="p_value" label="p" />
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[10, 20, 50]" :total="total"
        layout="total, sizes, prev, pager, next" @current-change="loadData" @size-change="loadData" />
    </div>
  </el-card>
</template>
<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
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
const render = () => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  const top = rows.value.slice(0, 30)
  const genes = top.map(r => r.gene)
  const aucs = top.map(r => Number(r.auc))
  const pvals = top.map(r => -Math.log10(Number(r.p_value || 1)))
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 40, right: 40, bottom: 80 },
    xAxis: { type: 'category', data: genes },
    yAxis: [{ type: 'value', name: 'AUC', min: 0, max: 1 }, { type: 'value', name: '-log10(p)', position: 'right' }],
    series: [
      { type: 'bar', name: 'AUC', data: aucs, itemStyle: { color: '#2ca02c' } },
      { type: 'line', name: '-log10(p)', yAxisIndex: 1, data: pvals, smooth: true, itemStyle: { color: '#d62728' } }
    ]
  })
}
const loadData = async () => {
  loading.value = true
  const params = { cell_type: cellType.value || undefined, page: page.value, limit: limit.value }
  const resp = await analysisApi.getRidge(params)
  rows.value = resp.data || []
  total.value = resp.pagination?.totalItems ?? (Array.isArray(resp.data) ? resp.data.length : 0)
  await nextTick()
  render()
  loading.value = false
}
const handleResize = () => { if (chart) chart.resize() }
onMounted(async () => {
  window.addEventListener('resize', handleResize)
  try {
    const f = await analysisApi.getFilters()
    cellTypes.value = f.data?.ridgeCellTypes || []
    if (!cellType.value && cellTypes.value.length) cellType.value = cellTypes.value[0]
  } catch (e) {
    console.error('Failed to load filters:', e)
  }
  loadData()
})
onUnmounted(() => { window.removeEventListener('resize', handleResize); if (chart) chart.dispose() })
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
