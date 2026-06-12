<template>
  <el-card class="analysis-card">
    <el-tabs v-model="activeTab" @tab-change="onTabChange">
      <el-tab-pane label="Gallery" name="gallery" />
      <el-tab-pane label="Interactive Pseudotime" name="pseudotime" />
    </el-tabs>

    <!-- Gallery Tab (original behavior) -->
    <template v-if="activeTab === 'gallery'">
      <div class="controls">
        <el-select v-model="cellType" placeholder="Cell Type" filterable style="width:200px" @change="loadData">
          <el-option v-for="ct in cellTypes" :key="ct" :label="ct" :value="ct" />
        </el-select>
        <el-select v-model="plotType" placeholder="Plot Type" filterable style="width:200px" @change="loadData">
          <el-option v-for="pt in plotTypes" :key="pt" :label="pt" :value="pt" />
        </el-select>
      </div>
      <div class="cards-grid" :class="{ single: singleLayout }" v-loading="loading">
        <el-card v-for="f in pagedFiles" :key="f.file_path" class="thumb-card" :class="cardClass">
          <template #header>
            <div class="card-header">
              <span>{{ titleFor(f) }}</span>
              <el-tag type="info">{{ f.cell_type }}</el-tag>
            </div>
          </template>
          <div class="thumb">
            <img :src="toUrl(f.file_path)" alt="trajectory" />
          </div>
          <div class="actions">
            <el-button size="small" @click="open(f)">Open</el-button>
          </div>
        </el-card>
      </div>
      <div class="pagination">
        <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="pageSizeOptions" :total="total"
          layout="total, sizes, prev, pager, next" @current-change="loadData" @size-change="loadData" />
      </div>
    </template>

    <!-- Interactive Pseudotime Tab -->
    <template v-if="activeTab === 'pseudotime'">
      <div class="controls">
        <el-select v-model="ptCellType" placeholder="Cell Type" filterable style="width:200px" @change="loadPseudotime">
          <el-option v-for="ct in pseudotimeCellTypes" :key="ct" :label="ct" :value="ct" />
        </el-select>
        <el-select v-model="plotMode" placeholder="Plot Mode" style="width:180px" @change="onPlotModeChange">
          <el-option label="By State" value="state" />
          <el-option label="By Pseudotime" value="pseudotime" />
          <el-option label="Gene Expression" value="gene_expr" />
        </el-select>
        <el-autocomplete v-if="plotMode === 'gene_expr'" v-model="ptGene" :fetch-suggestions="queryGeneSearch"
          placeholder="Gene symbol" clearable style="width: 180px"
          @select="onGeneSelect" @clear="loadPseudotime" />
      </div>
      <div ref="ptChartRef" v-loading="ptLoading" style="height: 480px; width: 100%"></div>
    </template>
  </el-card>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import analysisApi from '@/services/analysis'

// --- Shared ---
const activeTab = ref('gallery')

// --- Gallery state (unchanged) ---
const cellTypes = ref([])
const plotTypes = ref([])
const cellType = ref('')
const plotType = ref('')
const page = ref(1)
const limit = ref(1)
const total = ref(0)
const files = ref([])
const loading = ref(false)
const toUrl = (p) => p.startsWith('http') ? p : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}/${p.replace(/^\//, '')}`
const open = (f) => window.open(toUrl(f.file_path), '_blank')
const isGeneTraj = (pt) => String(pt || '').toLowerCase().includes('gene')
const singleLayout = computed(() => plotType.value === 'umap_manual' || isGeneTraj(plotType.value))
const cardClass = computed(() => ({ largeUmap: plotType.value === 'umap_manual', largeGene: isGeneTraj(plotType.value) }))
const pageSizeOptions = computed(() => isGeneTraj(plotType.value) ? [3, 6, 9] : [1, 2, 4])
const pagedFiles = computed(() => {
  const start = (page.value - 1) * limit.value
  return files.value.slice(start, start + limit.value)
})
const titleFor = (f) => isGeneTraj(plotType.value || f.plot_type) ? (f.gene || 'Gene') : (f.plot_type || '')
watch(() => plotType.value, () => {
  if (isGeneTraj(plotType.value)) { limit.value = 3 } else { limit.value = 1 }
  page.value = 1
  loadData()
})
watch(() => cellType.value, () => { page.value = 1; loadData() })
const loadData = async () => {
  loading.value = true
  const params = { cell_type: cellType.value || undefined, plot_type: plotType.value || undefined }
  const resp = await analysisApi.getTrajectoryFiles(params)
  files.value = resp.data || []
  total.value = resp.data?.length || 0
  loading.value = false
}

// --- Interactive Pseudotime state ---
const pseudotimeCellTypes = ref([])
const ptCellType = ref('')
const ptGene = ref('')
const plotMode = ref('state')
const ptLoading = ref(false)
const ptTrajectory = ref([])
const ptGeneExpr = ref([])
const ptChartRef = ref(null)
let ptChart = null

const stateColors = [
  '#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de',
  '#3ba272', '#fc8452', '#9a60b4', '#ea7ccc', '#48b8d0'
]

const renderPtChart = () => {
  if (!ptChartRef.value || ptChartRef.value.clientWidth === 0 || ptChartRef.value.clientHeight === 0) return
  if (ptChart) ptChart.dispose()
  ptChart = echarts.init(ptChartRef.value)

  const data = ptTrajectory.value
  if (!data.length) {
    ptChart.setOption({ title: { text: 'No data', left: 'center', top: 'middle', textStyle: { color: '#999' } } })
    return
  }

  const sorted = [...data].sort((a, b) => a.pseudotime - b.pseudotime)

  if (plotMode.value === 'state') {
    const states = [...new Set(sorted.map(d => d.state))]
    const colorMap = {}
    states.forEach((s, i) => { colorMap[s] = stateColors[i % stateColors.length] })
    ptChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: p => `Cell: ${p.data[3]}<br/>Pseudotime: ${p.data[0].toFixed(3)}<br/>State: ${p.data[4]}`
      },
      xAxis: { name: 'Pseudotime', type: 'value' },
      yAxis: { name: 'State', type: 'category', data: states },
      grid: { top: 20, left: 80, right: 20, bottom: 30 },
      series: [{
        type: 'scatter',
        data: sorted.map(d => [d.pseudotime, d.state, colorMap[d.state], d.cell_id, d.state]),
        symbolSize: 6,
        itemStyle: { color: p => p.data[2] }
      }]
    })
  } else if (plotMode.value === 'pseudotime') {
    ptChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: p => `Index: ${p.data[0]}<br/>Pseudotime: ${p.data[1].toFixed(3)}`
      },
      visualMap: {
        min: 0, max: Math.max(...sorted.map(d => d.pseudotime), 0.01),
        inRange: { color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026'] },
        textStyle: { fontSize: 10 }, right: 10, top: 20, bottom: 20, itemHeight: 120
      },
      xAxis: { name: 'Index', type: 'value' },
      yAxis: { name: 'Pseudotime', type: 'value' },
      grid: { top: 20, left: 60, right: 60, bottom: 30 },
      series: [{
        type: 'scatter',
        data: sorted.map((d, i) => [i, d.pseudotime]),
        symbolSize: 5,
        itemStyle: { opacity: 0.8 }
      }]
    })
  } else {
    // Gene Expression mode
    const exprMap = {}
    ptGeneExpr.value.forEach(d => { exprMap[d.cell_id] = d.expr })
    const merged = sorted.map(d => ({ ...d, expr: exprMap[d.cell_id] ?? null })).filter(d => d.expr !== null)
    if (!merged.length) {
      ptChart.setOption({ title: { text: 'No expression data', left: 'center', top: 'middle', textStyle: { color: '#999' } } })
      return
    }
    const exprVals = merged.map(d => d.expr)
    const minExpr = Math.min(...exprVals)
    const maxExpr = Math.max(...exprVals)
    // 颜色映射函数：expr → 颜色
    const colorRange = ['#313695', '#4575b4', '#74add1', '#abd9e9', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
    const range = maxExpr - minExpr || 1
    const interpColor = (v) => {
      const t = Math.max(0, Math.min(1, (v - minExpr) / range))
      const idx = t * (colorRange.length - 1)
      const lo = Math.floor(idx)
      const hi = Math.min(lo + 1, colorRange.length - 1)
      const frac = idx - lo
      // 简单 hex 插值
      const parse = (c, i) => parseInt(c.slice(1 + i * 2, 3 + i * 2), 16)
      const r = Math.round(parse(colorRange[lo], 0) + (parse(colorRange[hi], 0) - parse(colorRange[lo], 0)) * frac)
      const g = Math.round(parse(colorRange[lo], 1) + (parse(colorRange[hi], 1) - parse(colorRange[lo], 1)) * frac)
      const b = Math.round(parse(colorRange[lo], 2) + (parse(colorRange[hi], 2) - parse(colorRange[lo], 2)) * frac)
      return `rgb(${r},${g},${b})`
    }
    ptChart.setOption({
      tooltip: {
        trigger: 'item',
        formatter: p => `Pseudotime: ${p.value[0].toFixed(3)}<br/>Expression: ${p.value[1].toFixed(3)}`
      },
      visualMap: {
        dimension: 1,
        min: minExpr, max: maxExpr || 1,
        inRange: { color: colorRange },
        textStyle: { fontSize: 10 }, right: 10, top: 20, bottom: 20, itemHeight: 120
      },
      xAxis: { name: 'Pseudotime', type: 'value' },
      yAxis: { name: 'Expression', type: 'value' },
      grid: { top: 20, left: 60, right: 60, bottom: 30 },
      series: [{
        type: 'scatter',
        data: merged.map(d => [d.pseudotime, d.expr]),
        symbolSize: 4,
        itemStyle: { color: (p) => interpColor(p.value[1]), opacity: 0.8 }
      }]
    })
  }
}

const loadPseudotime = async () => {
  if (!ptCellType.value) return
  ptLoading.value = true
  try {
    const fetchExpr = plotMode.value === 'gene_expr' && ptGene.value
    const [trajResp, exprResp] = await Promise.all([
      analysisApi.getPseudotimeTrajectory({ cell_type: ptCellType.value }),
      fetchExpr
        ? analysisApi.getPseudotimeGeneExpr({ cell_type: ptCellType.value, gene: ptGene.value })
        : Promise.resolve({ data: [] })
    ])
    ptTrajectory.value = trajResp.data || []
    ptGeneExpr.value = exprResp.data || []
    await nextTick()
    renderPtChart()
  } catch (e) {
    console.error('[PT] loadPseudotime error', e)
  } finally {
    ptLoading.value = false
  }
}

const onPlotModeChange = () => {
  loadPseudotime()
}

const onGeneSelect = (item) => {
  if (item && item.value) ptGene.value = item.value
  loadPseudotime()
}

// 基因自动补全
let _geneSearchTimer = null
const queryGeneSearch = (queryString, cb) => {
  clearTimeout(_geneSearchTimer)
  const q = queryString.trim()
  if (!q) { cb([]); return }
  _geneSearchTimer = setTimeout(async () => {
    try {
      const resp = await analysisApi.searchPseudotimeGenes({ q, limit: 20 })
      cb((resp.data || []).map(g => ({ value: g })))
    } catch (e) { cb([]) }
  }, 300)
}

const onTabChange = (name) => {
  if (name === 'pseudotime' && ptTrajectory.value.length === 0 && ptCellType.value) {
    loadPseudotime()
  }
}

// --- Resize handling ---
const handleResize = () => {
  if (ptChart) { ptChart.resize() } else { renderPtChart() }
}
let ro

onMounted(async () => {
  window.addEventListener('resize', handleResize)

  const f = await analysisApi.getFilters()
  cellTypes.value = f.data?.trajectoryCellTypes || []
  plotTypes.value = f.data?.plotTypes || []
  pseudotimeCellTypes.value = f.data?.pseudotimeCellTypes || []

  if (!cellType.value && cellTypes.value.length) { cellType.value = 'b_plasma' }
  if (!plotType.value && plotTypes.value.length) { plotType.value = 'umap_manual' }
  if (!ptCellType.value && pseudotimeCellTypes.value.length) { ptCellType.value = pseudotimeCellTypes.value[0] }

  loadData()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (ro && ptChartRef.value) ro.unobserve(ptChartRef.value)
  if (ptChart) ptChart.dispose()
})

// Set up ResizeObserver when pseudotime tab becomes visible
watch(activeTab, async (val) => {
  if (val === 'pseudotime') {
    await nextTick()
    if (ptChartRef.value && !ro) {
      ro = new ResizeObserver(() => { if (ptChart) ptChart.resize(); else renderPtChart() })
      ro.observe(ptChartRef.value)
    }
    if (ptTrajectory.value.length === 0 && ptCellType.value) {
      loadPseudotime()
    }
  }
})
</script>

<style scoped>
.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 8px
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px
}

.cards-grid.single {
  grid-template-columns: 1fr
}

.thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  overflow: hidden
}

.thumb-card.largeUmap .thumb {
  height: 480px
}

.thumb-card.largeGene .thumb {
  height: 280px
}

.thumb img {
  max-width: 100%;
  max-height: 100%
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center
}

.actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px
}
</style>
