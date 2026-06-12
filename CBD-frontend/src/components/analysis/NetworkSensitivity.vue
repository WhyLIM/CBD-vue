<template>
  <el-card class="analysis-card">
    <div class="controls">
      <el-select v-model="celltype" placeholder="Celltype" filterable clearable style="width:200px" @change="loadData">
        <el-option v-for="ct in celltypes" :key="ct" :label="ct" :value="ct" />
      </el-select>
      <el-autocomplete v-model="geneSearch" :fetch-suggestions="queryGeneSearch" placeholder="Search gene" clearable style="width:180px" @select="onGeneSelect" @clear="loadData" />
    </div>
    <div ref="chartRef" style="height:400px; width:100%"></div>
    <el-table :data="rows" v-loading="loading" size="small" style="margin-top:10px">
      <el-table-column prop="gene" label="Gene" />
      <el-table-column prop="celltype" label="Celltype" />
      <el-table-column prop="deg" label="Deg">
        <template #default="{ row }">{{ Number(row.deg).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="eff" label="Eff">
        <template #default="{ row }">{{ Number(row.eff).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="sens" label="Sens">
        <template #default="{ row }">{{ Number(row.sens).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="trans" label="Trans">
        <template #default="{ row }">{{ Number(row.trans).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="eigenvec_centr" label="Eigenvec Centrality">
        <template #default="{ row }">{{ Number(row.eigenvec_centr).toFixed(4) }}</template>
      </el-table-column>
      <el-table-column prop="closeness_centr" label="Closeness Centrality">
        <template #default="{ row }">{{ Number(row.closeness_centr).toFixed(4) }}</template>
      </el-table-column>
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
const celltypes = ref([])
const celltype = ref('')
const geneSearch = ref('')
let _geneTimer = null
const queryGeneSearch = (qs, cb) => {
  clearTimeout(_geneTimer)
  const q = qs.trim()
  if (!q) { cb([]); return }
  _geneTimer = setTimeout(async () => {
    try {
      const resp = await analysisApi.searchPrsGenes({ q, limit: 20 })
      cb((resp.data || []).map(g => ({ value: g })))
    } catch { cb([]) }
  }, 300)
}
const onGeneSelect = (item) => { if (item?.value) { geneSearch.value = item.value; loadData() } }
const page = ref(1)
const limit = ref(20)
const total = ref(0)
const rows = ref([])
const loading = ref(false)

const render = () => {
  if (!chartRef.value || chartRef.value.clientWidth === 0 || chartRef.value.clientHeight === 0) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const data = rows.value.map(r => ({
    name: r.gene,
    value: [Number(r.sens), Number(r.deg), Number(r.eigenvec_centr), Number(r.closeness_centr)],
    _row: r
  })).filter(d => isFinite(d.value[0]) && isFinite(d.value[1]))

  if (!data.length) {
    chart.setOption({ title: { text: 'No data', left: 'center', top: 'center', textStyle: { color: '#999', fontSize: 14 } } })
    return
  }

  const eigenValues = data.map(d => d.value[2]).filter(v => v > 0)
  const closeValues = data.map(d => d.value[3])
  const minClose = Math.min(...closeValues)
  const maxClose = Math.max(...closeValues)
  const maxEigen = eigenValues.length ? Math.max(...eigenValues) : 1

  const markLines = []
  const sensValues = data.map(d => d.value[0])
  const sensMin = Math.min(...sensValues)
  const sensMax = Math.max(...sensValues)
  const thresholds = [0]
  for (const t of thresholds) {
    if (t >= sensMin && t <= sensMax) {
      markLines.push({ xAxis: t, lineStyle: { type: 'dashed', color: '#999' }, label: { formatter: `sens=${t}` } })
    }
  }

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params) => {
        const r = params.data._row
        return `<b>${r.gene}</b><br/>Celltype: ${r.celltype}<br/>Sens: ${Number(r.sens).toFixed(4)}<br/>Deg: ${Number(r.deg).toFixed(4)}<br/>Eff: ${Number(r.eff).toFixed(4)}<br/>Trans: ${Number(r.trans).toFixed(4)}`
      }
    },
    grid: { top: 30, right: 30, bottom: 40, left: 50 },
    xAxis: { name: 'Sensitivity', type: 'value' },
    yAxis: { name: 'Degree', type: 'value' },
    visualMap: {
      min: minClose,
      max: maxClose,
      dimension: 3,
      inRange: { color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'] },
      text: ['High', 'Low'],
      right: 0,
      top: 'middle',
      calculable: true
    },
    series: [{
      type: 'scatter',
      data,
      symbolSize: (val) => 6 + Math.min(30, Math.max(4, (val[2] / maxEigen) * 30)),
      markLine: markLines.length ? { silent: true, data: markLines } : undefined
    }]
  })
}

const loadData = async () => {
  loading.value = true
  try {
    const params = {
      celltype: celltype.value || undefined,
      gene: geneSearch.value || undefined,
      page: page.value,
      limit: limit.value
    }
    const resp = await analysisApi.getPrs(params)
    rows.value = resp.data || []
    total.value = resp.pagination?.totalItems ?? (Array.isArray(resp.data) ? resp.data.length : 0)
    await nextTick()
    render()
  } finally {
    loading.value = false
  }
}

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
    celltypes.value = f.data?.prsCelltypes || []
    if (!celltype.value && celltypes.value.length) celltype.value = celltypes.value[0]
  } catch (e) {
    console.error('Failed to load filters:', e)
  }
  loadData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (ro && chartRef.value) ro.unobserve(chartRef.value)
  if (chart) chart.dispose()
})
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
