<template>
  <el-card class="clinical-card">
    <div class="controls">

    </div>
    <div ref="chartRef" style="height:320px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="gene" label="Gene" />
      <el-table-column prop="auc" label="AUC" />
      <el-table-column prop="label" label="Label" />
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
import clinicalApi from '@/services/clinical'
const chartRef = ref(null)
let chart
const gene = ref('')
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
  const pvals = top.map(r => Number(r.p_value || 1))
  const labels = Array.from(new Set(top.map(r => r.label))).filter(Boolean)
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 40, right: 40, bottom: 80 },
    xAxis: { type: 'category', data: genes },
    yAxis: [{ type: 'value', name: 'AUC', min: 0, max: 1 }, { type: 'value', name: '-log10(p)', position: 'right' }],
    legend: { data: ['AUC', '-log10(p)'] },
    series: [
      { type: 'bar', name: 'AUC', data: aucs, itemStyle: { color: '#ff7f0e' } },
      { type: 'line', name: '-log10(p)', yAxisIndex: 1, data: pvals.map(v => -Math.log10(v || 1)), smooth: true, itemStyle: { color: '#9467bd' } }
    ]
  })
}
const loadData = async () => {
  loading.value = true
  const params = { gene: gene.value || undefined, page: page.value, limit: limit.value }
  const resp = await clinicalApi.getDiagnosis(params)
  rows.value = resp.data || []
  total.value = resp.pagination?.totalItems ?? (Array.isArray(resp.data) ? resp.data.length : 0)
  await nextTick()
  render()
  loading.value = false
}
const handleResize = () => { if (chart) chart.resize() }
onMounted(() => { window.addEventListener('resize', handleResize); loadData() })
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
