<template>
  <div class="explore">
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Bulk to Single Cell Resolution Explorer</h1>
            <p class="hero-subtitle">Integrates bulk cohorts and single-cell insights with advanced analytics</p>
          </div>
        </div>
      </div>
    </section>

    <section class="main-content">
      <div class="container">
        <el-row :gutter="24" class="main-container">
          <el-col :xs="24" :lg="8" class="control-aside">
            <div class="control-panel">
              <el-card class="control-card">
                <template #header>
                  <h3 class="panel-title"><font-awesome-icon :icon="['fas', 'cogs']" /> Controls</h3>
                </template>
                <div class="form-group">
                  <label class="form-label">Color By</label>
                  <el-select v-model="colorBy" filterable class="param-select">
                    <el-option v-for="f in colorFields" :key="f" :label="f" :value="f" />
                  </el-select>
                </div>
                <div class="form-group"><label class="form-label">Point Size</label><el-slider v-model="pointSize"
                    :min="1" :max="3" :step="1" /></div>
                <div class="form-group"><label class="form-label">Opacity</label><el-slider v-model="opacity" :min="0.1"
                    :max="1" :step="0.1" /></div>
                <div class="form-group"><el-switch v-model="showLegend" active-text="Show Legend" /></div>
                <div class="form-group">
                  <label class="form-label">SubCluster</label>
                  <el-select v-model="filters.subcluster" multiple filterable collapse-tags class="param-select">
                    <el-option v-for="v in options.SubCluster" :key="v" :label="v" :value="v" />
                  </el-select>
                </div>
                <div class="form-group">
                  <label class="form-label">Sample</label>
                  <el-select v-model="filters.sample" multiple filterable collapse-tags class="param-select">
                    <el-option v-for="v in options.Sample" :key="v" :label="v" :value="v" />
                  </el-select>
                </div>
                <div class="form-group">
                  <label class="form-label">Patient</label>
                  <el-select v-model="filters.patient" multiple filterable collapse-tags class="param-select">
                    <el-option v-for="v in options.Patient" :key="v" :label="v" :value="v" />
                  </el-select>
                </div>
                <div class="form-group">
                  <label class="form-label">Cells per load</label>
                  <el-input-number v-model="limit" :min="1000" :max="100000" :step="5000" class="param-select" />
                </div>
                <div class="form-group">
                  <label class="form-label">Gene Expression (Framework)</label>
                  <el-input v-model="gene" placeholder="Enter gene (placeholder)" disabled />
                </div>
                <div class="action-buttons">
                  <el-button type="primary" :loading="loading" @click="refreshData"
                    class="refresh-btn"><font-awesome-icon :icon="['fas', 'sync']" />
                    Refresh</el-button>
                  <el-dropdown @command="handleExportCommand">
                    <el-button type="default">
                      <font-awesome-icon :icon="['fas', 'download']" /> Export
                      <i class="el-icon-arrow-down" style="margin-left:8px"></i>
                    </el-button>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="csv">Export CSV</el-dropdown-item>
                        <el-dropdown-item command="png">Export PNG</el-dropdown-item>
                        <el-dropdown-item command="svg">Export SVG</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </el-card>


            </div>
          </el-col>

          <el-col :xs="24" :lg="16" class="main-area">
            <el-card class="network-card">
              <div class="chart-header">Cells: {{ stats?.count || data.length }}</div>
              <div ref="chartRef" class="visualization-panel" style="height:600px"></div>
              <div v-if="showLegend && legendItems.length && !(colorBy === 'nCount_RNA' || colorBy === 'nFeature_RNA')"
                class="legend-bar">
                <div v-for="item in legendItems" :key="item.value" class="legend-chip">
                  <span class="legend-swatch" :style="{ backgroundColor: item.color }"></span>
                  <span class="legend-text">{{ item.value }} ({{ item.count }})</span>
                </div>
              </div>
              <div v-if="showLegend && (colorBy === 'nCount_RNA' || colorBy === 'nFeature_RNA')"
                class="continuous-legend">
                <div class="legend-title">{{ colorBy }}</div>
                <div class="gradient-bar"></div>
                <div class="legend-scale"><span>{{ scaleMinMax.min }}</span><span>{{ scaleMinMax.max }}</span></div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </section>
    <section class="analysis-section">
      <div class="container">
        <el-card class="analysis-card">
          <template #header>
            <div class="chart-header">Single-Cell Analyses</div>
          </template>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="DEGs" name="degs" lazy>
              <DegsVolcano />
            </el-tab-pane>
            <el-tab-pane label="KEGG" name="kegg" lazy>
              <KeggBubble />
            </el-tab-pane>
            <el-tab-pane label="Ridge" name="ridge" lazy>
              <RidgeRanking />
            </el-tab-pane>
            <el-tab-pane label="Trajectory" name="traj" lazy>
              <TrajectoryGallery />
            </el-tab-pane>
            <el-tab-pane label="CellChat" name="cellchat" lazy>
              <CellChatNetwork />
            </el-tab-pane>
            <el-tab-pane label="Clinical: Diagnosis" name="diag" lazy>
              <DiagnosisAUC />
            </el-tab-pane>
            <el-tab-pane label="Clinical: Survival" name="surv" lazy>
              <SurvivalSignificance />
            </el-tab-pane>
            <el-tab-pane label="Clinical: Immune" name="immune" lazy>
              <ImmuneHeatmap />
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import scrnaApi from '@/services/scrna'
import { ElMessage } from 'element-plus'
import DegsVolcano from '@/components/analysis/DegsVolcano.vue'
import KeggBubble from '@/components/analysis/KeggBubble.vue'
import RidgeRanking from '@/components/analysis/RidgeRanking.vue'
import TrajectoryGallery from '@/components/analysis/TrajectoryGallery.vue'
import CellChatNetwork from '@/components/analysis/CellChatNetwork.vue'
import DiagnosisAUC from '@/components/clinical/DiagnosisAUC.vue'
import SurvivalSignificance from '@/components/clinical/SurvivalSignificance.vue'
import ImmuneHeatmap from '@/components/clinical/ImmuneHeatmap.vue'

const chartRef = ref(null)
let chart = null

const loading = ref(false)
const data = ref([])
const page = ref(1)
const limit = ref(30000)

const colorBy = ref('ParentalCluster')
const pointSize = ref(2)
const opacity = ref(0.8)
const showLegend = ref(true)
const gene = ref('')

const filters = ref({ subcluster: [], sample: [], patient: [] })
const options = ref({ SubCluster: [], Sample: [], Patient: [] })

const stats = ref(null)
const colorFields = ['GrandparentalCluster', 'ParentalCluster', 'SubCluster', 'Sample', 'Patient', 'Class', 'Dataset']
const legendItems = ref([])
const scaleMinMax = ref({ min: 0, max: 0 })
const activeTab = ref('degs')

const loadFilters = async () => {
  const resp = await scrnaApi.getFilters()
  if (resp.success) {
    const d = resp.data || {}
    options.value.SubCluster = d.SubCluster || []
    options.value.Sample = d.Sample || []
    options.value.Patient = d.Patient || []
  }
}

const refreshData = async () => {
  if (loading.value) return // 防止重复请求

  loading.value = true
  const params = { page: page.value, limit: limit.value, subcluster: filters.value.subcluster, sample: filters.value.sample, patient: filters.value.patient, colorBy: colorBy.value }

  try {
    const resp = await scrnaApi.getUmap(params)
    if (resp.success) {
      data.value = resp.data || []
      buildStats()
      await nextTick()
      renderChart()
    } else {
      ElMessage.error('Failed to load UMAP')
    }
  } catch (error) {
    console.error('UMAP refresh error:', error)
    ElMessage.error('Network error')
  } finally {
    loading.value = false
  }
}

const buildStats = () => {
  const count = data.value.length
  const map = {}
  data.value.forEach(r => {
    const key = r.SubCluster || 'Unknown'
    map[key] = (map[key] || 0) + 1
  })
  const top = Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count }))
  stats.value = { count, topClusters: top }
  buildLegend()
}

const buildLegend = () => {
  if (colorBy.value === 'nCount_RNA' || colorBy.value === 'nFeature_RNA') {
    const nums = data.value.map(r => Number(r[colorBy.value])).filter(n => isFinite(n))
    const min = nums.length ? Math.min(...nums) : 0
    const max = nums.length ? Math.max(...nums) : 0
    scaleMinMax.value = { min, max }
    legendItems.value = []
    return
  }

  const counter = new Map()
  data.value.forEach(r => {
    const key = r[colorBy.value] || 'Unknown'
    counter.set(key, (counter.get(key) || 0) + 1)
  })

  const items = Array.from(counter.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 50)
    .map(([value, count]) => ({ value, count, color: colorFor({ [colorBy.value]: value, color: null }) }))

  legendItems.value = items
}

const colorFor = (row) => {
  const attr = colorBy.value
  if (attr === 'SubCluster' && row.color) return row.color

  const val = row[attr]
  if (attr === 'nCount_RNA' || attr === 'nFeature_RNA') {
    const num = Number(val)
    if (!isFinite(num)) return '#7f7f7f'
    const max = scaleMinMax.value.max || (Math.max(...data.value.map(r => Number(r[attr]) || 0)) || 1)
    const min = scaleMinMax.value.min || 0
    const t = Math.max(0, Math.min(1, (num - min) / (max - min || 1)))
    const r = Math.round(255 * t)
    const b = Math.round(255 * (1 - t))
    return `rgb(${r},0,${b})`
  }

  const key = val || 'Unknown'
  const palette = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf']
  const h = Math.abs(Array.from(String(key)).reduce((s, c) => s + c.charCodeAt(0), 0))
  return palette[h % palette.length]
}

const renderChart = () => {
  if (!chartRef.value) return
  if (chart) chart.dispose()
  chart = echarts.init(chartRef.value)

  const discrete = !(colorBy.value === 'nCount_RNA' || colorBy.value === 'nFeature_RNA')
  let series = []

  if (discrete) {
    const groups = new Map()
    data.value.forEach(r => {
      const key = r[colorBy.value] || 'Unknown'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(r)
    })
    series = Array.from(groups.entries()).map(([name, rows]) => ({
      name,
      type: 'scatter',
      symbolSize: pointSize.value,
      progressive: 10000,
      itemStyle: { opacity: opacity.value, color: colorFor({ [colorBy.value]: name, color: null }) },
      data: rows.map(r => [r.x, r.y])
    }))
  } else {
    const seriesData = data.value.map(r => ({ value: [r.x, r.y], itemStyle: { color: colorFor(r) } }))
    series = [{ type: 'scatter', symbolSize: pointSize.value, progressive: 10000, itemStyle: { opacity: opacity.value }, data: seriesData }]
  }

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: p => {
        const r = discrete ? { [colorBy.value]: p.seriesName } : data.value[p.dataIndex]
        const lines = Object.keys(r).map(k => `${k}: ${r[k]}`)
        return lines.join('<br/>')
      }
    },
    xAxis: { type: 'value', scale: true },
    yAxis: { type: 'value', scale: true },
    legend: { show: false },
    grid: { top: 20, left: 40, right: 20, bottom: 20 },
    series,
  }
  chart.setOption(option)
}

const exportImage = (type) => {
  if (!chart) return
  const dataURL = chart.getDataURL({ type, pixelRatio: 2, backgroundColor: '#ffffff' })
  const link = document.createElement('a')
  link.href = dataURL
  link.download = `umap_${new Date().toISOString().split('T')[0]}.${type}`
  link.click()
}

const handleExportCommand = (cmd) => {
  if (cmd === 'csv') return exportCSV()
  if (cmd === 'png' || cmd === 'svg') return exportImage(cmd)
}

const exportCSV = async () => {
  const params = new URLSearchParams()
  filters.value.subcluster?.forEach(v => params.append('subcluster', v))
  filters.value.sample?.forEach(v => params.append('sample', v))
  filters.value.patient?.forEach(v => params.append('patient', v))
  params.append('format', 'csv')
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'
  const url = `${base}/scrna/export?${params.toString()}`
  window.open(url, '_blank')
}

onMounted(async () => { await loadFilters(); await refreshData() })
watch([colorBy, pointSize, opacity, showLegend], () => { if (data.value.length) { renderChart(); buildLegend() } })

// 防抖处理，避免频繁请求
let refreshTimeout = null
const debouncedRefresh = () => {
  if (refreshTimeout) clearTimeout(refreshTimeout)
  refreshTimeout = setTimeout(() => {
    refreshData()
  }, 300)
}

watch(() => limit.value, debouncedRefresh)
watch(() => filters.value, debouncedRefresh, { deep: true })
</script>

<style scoped>
.explore {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  padding: 40px 0;
}

.main-container {
  min-height: 600px;
  background: transparent;
}

.control-aside {
  background: transparent;
  padding-right: 20px;
  overflow: visible;
}

.main-area {
  padding: 0;
  background: transparent;
  overflow: visible;
}

.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.refresh-btn {
  background: var(--accent-gradient);
  border: none;
}

.control-card,
.stats-card,
.network-card,
.analysis-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 10px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.param-select {
  width: 100%;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-label {
  font-weight: 500;
  color: #2c3e50;
}

.stat-value {
  font-weight: 600;
  color: #667eea;
}

.visualization-panel {
  min-height: 600px;
}

.chart-header {
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  font-weight: 600;
  color: #2c3e50;
}

.analysis-section {
  padding: 20px 0
}

.analysis-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  margin-top: 10px
}

.legend-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 10px 15px 15px;
}

.legend-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #eee;
  border-radius: 16px;
  padding: 4px 8px;
  background: #fff;
}

.legend-swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.continuous-legend {
  padding: 10px 15px 15px;
}

.continuous-legend .legend-title {
  font-weight: 600;
  margin-bottom: 6px;
  color: #2c3e50;
}

.continuous-legend .gradient-bar {
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(to right, rgb(0, 0, 255), rgb(255, 0, 0));
  border: 1px solid #eee;
}

.continuous-legend .legend-scale {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #606266;
  margin-top: 6px;
}

@media (max-width: 768px) {
  .control-aside {
    width: 100% !important;
    padding-right: 0;
    padding-bottom: 20px;
    order: 2;
  }

  .main-area {
    order: 1;
    padding: 0;
  }
}
</style>
