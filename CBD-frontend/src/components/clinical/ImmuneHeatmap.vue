<template>
  <el-card class="clinical-card">
    <div class="controls">

    </div>
    <div ref="chartRef" style="height:360px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="gene" label="Gene" />
      <el-table-column prop="immune_cell" label="Immune Cell" />
      <el-table-column prop="r2" label="R2" />
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
  const genes = Array.from(new Set(rows.value.map(r => r.gene)))
  const cells = Array.from(new Set(rows.value.map(r => r.immune_cell)))
  const matrix = cells.map(cell => genes.map(g => { const found = rows.value.find(r => r.gene === g && r.immune_cell === cell); return Number(found?.r2 || 0) }))
  chart.setOption({
    tooltip: { trigger: 'item', formatter: p => `Cell: ${cells[p.value[1]]}<br/>Gene: ${genes[p.value[0]]}<br/>R2: ${p.value[2]}` },
    xAxis: { type: 'category', data: genes }, yAxis: { type: 'category', data: cells }, grid: { top: 20, left: 80, right: 20, bottom: 60 },
    visualMap: { min: 0, max: 1, orient: 'vertical', right: 10, top: 'middle' },
    series: [{ type: 'heatmap', data: matrix.flatMap((row, i) => row.map((v, j) => [j, i, v])), progressive: 10000 }]
  })
}
const loadData = async () => {
  loading.value = true
  const params = { gene: gene.value || undefined, page: page.value, limit: limit.value }
  const resp = await clinicalApi.getImmune(params)
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
