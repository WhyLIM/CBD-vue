<template>
  <el-card class="analysis-card">
    <div ref="chartRef" style="height:520px; width:100%"></div>
    <div v-if="!rows.length" class="empty-hint">No interactions for current filters</div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="source" label="Source" />
      <el-table-column prop="target" label="Target" />
      <el-table-column prop="ligand" label="Ligand" />
      <el-table-column prop="receptor" label="Receptor" />
      <el-table-column prop="prob" label="Prob" />
      <el-table-column prop="pathway_name" label="Pathway" />
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
let chart
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const rows = ref([])
const loading = ref(false)
const render = () => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)
  const filtered = rows.value
  const nodes = Array.from(new Set(filtered.flatMap(r => [r.source, r.target]))).map(n => ({ name: n }))
  const agg = new Map()
  for (const r of filtered) {
    const key = `${r.source}||${r.target}`
    const v = Number(r.prob || 0)
    agg.set(key, (agg.get(key) || 0) + v)
  }
  const edges = Array.from(agg.entries()).map(([key, value]) => {
    const [source, target] = key.split('||')
    return { source, target, value }
  })
  try {
    chart.setOption({
      tooltip: {},
      legend: { top: 'bottom', left: 'center', orient: 'horizontal', padding: [10, 0, 0, 0] },
      series: [{
        type: 'chord',
        padAngle: 1,
        center: ['50%', '45%'],
        radius: ['68%', '85%'],
        data: nodes,
        itemStyle: { borderRadius: [0, 12], borderWidth: 2, borderColor: '#fff' },
        lineStyle: { opacity: 0.35, color: 'gradient' },
        emphasis: { focus: 'adjacency' },
        label: { show: true, position: 'inside', color: '#fff', fontWeight: 'bold', fontSize: 12 },
        links: edges
      }]
    })
  } catch {
    chart.setOption({
      tooltip: {},
      series: [{
        type: 'graph', layout: 'circular', roam: true,
        data: nodes,
        links: edges,
        label: { show: true, position: 'right', fontSize: 10 },
        lineStyle: { width: 2, color: '#7f7f7f' }
      }]
    })
  }
}
const loadData = async () => {
  loading.value = true
  const params = { page: page.value, limit: limit.value }
  const resp = await analysisApi.getCellChat(params)
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
.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px
}

.empty-hint {
  padding: 8px 12px;
  color: #666
}
</style>
