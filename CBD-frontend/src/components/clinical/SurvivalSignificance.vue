<template>
  <el-card class="clinical-card">
    <div class="controls">

    </div>
    <div ref="chartRef" style="height:420px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="gene" label="Gene" />
      <el-table-column prop="surv_type" label="Type" />
      <el-table-column prop="surv_pvalue" label="p" />
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
  // build grouped horizontal bars per surv_type
  const byGene = new Map()
  rows.value.forEach(r => {
    const g = r.gene
    const p = Number(r.surv_pvalue || 1)
    const type = r.surv_type || 'Unknown'
    if (!byGene.has(g)) byGene.set(g, [])
    byGene.get(g).push({ type, p })
  })
  const genes = Array.from(byGene.entries())
    .map(([g, arr]) => ({ g, pmin: Math.min(...arr.map(a => Number(a.p) || 1)) }))
    .sort((a, b) => a.pmin - b.pmin)
    .slice(0, 25)
    .map(x => x.g)
  const types = Array.from(new Set(rows.value.map(r => r.surv_type || 'Unknown')))
  const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b']
  const series = types.map((t, i) => ({
    type: 'bar', name: t, data: genes.map(g => {
      const arr = (byGene.get(g) || []).filter(a => a.type === t)
      const p = arr.length ? Math.min(...arr.map(a => Number(a.p) || 1)) : 1
      return -Math.log10(p)
    }),
    barMaxWidth: 16,
    barGap: '20%',
    itemStyle: { color: palette[i % palette.length] }
  }))
  chart.setOption({
    tooltip: { trigger: 'axis' },
    grid: { top: 20, left: 80, right: 20, bottom: 40 },
    xAxis: { type: 'value', name: '-log10(p)' },
    yAxis: { type: 'category', data: genes },
    legend: { right: 10, top: 10 },
    series
  })
}
const loadData = async () => {
  loading.value = true
  const params = { gene: gene.value || undefined, page: page.value, limit: limit.value }
  const resp = await clinicalApi.getSurvival(params)
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
