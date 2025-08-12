<template>
  <div class="explore">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Data Exploration</h1>
            <p class="hero-subtitle">Gain deep insights into biomarker data distribution and trends through interactive
              visualizations</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Overview Statistics Section -->
    <section class="overview-section">
      <div class="container">
        <div class="overview-grid">
          <el-card class="overview-card" v-for="stat in overviewStats" :key="stat.key">
            <div class="stat-content">
              <div class="stat-icon">
                <font-awesome-icon :icon="stat.icon" />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
                <div class="stat-change" :class="stat.changeType">
                  <font-awesome-icon
                    :icon="stat.changeType === 'increase' ? ['fas', 'arrow-up'] : ['fas', 'arrow-down']" />
                  {{ stat.change }}
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </section>

    <!-- Charts Display Section -->
    <section class="charts-section">
      <div class="container">
        <div class="charts-grid">
          <!-- Category Distribution Chart -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="chart-title">
                  <font-awesome-icon :icon="['fas', 'chart-pie']" />
                  Biomarker Category Distribution
                </h3>
                <el-button-group size="small">
                  <el-button :type="categoryViewType === 'pie' ? 'primary' : 'default'"
                    @click="categoryViewType = 'pie'">
                    Pie Chart
                  </el-button>
                  <el-button :type="categoryViewType === 'bar' ? 'primary' : 'default'"
                    @click="categoryViewType = 'bar'">
                    Bar Chart
                  </el-button>
                </el-button-group>
              </div>
            </template>
            <div class="chart-container" ref="categoryChartRef"></div>
          </el-card>

          <!-- Year Trend Chart -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="chart-title">
                  <font-awesome-icon :icon="['fas', 'chart-line']" />
                  Publication Year Trends
                </h3>
                <el-select v-model="yearRangeFilter" size="small" style="width: 120px;">
                  <el-option label="Last 5 Years" value="5" />
                  <el-option label="Last 10 Years" value="10" />
                  <el-option label="All" value="all" />
                </el-select>
              </div>
            </template>
            <div class="chart-container" ref="yearTrendChartRef"></div>
          </el-card>

          <!-- Journal Distribution Chart -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="chart-title">
                  <font-awesome-icon :icon="['fas', 'book-open']" />
                  Top Journal Distribution
                </h3>
                <el-button size="small" @click="handleJournalDetail">
                  View Details
                </el-button>
              </div>
            </template>
            <div class="chart-container" ref="journalChartRef"></div>
          </el-card>

          <!-- Application Field Distribution -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="chart-title">
                  <font-awesome-icon :icon="['fas', 'flask']" />
                  Application Field Distribution
                </h3>
                <el-switch v-model="showPercentage" size="small" active-text="Percentage" inactive-text="Count" />
              </div>
            </template>
            <div class="chart-container" ref="applicationChartRef"></div>
          </el-card>

          <!-- Geographic Distribution Map -->
          <el-card class="chart-card full-width">
            <template #header>
              <div class="chart-header">
                <h3 class="chart-title">
                  <font-awesome-icon :icon="['fas', 'globe']" />
                  Research Institution Geographic Distribution
                </h3>
                <div class="chart-controls">
                  <el-select v-model="geoViewType" size="small" style="width: 100px;">
                    <el-option label="World" value="world" />
                    <el-option label="China" value="china" />
                  </el-select>
                  <el-button size="small" @click="handleGeoDetail">
                    Detailed Data
                  </el-button>
                </div>
              </div>
            </template>
            <div class="chart-container large" ref="geoChartRef"></div>
          </el-card>

          <!-- Quality Assessment Chart -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="chart-title">
                  <font-awesome-icon :icon="['fas', 'star']" />
                  Data Quality Assessment
                </h3>
                <el-tooltip content="Assessment based on sample size, validation status and other factors"
                  placement="top">
                  <font-awesome-icon :icon="['fas', 'question-circle']" class="help-icon" />
                </el-tooltip>
              </div>
            </template>
            <div class="chart-container" ref="qualityChartRef"></div>
          </el-card>

          <!-- Heatmap -->
          <el-card class="chart-card">
            <template #header>
              <div class="chart-header">
                <h3 class="chart-title">
                  <font-awesome-icon :icon="['fas', 'th']" />
                  Research Hotspot Heatmap
                </h3>
                <el-select v-model="heatmapMetric" size="small" style="width: 120px;">
                  <el-option label="Publication Count" value="count" />
                  <el-option label="Citation Count" value="citation" />
                </el-select>
              </div>
            </template>
            <div class="chart-container" ref="heatmapChartRef"></div>
          </el-card>
        </div>
      </div>
    </section>

    <!-- Data Insights Section -->
    <section class="insights-section">
      <div class="container">
        <el-card class="insights-card">
          <template #header>
            <h2 class="section-title">
              <font-awesome-icon :icon="['fas', 'lightbulb']" class="title-icon" />
              Data Insights
            </h2>
          </template>

          <div class="insights-grid">
            <div v-for="insight in dataInsights" :key="insight.id" class="insight-item">
              <div class="insight-icon">
                <font-awesome-icon :icon="insight.icon" />
              </div>
              <div class="insight-content">
                <h4 class="insight-title">{{ insight.title }}</h4>
                <p class="insight-description">{{ insight.description }}</p>
                <div class="insight-stats">
                  <span v-for="stat in insight.stats" :key="stat.label" class="insight-stat">
                    <strong>{{ stat.value }}</strong> {{ stat.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </section>

    <!-- Interactive Filter Section -->
    <section class="filter-section">
      <div class="container">
        <el-card class="filter-card">
          <template #header>
            <h2 class="section-title">
              <font-awesome-icon :icon="['fas', 'sliders-h']" class="title-icon" />
              Interactive Filters
            </h2>
          </template>

          <div class="filter-content">
            <el-row :gutter="20">
              <el-col :span="6">
                <div class="filter-group">
                  <label class="filter-label">Data Type</label>
                  <el-checkbox-group v-model="selectedCategories" @change="handleFilterChange">
                    <el-checkbox v-for="category in categories" :key="category" :label="category">
                      {{ category }}
                    </el-checkbox>
                  </el-checkbox-group>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="filter-group">
                  <label class="filter-label">Year Range</label>
                  <el-slider v-model="yearRange" range :min="2000" :max="2024" @change="handleFilterChange" />
                  <div class="range-labels">
                    <span>{{ yearRange[0] }}</span>
                    <span>{{ yearRange[1] }}</span>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="filter-group">
                  <label class="filter-label">Sample Size</label>
                  <el-slider v-model="sampleRange" range :min="0" :max="10000" :step="100"
                    @change="handleFilterChange" />
                  <div class="range-labels">
                    <span>{{ sampleRange[0] }}</span>
                    <span>{{ sampleRange[1] }}</span>
                  </div>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="filter-group">
                  <label class="filter-label">Validation Status</label>
                  <el-select v-model="validationFilter" multiple @change="handleFilterChange">
                    <el-option label="Validated" value="validated" />
                    <el-option label="Pending" value="pending" />
                    <el-option label="Experimental" value="experimental" />
                  </el-select>
                </div>
              </el-col>
            </el-row>

            <div class="filter-actions">
              <el-button type="primary" @click="handleApplyFilters">
                <font-awesome-icon :icon="['fas', 'search']" />
                Apply Filters
              </el-button>
              <el-button @click="handleResetFilters">
                <font-awesome-icon :icon="['fas', 'undo']" />
                Reset
              </el-button>
              <el-button @click="handleExportData">
                <font-awesome-icon :icon="['fas', 'download']" />
                Export Data
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

// Reactive data
const categoryChartRef = ref()
const yearTrendChartRef = ref()
const journalChartRef = ref()
const applicationChartRef = ref()
const geoChartRef = ref()
const qualityChartRef = ref()
const heatmapChartRef = ref()

const categoryViewType = ref('pie')
const yearRangeFilter = ref('10')
const showPercentage = ref(false)
const geoViewType = ref('world')
const heatmapMetric = ref('count')

const selectedCategories = ref(['Protein', 'Gene', 'MicroRNA'])
const yearRange = ref([2015, 2024])
const sampleRange = ref([0, 5000])
const validationFilter = ref(['validated', 'pending'])

const categories = ref(['Protein', 'Gene', 'MicroRNA', 'Metabolite', 'DNA', 'RNA'])

// Chart instances
let categoryChart = null
let yearTrendChart = null
let journalChart = null
let applicationChart = null
let geoChart = null
let qualityChart = null
let heatmapChart = null

// Statistics data
const overviewStats = ref([
  {
    key: 'total',
    label: 'Total Data',
    value: '15,420',
    icon: ['fas', 'database'],
    change: '+12.5%',
    changeType: 'increase'
  },
  {
    key: 'monthly',
    label: 'Monthly New',
    value: '1,234',
    icon: ['fas', 'plus-circle'],
    change: '+8.3%',
    changeType: 'increase'
  },
  {
    key: 'validated',
    label: 'Validated Data',
    value: '12,856',
    icon: ['fas', 'check-circle'],
    change: '+5.7%',
    changeType: 'increase'
  },
  {
    key: 'downloads',
    label: 'Download Count',
    value: '89,567',
    icon: ['fas', 'download'],
    change: '+15.2%',
    changeType: 'increase'
  }
])

const dataInsights = ref([
  {
    id: 1,
    title: 'Protein Biomarkers Dominate',
    description: 'Protein biomarkers account for 45% of total data, representing the most active research field',
    icon: ['fas', 'dna'],
    stats: [
      { label: 'Protein Biomarkers', value: '6,939' },
      { label: 'Growth Rate', value: '18%' }
    ]
  },
  {
    id: 2,
    title: 'Cancer Research Continues to Rise',
    description: 'Cancer-related biomarker research has shown rapid growth trends in the past 5 years',
    icon: ['fas', 'chart-line'],
    stats: [
      { label: 'Cancer Biomarkers', value: '4,567' },
      { label: 'Annual Growth', value: '22%' }
    ]
  },
  {
    id: 3,
    title: 'International Collaboration Strengthening',
    description: 'Cross-national collaborative research projects have increased significantly, improving data quality',
    icon: ['fas', 'globe'],
    stats: [
      { label: 'Collaborative Projects', value: '2,345' },
      { label: 'Countries Involved', value: '45' }
    ]
  },
  {
    id: 4,
    title: 'Validation Standards Improving',
    description: 'Standardization of data validation processes has continuously improved high-quality data ratios',
    icon: ['fas', 'shield-alt'],
    stats: [
      { label: 'Validation Rate', value: '83.4%' },
      { label: 'Quality Score', value: '4.2/5' }
    ]
  }
])

// Methods
const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)

  const updateChart = () => {
    const data = [
      { name: 'Protein', value: 6939 },
      { name: 'Gene', value: 4256 },
      { name: 'MicroRNA', value: 2134 },
      { name: 'Metabolite', value: 1567 },
      { name: 'DNA', value: 345 },
      { name: 'RNA', value: 179 }
    ]

    const option = categoryViewType.value === 'pie' ? {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        name: 'Biomarker Category',
        type: 'pie',
        radius: '50%',
        data: data,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    } : {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      xAxis: {
        type: 'category',
        data: data.map(item => item.name)
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: 'Count',
        type: 'bar',
        data: data.map(item => item.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#667eea' },
            { offset: 1, color: '#764ba2' }
          ])
        }
      }]
    }

    categoryChart.setOption(option)
  }

  updateChart()

  watch(categoryViewType, updateChart)
}

const initYearTrendChart = () => {
  if (!yearTrendChartRef.value) return

  yearTrendChart = echarts.init(yearTrendChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: 'Publication Count',
      type: 'line',
      data: [856, 1024, 1256, 1489, 1678, 1834, 2156, 2345, 2567, 2789],
      smooth: true,
      itemStyle: {
        color: '#667eea'
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
          { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
        ])
      }
    }]
  }

  yearTrendChart.setOption(option)
}

const initJournalChart = () => {
  if (!journalChartRef.value) return

  journalChart = echarts.init(journalChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'value'
    },
    yAxis: {
      type: 'category',
      data: ['Nature', 'Science', 'Cell', 'NEJM', 'Lancet', 'PNAS', 'JCI', 'Cancer Cell']
    },
    series: [{
      name: 'Publication Count',
      type: 'bar',
      data: [234, 198, 167, 145, 123, 98, 87, 76],
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      }
    }]
  }

  journalChart.setOption(option)
}

const initApplicationChart = () => {
  if (!applicationChartRef.value) return

  applicationChart = echarts.init(applicationChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    series: [{
      name: 'Application Field',
      type: 'pie',
      radius: ['40%', '70%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center'
      },
      emphasis: {
        label: {
          show: true,
          fontSize: '18',
          fontWeight: 'bold'
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 4567, name: 'Cancer Diagnosis' },
        { value: 2345, name: 'Cardiovascular Disease' },
        { value: 1567, name: 'Neurological Disease' },
        { value: 1234, name: 'Immune System Disease' },
        { value: 987, name: 'Metabolic Disease' },
        { value: 567, name: 'Others' }
      ]
    }]
  }

  applicationChart.setOption(option)
}

const initGeoChart = () => {
  if (!geoChartRef.value) return

  geoChart = echarts.init(geoChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item'
    },
    visualMap: {
      min: 0,
      max: 1000,
      left: 'left',
      top: 'bottom',
      text: ['High', 'Low'],
      calculable: true
    },
    series: [{
      name: 'Research Count',
      type: 'map',
      mapType: 'world',
      roam: false,
      label: {
        show: true
      },
      data: [
        { name: 'China', value: 2345 },
        { name: 'United States', value: 1876 },
        { name: 'Germany', value: 567 },
        { name: 'Japan', value: 456 },
        { name: 'United Kingdom', value: 345 }
      ]
    }]
  }

  geoChart.setOption(option)
}

const initQualityChart = () => {
  if (!qualityChartRef.value) return

  qualityChart = echarts.init(qualityChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    radar: {
      indicator: [
        { name: 'Sample Size', max: 100 },
        { name: 'Validation Status', max: 100 },
        { name: 'Data Completeness', max: 100 },
        { name: 'Citation Count', max: 100 },
        { name: 'Journal Impact Factor', max: 100 },
        { name: 'Experimental Reproducibility', max: 100 }
      ]
    },
    series: [{
      name: 'Data Quality',
      type: 'radar',
      data: [{
        value: [85, 92, 78, 88, 95, 82],
        name: 'Overall Quality Assessment'
      }]
    }]
  }

  qualityChart.setOption(option)
}

const initHeatmapChart = () => {
  if (!heatmapChartRef.value) return

  heatmapChart = echarts.init(heatmapChartRef.value)

  const hours = ['Cancer', 'Cardiovascular', 'Neurological', 'Immune', 'Metabolic', 'Genetic']
  const days = ['Protein', 'Gene', 'MicroRNA', 'Metabolite', 'DNA', 'RNA']

  const data = []
  for (let i = 0; i < hours.length; i++) {
    for (let j = 0; j < days.length; j++) {
      data.push([j, i, Math.floor(Math.random() * 100)])
    }
  }

  const option = {
    tooltip: {
      position: 'top'
    },
    grid: {
      height: '50%',
      top: '10%'
    },
    xAxis: {
      type: 'category',
      data: days,
      splitArea: {
        show: true
      }
    },
    yAxis: {
      type: 'category',
      data: hours,
      splitArea: {
        show: true
      }
    },
    visualMap: {
      min: 0,
      max: 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '15%'
    },
    series: [{
      name: 'Research Intensity',
      type: 'heatmap',
      data: data,
      label: {
        show: true
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }

  heatmapChart.setOption(option)
}

const handleFilterChange = () => {
  // Update charts when filters change
  console.log('Filter conditions changed')
}

const handleApplyFilters = () => {
  ElMessage.success('Filter conditions applied')
  // Reload chart data
}

const handleResetFilters = () => {
  selectedCategories.value = ['Protein', 'Gene', 'MicroRNA']
  yearRange.value = [2015, 2024]
  sampleRange.value = [0, 5000]
  validationFilter.value = ['validated', 'pending']
  ElMessage.info('Filter conditions reset')
}

const handleExportData = () => {
  ElMessage.info('Data export function under development...')
}

const handleJournalDetail = () => {
  ElMessage.info('Journal details function under development...')
}

const handleGeoDetail = () => {
  ElMessage.info('Geographic distribution details function under development...')
}

// Resize charts when window size changes
const handleResize = () => {
  nextTick(() => {
    categoryChart?.resize()
    yearTrendChart?.resize()
    journalChart?.resize()
    applicationChart?.resize()
    geoChart?.resize()
    qualityChart?.resize()
    heatmapChart?.resize()
  })
}

onMounted(() => {
  nextTick(() => {
    initCategoryChart()
    initYearTrendChart()
    initJournalChart()
    initApplicationChart()
    initGeoChart()
    initQualityChart()
    initHeatmapChart()
  })

  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.explore {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Overview Statistics Section */
.overview-section {
  padding: 40px 0;
  background: white;
  border-bottom: 1px solid #eee;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.overview-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-change.increase {
  color: #27ae60;
}

.stat-change.decrease {
  color: #e74c3c;
}

/* Charts Section Styles */
.charts-section {
  padding: 40px 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.chart-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: 10px;
}

.help-icon {
  color: #999;
  cursor: help;
}

.chart-container {
  height: 300px;
  margin-top: 20px;
}

.chart-container.large {
  height: 400px;
}

/* Data Insights Section */
.insights-section {
  padding: 40px 0;
}

.insights-card {
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.insights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 20px;
}

.insight-item {
  display: flex;
  gap: 15px;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.insight-icon {
  width: 50px;
  height: 50px;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.insight-content {
  flex: 1;
}

.insight-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 8px 0;
}

.insight-description {
  color: #5a6c7d;
  line-height: 1.5;
  margin: 0 0 12px 0;
  font-size: 0.9rem;
}

.insight-stats {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.insight-stat {
  font-size: 0.8rem;
  color: #666;
}

.insight-stat strong {
  color: #667eea;
  font-weight: 700;
}

/* Filter Section */
.filter-section {
  padding: 40px 0;
}

.filter-card {
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.title-icon {
  color: #667eea;
}

.filter-content {
  margin-top: 20px;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 0.9rem;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 0.8rem;
  color: #666;
}

.filter-actions {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  display: flex;
  gap: 15px;
  justify-content: center;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }

  .chart-controls {
    justify-content: center;
  }

  .insights-grid {
    grid-template-columns: 1fr;
  }

  .insight-item {
    flex-direction: column;
    text-align: center;
  }

  .filter-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .hero-section {
    padding: 60px 0 40px;
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: 10px;
  }

  .chart-container {
    height: 250px;
  }

  .chart-container.large {
    height: 300px;
  }

  .insight-stats {
    justify-content: center;
  }
}
</style>
