<template>
  <el-card class="analysis-card">
    <div class="controls">
      <el-select v-model="cellType" placeholder="Cell Type" filterable @change="loadData">
        <el-option v-for="ct in cellTypes" :key="ct" :label="ct" :value="ct" />
      </el-select>
    </div>
    <div ref="chartRef" style="height:360px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="description" label="Pathway" />
      <el-table-column prop="fold_enrichment" label="Fold" />
      <el-table-column prop="p_adjust" label="Adj.P" />
    </el-table>
    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[10, 20, 50]" :total="total"
        layout="total, sizes, prev, pager, next" @current-change="loadData" @size-change="loadData" />
    </div>
    <div v-if="!rows.length" class="empty-hint">No KEGG records for current filters</div>
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
  const bubbles = rows.value.map(r => {
    const fold = Number(r.fold_enrichment ?? r.rich_factor ?? 0)
    const padj = Number(r.p_adjust ?? r.pvalue ?? 1)
    const ids = (r.gene_ids || '').split(/[\s,\/]+/).filter(Boolean)
    const size = ids.length || Number(r.count || 1)
    return { name: r.description || r.kegg_id || 'Pathway', value: [fold, -Math.log10(padj > 0 ? padj : 1), size] }
  }).filter(b => isFinite(b.value[0]) && isFinite(b.value[1]))
  const topBar = rows.value
    .slice()
    .sort((a, b) => (Number(a.p_adjust ?? a.pvalue ?? 1)) - (Number(b.p_adjust ?? b.pvalue ?? 1)))
    .slice(0, 15)
    .map(r => ({ name: r.description || r.kegg_id || 'Pathway', val: -Math.log10(Number(r.p_adjust ?? r.pvalue ?? 1)) }))
  chart.setOption({
    tooltip: { trigger: 'item' },
    grid: [
      { left: 40, right: '55%', top: 10, bottom: 20 },
      { left: '57%', right: 20, top: 10, bottom: 20 }
    ],
    xAxis: [
      { name: 'Fold', gridIndex: 0 },
      { type: 'category', gridIndex: 1, data: topBar.map(d => d.name), axisLabel: { rotate: 45 } }
    ],
    yAxis: [
      { name: '-log10(padj)', gridIndex: 0 },
      { type: 'value', name: '-log10(padj)', gridIndex: 1 }
    ],
    visualMap: { show: false, min: 0, max: Math.max(10, Math.max(...bubbles.map(b => b.value[2]) || [10])) },
    series: [
      { type: 'scatter', xAxisIndex: 0, yAxisIndex: 0, data: bubbles, symbolSize: d => 6 + Math.min(24, d[2]), itemStyle: { color: '#9467bd' } },
      { type: 'bar', xAxisIndex: 1, yAxisIndex: 1, data: topBar.map(d => d.val), itemStyle: { color: '#8c564b' } }
    ]
  })
}
const loadData = async () => {
  loading.value = true
  const params = { cell_type: cellType.value || undefined, page: page.value, limit: limit.value }
  const resp = await analysisApi.getKegg(params)
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
    cellTypes.value = f.data?.keggCellTypes || []
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

.empty-hint {
  padding: 8px 12px;
  color: #666
}
</style>
