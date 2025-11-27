<template>
  <div class="advanced-search">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Advanced Search</h1>
            <p class="hero-subtitle">Precisely query biomarker data using multiple search criteria and filters</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Form Section -->
    <section class="search-form-section">
      <div class="container">
        <el-form :model="searchForm" ref="searchFormRef" label-width="140px" class="advanced-form">
          <!-- Basic Information Search -->
          <div class="form-section">
            <h3 class="section-title">
              <font-awesome-icon :icon="['fas', 'info-circle']" />
              Basic Information
            </h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Biomarker">
                  <el-input v-model="searchForm.biomarker" placeholder="Enter biomarker name" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Category">
                  <el-select v-model="searchForm.category" placeholder="Select category" clearable multiple>
                    <el-option v-for="category in filterOptions.categories" :key="category" :label="category"
                      :value="category" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="String Name">
                  <el-input v-model="searchForm.string_name" placeholder="Enter String name" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Description">
                  <el-input v-model="searchForm.description" placeholder="Enter description keywords" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Region">
                  <el-select v-model="searchForm.region" placeholder="Select region" clearable>
                    <el-option v-for="region in filterOptions.regions" :key="region" :label="region" :value="region" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Race">
                  <el-select v-model="searchForm.race" placeholder="Select race" clearable>
                    <el-option v-for="race in filterOptions.races" :key="race" :label="race" :value="race" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Location">
                  <el-input v-model="searchForm.location" placeholder="Enter location information" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Stage">
                  <el-select v-model="searchForm.stage" placeholder="Select stage" clearable>
                    <el-option v-for="stage in filterOptions.stages" :key="stage" :label="stage" :value="stage" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Source">
                  <el-select v-model="searchForm.source" placeholder="Select source" clearable>
                    <el-option v-for="source in filterOptions.sources" :key="source" :label="source" :value="source" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Experiment Method">
                  <el-select v-model="searchForm.experiment" placeholder="Select experiment method" clearable>
                    <el-option v-for="experiment in filterOptions.experiments" :key="experiment" :label="experiment"
                      :value="experiment" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Application">
                  <el-input v-model="searchForm.application" placeholder="Enter application field" clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Clinical Use">
                  <el-select v-model="searchForm.clinical_use" placeholder="Select clinical use status" clearable>
                    <el-option label="Yes" value="Yes" />
                    <el-option label="No" value="No" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Is Target">
                  <el-select v-model="searchForm.target" placeholder="Select if target" clearable>
                    <el-option label="Yes" :value="1" />
                    <el-option label="No" :value="0" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Drugs">
                  <el-input v-model="searchForm.drugs" placeholder="Enter related drugs" clearable />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- Sample Information Search -->
          <div class="form-section">
            <h3 class="section-title">
              <font-awesome-icon :icon="['fas', 'users']" />
              Sample Information
            </h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Total Sample Size">
                  <div class="range-input">
                    <el-input-number v-model="searchForm.number_min" placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number v-model="searchForm.number_max" placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Male Sample Size">
                  <div class="range-input">
                    <el-input-number v-model="searchForm.male_min" placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number v-model="searchForm.male_max" placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Female Sample Size">
                  <div class="range-input">
                    <el-input-number v-model="searchForm.female_min" placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number v-model="searchForm.female_max" placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Average Age">
                  <div class="range-input">
                    <el-input-number v-model="searchForm.age_mean_min" placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number v-model="searchForm.age_mean_max" placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Age Range">
                  <div class="range-input">
                    <el-input-number v-model="searchForm.age_min" placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number v-model="searchForm.age_max" placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- Literature Information Search -->
          <div class="form-section">
            <h3 class="section-title">
              <font-awesome-icon :icon="['fas', 'book']" />
              Literature Information
            </h3>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="First Author">
                  <el-input v-model="searchForm.reference_first_author" placeholder="Enter first author name"
                    clearable />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Journal Name">
                  <el-input v-model="searchForm.reference_journal" placeholder="Enter journal name" clearable />
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Publication Year">
                  <div class="range-input">
                    <el-date-picker v-model="searchForm.reference_year_range" type="yearrange" unlink-panels
                      range-separator="To" style="width: 100%" start-placeholder="Start Year" end-placeholder="End Year"
                      :default-value="[new Date(1900, 0, 1), new Date(new Date().getFullYear(), 11, 31)]" />
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="PMID">
                  <el-input v-model="searchForm.pmid" placeholder="Enter PMID" clearable />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- Keyword Search -->
          <div class="form-section">
            <h3 class="section-title">
              <font-awesome-icon :icon="['fas', 'search']" />
              Keyword Search
            </h3>
            <el-row :gutter="20">
              <el-col :span="24">
                <el-form-item label="Keywords">
                  <el-input v-model="searchForm.keywords" placeholder="Enter keywords to search across multiple fields"
                    clearable type="textarea" :rows="2" />
                </el-form-item>
              </el-col>
            </el-row>
          </div>

          <!-- Search Actions -->
          <div class="form-actions">
            <el-button type="primary" @click="handleSearch" :loading="loading" size="large" class="search-btn">
              <font-awesome-icon :icon="['fas', 'search']" />&nbsp;Start Search
            </el-button>
            <el-button @click="handleReset" size="large">
              <font-awesome-icon :icon="['fas', 'undo']" />&nbsp;Reset
            </el-button>
            <el-button @click="handleSaveSearch" size="large" type="info">
              <font-awesome-icon :icon="['fas', 'bookmark']" />&nbsp;Save Conditions
            </el-button>
          </div>
        </el-form>
      </div>
    </section>

    <!-- Search Results Section -->
    <section v-if="searchResults.length > 0" class="results-section">
      <div class="container">
        <!-- Results Overview Cards -->
        <div class="results-overview">
          <el-card class="overview-card" v-for="stat in resultStats" :key="stat.key">
            <div class="stat-content">
              <div class="stat-icon">
                <font-awesome-icon :icon="stat.icon" />
              </div>
              <div class="stat-info">
                <div class="stat-number">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- Charts Section -->
        <div class="charts-section" v-if="showCharts">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <h3 class="chart-title">
                      <font-awesome-icon :icon="['fas', 'chart-pie']" />
                      Category Distribution
                    </h3>
                    <el-button-group size="small">
                      <el-button :type="categoryViewType === 'pie' ? 'primary' : 'default'"
                        @click="categoryViewType = 'pie'">
                        Pie
                      </el-button>
                      <el-button :type="categoryViewType === 'bar' ? 'primary' : 'default'"
                        @click="categoryViewType = 'bar'">
                        Bar
                      </el-button>
                    </el-button-group>
                  </div>
                </template>
                <div class="chart-container" ref="categoryChartRef"></div>
              </el-card>
            </el-col>
            <el-col :span="12">
              <el-card class="chart-card">
                <template #header>
                  <div class="chart-header">
                    <h3 class="chart-title">
                      <font-awesome-icon :icon="['fas', 'chart-line']" />
                      Publication Trends
                    </h3>
                  </div>
                </template>
                <div class="chart-container" ref="yearTrendChartRef"></div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <el-card class="results-card">
          <template #header>
            <div class="results-header">
              <h3 class="results-title">
                <font-awesome-icon :icon="['fas', 'list-ul']" />
                Search Results ({{ totalResults }} items)
              </h3>
              <div class="results-actions">
                <el-button @click="toggleCharts" size="small" :type="showCharts ? 'primary' : 'default'">
                  <font-awesome-icon :icon="['fas', 'chart-bar']" />
                  {{ showCharts ? 'Hide Charts' : 'Show Charts' }}
                </el-button>
                <el-button-group class="view-toggle">
                  <el-button :type="viewMode === 'table' ? 'primary' : 'default'" @click="viewMode = 'table'"
                    size="small">
                    <font-awesome-icon :icon="['fas', 'list']" />
                    Table View
                  </el-button>
                  <el-button :type="viewMode === 'card' ? 'primary' : 'default'" @click="viewMode = 'card'"
                    size="small">
                    <font-awesome-icon :icon="['fas', 'th-large']" />
                    Card View
                  </el-button>
                </el-button-group>
                <el-button type="success" @click="handleExport" size="small">
                  <font-awesome-icon :icon="['fas', 'download']" />
                  Export Results
                </el-button>
                <el-select v-model="sortBy" @change="handleSort" size="small" style="width: 150px;">
                  <el-option v-for="option in sortOptions" :key="option.value" :label="option.label"
                    :value="option.value" />
                </el-select>
              </div>
            </div>
          </template>

          <!-- Table View -->
          <div v-if="viewMode === 'table'" class="table-view">
            <el-table :data="searchResults" v-loading="loading" @row-click="handleResultClick" class="biomarkers-table"
              stripe highlight-current-row>
              <el-table-column prop="ID" label="ID" width="80" sortable />
              <el-table-column prop="Biomarker" label="Biomarker" width="140" sortable />
              <el-table-column prop="Category" label="Category" width="120">
                <template #default="{ row }">
                  <el-tag :type="getCategoryTagType(row.Category)" size="small">
                    {{ row.Category }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="Application" label="Application" min-width="200" />
              <el-table-column prop="Location" label="Location" width="150" />
              <el-table-column prop="Source" label="Source" width="100" />
              <el-table-column prop="Reference_first_author" label="Author" width="150" />
              <el-table-column prop="Reference_journal" label="Journal" width="180" />
              <el-table-column prop="Reference_year" label="Year" width="80" sortable />
              <el-table-column prop="Clinical_Use" label="Clinical Use" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.Clinical_Use === 'Yes' ? 'success' : 'info'" size="small">
                    {{ row.Clinical_Use === 'Yes' ? 'Yes' : 'No' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- Card View -->
          <div v-else class="card-view">
            <div class="cards-grid" v-loading="loading">
              <el-card v-for="result in searchResults" :key="result.ID" class="biomarker-card"
                @click="handleResultClick(result)">
                <template #header>
                  <div class="card-header">
                    <h3 class="biomarker-name">{{ result.Biomarker }}</h3>
                    <el-tag :type="getCategoryTagType(result.Category)" class="category-tag">
                      {{ result.Category }}
                    </el-tag>
                  </div>
                </template>

                <div class="card-content">
                  <div class="info-row" v-if="result.Discription">
                    <font-awesome-icon :icon="['fas', 'info-circle']" class="info-icon" />
                    <span class="info-label">Description:</span>
                    <span class="info-value">{{ result.Discription }}</span>
                  </div>
                  <div class="info-row" v-if="result.Application">
                    <font-awesome-icon :icon="['fas', 'flask']" class="info-icon" />
                    <span class="info-label">Application:</span>
                    <span class="info-value">{{ result.Application }}</span>
                  </div>
                  <div class="info-row" v-if="result.Location">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="info-icon" />
                    <span class="info-label">Location:</span>
                    <span class="info-value">{{ result.Location }}</span>
                  </div>
                  <div class="info-row" v-if="result.Source">
                    <font-awesome-icon :icon="['fas', 'dna']" class="info-icon" />
                    <span class="info-label">Source:</span>
                    <span class="info-value">{{ result.Source }}</span>
                  </div>
                  <div class="info-row" v-if="result.Number">
                    <font-awesome-icon :icon="['fas', 'users']" class="info-icon" />
                    <span class="info-label">Sample Size:</span>
                    <span class="info-value">{{ result.Number }}</span>
                  </div>
                  <div class="info-row" v-if="result.Clinical_Use">
                    <font-awesome-icon :icon="['fas', 'hospital']" class="info-icon" />
                    <span class="info-label">Clinical Use:</span>
                    <el-tag :type="result.Clinical_Use === 'Yes' ? 'success' : 'info'" size="small">
                      {{ result.Clinical_Use === 'Yes' ? 'Yes' : 'No' }}
                    </el-tag>
                  </div>
                  <div class="info-row reference-row">
                    <font-awesome-icon :icon="['fas', 'book']" class="info-icon" />
                    <span class="info-label">Reference:</span>
                    <span class="info-value">
                      {{ result.Reference_first_author }} et al.,
                      {{ result.Reference_journal }}
                      ({{ result.Reference_year }})
                    </span>
                  </div>
                </div>
              </el-card>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination-section">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]" :total="totalResults" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageSizeChange" @current-change="handlePageChange" />
          </div>
        </el-card>
      </div>
    </section>

    <!-- Empty State -->
    <section v-else-if="hasSearched && !loading" class="empty-state">
      <div class="container">
        <el-card class="empty-card">
          <div class="empty-content">
            <font-awesome-icon :icon="['fas', 'search']" class="empty-icon" />
            <h3 class="empty-title">No matching results found</h3>
            <p class="empty-description">Try adjusting your search criteria or using different keywords</p>
            <el-button type="primary" @click="handleReset">
              Search Again
            </el-button>
          </div>
        </el-card>
      </div>
    </section>

    <!-- Loading State -->
    <section v-else-if="loading" class="loading-state">
      <div class="container">
        <el-card class="loading-card">
          <div class="loading-content">
            <el-icon class="is-loading loading-icon">
              <font-awesome-icon :icon="['fas', 'spinner']" />
            </el-icon>
            <h3 class="loading-title">Searching...</h3>
            <p class="loading-description">Please wait while we search through the database</p>
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBiomarkerStore } from '@/stores/biomarker'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

const router = useRouter()
const route = useRoute()
const biomarkerStore = useBiomarkerStore()

// Reactive data
const loading = ref(false)
const hasSearched = ref(false)
const searchFormRef = ref()
const currentPage = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)
const sortBy = ref('relevance')
const viewMode = ref('table')
const showCharts = ref(true) // Default to showing charts

// Chart refs
const categoryChartRef = ref(null)
const yearTrendChartRef = ref(null)

// Chart instances
let categoryChart = null
let yearTrendChart = null

// Chart view types
const categoryViewType = ref('pie')

const searchForm = reactive({
  biomarker: '',
  category: [],
  string_name: '',
  description: '',
  region: '',
  race: '',
  location: '',
  stage: '',
  source: '',
  experiment: '',
  application: '',
  clinical_use: '',
  target: '',
  drugs: '',
  number_min: '',
  number_max: '',
  male_min: '',
  male_max: '',
  female_min: '',
  female_max: '',
  age_mean_min: '',
  age_mean_max: '',
  age_min: '',
  age_max: '',
  reference_first_author: '',
  reference_journal: '',
  reference_year_from: '',
  reference_year_to: '',
  reference_year_range: '',
  pmid: '',
  keywords: ''
})

const searchResults = ref([])
const filterOptions = ref({
  categories: [],
  sources: [],
  stages: [],
  experiments: [],
  regions: [],
  races: []
})

const sortOptions = ref([
  { value: 'relevance', label: 'Relevance' },
  { value: 'biomarker_asc', label: 'Biomarker Name (A-Z)' },
  { value: 'biomarker_desc', label: 'Biomarker Name (Z-A)' },
  { value: 'year_desc', label: 'Year (Newest)' },
  { value: 'year_asc', label: 'Year (Oldest)' },
  { value: 'number_desc', label: 'Sample Size (Most)' },
  { value: 'number_asc', label: 'Sample Size (Least)' }
])

// Results statistics
const resultStats = computed(() => [
  {
    key: 'total',
    label: 'Total Results',
    value: totalResults.value.toLocaleString(),
    icon: ['fas', 'database']
  },
  {
    key: 'categories',
    label: 'Categories',
    value: getUniqueCategories().length,
    icon: ['fas', 'tags']
  },
  {
    key: 'validated',
    label: 'Validated',
    value: getValidatedCount(),
    icon: ['fas', 'check-circle']
  },
  {
    key: 'recent',
    label: 'Recent (5 years)',
    value: getRecentCount(),
    icon: ['fas', 'clock']
  }
])

// Helper functions for statistics
const getUniqueCategories = () => {
  const categories = new Set()
  searchResults.value.forEach(result => {
    if (result.Category) categories.add(result.Category)
  })
  return Array.from(categories)
}

const getValidatedCount = () => {
  return searchResults.value.filter(result => result.Clinical_Use === 'Yes').length
}

const getRecentCount = () => {
  const currentYear = new Date().getFullYear()
  return searchResults.value.filter(result =>
    result.Reference_year && (currentYear - result.Reference_year) <= 5
  ).length
}

// Chart initialization functions
const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)

  const updateChart = () => {
    const categoryData = getUniqueCategories().map(category => ({
      name: category,
      value: searchResults.value.filter(result => result.Category === category).length
    }))

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
        name: 'Category Distribution',
        type: 'pie',
        radius: '50%',
        data: categoryData,
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
        data: categoryData.map(item => item.name)
      },
      yAxis: {
        type: 'value'
      },
      series: [{
        name: 'Count',
        type: 'bar',
        data: categoryData.map(item => item.value),
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

  const yearData = {}
  searchResults.value.forEach(result => {
    if (result.Reference_year) {
      yearData[result.Reference_year] = (yearData[result.Reference_year] || 0) + 1
    }
  })

  const sortedYears = Object.keys(yearData).sort()
  const yearCounts = sortedYears.map(year => yearData[year])

  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: sortedYears
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      name: 'Publication Count',
      type: 'line',
      data: yearCounts,
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

const toggleCharts = () => {
  showCharts.value = !showCharts.value
  if (showCharts.value) {
    nextTick(() => {
      initCategoryChart()
      initYearTrendChart()
    })
  }
}

// 搜索方法
const handleSearch = async () => {
  loading.value = true
  hasSearched.value = true

  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      sort: sortBy.value,
      ...searchForm
    }

    // 清理空值和处理特殊格式
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)) {
        delete params[key]
      }
    })

    // 处理年份范围
    if (params.reference_year_range && Array.isArray(params.reference_year_range)) {
      params.reference_year_from = params.reference_year_range[0]?.getFullYear() || null;
      params.reference_year_to = params.reference_year_range[1]?.getFullYear() || null;
      delete params.reference_year_range;
    }

    console.log('Search params:', params);

    try {
      const response = await biomarkerStore.advancedSearch(params)

      if (response.success) {
        searchResults.value = response.data || []
        totalResults.value = response.pagination.total || 0
        ElMessage.success(`Found ${totalResults.value} matching results`)

        // Initialize charts if they are visible
        if (showCharts.value) {
          nextTick(() => {
            initCategoryChart()
            initYearTrendChart()
          })
        }
      } else {
        throw new Error(response.message || 'Search failed')
      }
    } catch (apiError) {
      console.error('API error:', apiError)
      ElMessage.warning('Unable to connect to the server. Using demo data instead.')

      // 使用演示数据
      searchResults.value = getDemoSearchResults()
      totalResults.value = searchResults.value.length

      // Initialize charts with demo data
      if (showCharts.value && showCharts.value) {
        nextTick(() => {
          initCategoryChart()
          initYearTrendChart()
        })
      }
    }
  } catch (error) {
    console.error('Search failed:', error)
    ElMessage.error('Search failed, please try again later')
    searchResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}

// 获取演示搜索结果
const getDemoSearchResults = () => {
  return [
    {
      id: 1,
      Biomarker: 'TP53',
      Category: 'Protein',
      Application: 'Diagnosis, Prognosis',
      Location: 'Colon, Rectum',
      Source: 'Tissue',
      Discription: 'Tumor suppressor protein p53 is a key regulator of cell cycle and apoptosis in colorectal cancer.',
      Reference_first_author: 'Smith',
      Reference_journal: 'Nature Genetics',
      Reference_year: 2020,
      PMID: '12345678',
      Region: 'Asia',
      Stage: 'Stage II-III',
      Number: 120
    },
    {
      id: 2,
      Biomarker: 'KRAS',
      Category: 'Protein',
      Application: 'Diagnosis, Treatment Response',
      Location: 'Colon',
      Source: 'Blood',
      Discription: 'KRAS is a proto-oncogene that encodes a small GTPase involved in cellular signaling pathways.',
      Reference_first_author: 'Johnson',
      Reference_journal: 'Cell',
      Reference_year: 2021,
      PMID: '23456789',
      Region: 'Europe',
      Stage: 'Stage I-IV',
      Number: 85
    },
    {
      id: 3,
      Biomarker: 'miR-21',
      Category: 'MicroRNA',
      Application: 'Prognosis, Treatment Response',
      Location: 'Colon, Rectum',
      Source: 'Serum',
      Discription: 'MicroRNA-21 is frequently overexpressed in colorectal cancer and associated with poor prognosis.',
      Reference_first_author: 'Brown',
      Reference_journal: 'Cancer Research',
      Reference_year: 2022,
      PMID: '34567890',
      Region: 'North America',
      Stage: 'Stage II-IV',
      Number: 150
    },
    {
      id: 4,
      Biomarker: 'CEA',
      Category: 'Protein',
      Application: 'Diagnosis, Monitoring',
      Location: 'Colon, Rectum',
      Source: 'Serum',
      Discription: 'Carcinoembryonic antigen is a glycoprotein involved in cell adhesion and is elevated in colorectal cancer.',
      Reference_first_author: 'Davis',
      Reference_journal: 'Clinical Chemistry',
      Reference_year: 2019,
      PMID: '45678901',
      Region: 'Global',
      Stage: 'Stage I-IV',
      Number: 200
    },
    {
      id: 5,
      Biomarker: 'APC',
      Category: 'Gene',
      Application: 'Diagnosis, Risk Assessment',
      Location: 'Colon, Rectum',
      Source: 'Tissue',
      Discription: 'Adenomatous polyposis coli gene mutations are found in most colorectal cancers.',
      Reference_first_author: 'Wilson',
      Reference_journal: 'Nature Medicine',
      Reference_year: 2023,
      PMID: '56789012',
      Region: 'Global',
      Stage: 'Stage I-III',
      Number: 95
    }
  ]
}

// 重置表单
const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    biomarker: '',
    category: [],
    string_name: '',
    description: '',
    region: '',
    race: '',
    location: '',
    stage: '',
    source: '',
    experiment: '',
    application: '',
    clinical_use: '',
    target: '',
    drugs: '',
    number_min: '',
    number_max: '',
    male_min: '',
    male_max: '',
    female_min: '',
    female_max: '',
    age_mean_min: '',
    age_mean_max: '',
    age_min: '',
    age_max: '',
    reference_first_author: '',
    reference_journal: '',
    reference_year_from: '',
    reference_year_to: '',
    pmid: '',
    keywords: ''
  })
  searchResults.value = []
  hasSearched.value = false
  currentPage.value = 1
}

// 排序处理
const handleSort = () => {
  if (hasSearched.value) {
    handleSearch()
  }
}

// 分页处理
const handlePageChange = (page) => {
  currentPage.value = page
  handleSearch()
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  handleSearch()
}

// 点击结果行
const handleResultClick = (result) => {
  router.push(`/biomarkers/${result.ID}`)
}

// 保存搜索条件
const handleSaveSearch = () => {
  const searchConditions = { ...searchForm }
  localStorage.setItem('savedSearchConditions', JSON.stringify(searchConditions))
  ElMessage.success('Search conditions saved successfully')
}

// 导出结果
const handleExport = () => {
  ElMessage.info('Export function is under development...')
}

// Resize charts when window size changes
const handleResize = () => {
  nextTick(() => {
    categoryChart?.resize()
    yearTrendChart?.resize()
  })
}

// 获取分类标签类型
const getCategoryTagType = (category) => {
  const typeMap = {
    'Protein': 'primary',
    'MicroRNA': 'success',
    'Gene': 'warning',
    'Metabolite': 'info',
    'DNA': 'danger',
    'RNA': 'success'
  }
  return typeMap[category] || 'default'
}

// 加载筛选选项
const loadFilterOptions = async () => {
  try {
    const response = await biomarkerStore.getFilterOptions()
    if (response.success) {
      filterOptions.value = response.data
    }
  } catch (error) {
    console.error('加载筛选选项失败:', error)
    // 使用默认筛选选项
    filterOptions.value = {
      categories: ['Protein', 'Gene', 'MicroRNA', 'Metabolite', 'DNA', 'RNA'],
      sources: ['Tissue', 'Blood', 'Serum', 'Plasma', 'Urine', 'Saliva'],
      stages: ['Stage I', 'Stage II', 'Stage III', 'Stage IV'],
      experiments: ['PCR', 'Western Blot', 'ELISA', 'Immunohistochemistry', 'Mass Spectrometry'],
      regions: ['Asia', 'Europe', 'North America', 'South America', 'Africa', 'Oceania', 'Global'],
      races: ['Asian', 'Caucasian', 'African', 'Hispanic', 'Mixed']
    }
    ElMessage.warning('Failed to load filter options from server. Using default options instead.')
  }
}

onMounted(() => {
  // 加载筛选选项
  loadFilterOptions()

  // 尝试加载保存的搜索条件
  const saved = localStorage.getItem('savedSearchConditions')
  if (saved) {
    try {
      const conditions = JSON.parse(saved)
      Object.assign(searchForm, conditions)
    } catch (error) {
      console.error('Failed to load saved search conditions:', error)
    }
  }

  // 如果URL中有查询参数，应用它们
  if (route.query.q) {
    searchForm.biomarker = route.query.q
    handleSearch()
  }

  // Add window resize listener
  window.addEventListener('resize', handleResize)
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  categoryChart?.dispose()
  yearTrendChart?.dispose()
})
</script>

<style scoped>
.advanced-search {
  min-height: 100vh;
  background: var(--bg-secondary);
}

/* Search Form Section */
.search-form-section {
  padding: 40px 0;
}

.section-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  border-bottom: 2px solid var(--border-light);
  padding-bottom: var(--spacing-sm);
}

.form-section {
  margin-bottom: var(--spacing-xl);
}

.range-input {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.range-separator {
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0 var(--spacing-xs);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-default);
}

.search-btn {
  font-weight: 600;
  padding: var(--spacing-sm) var(--spacing-xl);
}

/* Results Overview */
.results-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.overview-card {
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
}

.overview-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-color);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  background: var(--accent-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: var(--font-size-xl);
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

/* Charts Section */
.charts-section {
  margin-bottom: var(--spacing-xl);
}

.chart-card {
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--border-default);
  background: var(--bg-tertiary);
}

.chart-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.chart-container {
  height: 300px;
  padding: var(--spacing-md);
}

/* Results Section */
.results-section {
  padding: 0 0 var(--spacing-2xl);
}

.results-card {
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.results-title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.results-actions {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

/* Table View */
.table-view {
  margin: var(--spacing-lg) 0;
}

.biomarkers-table {
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* Card View */
.card-view {
  padding: var(--spacing-lg) 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--spacing-lg);
}

.biomarker-card {
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
}

.biomarker-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--accent-color);
}

.biomarker-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.category-tag {
  margin-left: var(--spacing-sm);
}

.info-row {
  display: flex;
  margin-bottom: var(--spacing-sm);
  align-items: flex-start;
}

.info-icon {
  margin-right: var(--spacing-sm);
  color: var(--accent-color);
  width: 16px;
  margin-top: 3px;
}

.info-label {
  font-weight: 600;
  margin-right: var(--spacing-xs);
  color: var(--text-secondary);
  min-width: 80px;
}

.info-value {
  flex: 1;
  color: var(--text-primary);
  word-break: break-word;
}

.reference-row {
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-sm);
  border-top: 1px dashed var(--border-default);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md) 0;
}

/* Empty State */
.empty-state,
.loading-state {
  padding: var(--spacing-2xl) 0;
}

.empty-card,
.loading-card {
  text-align: center;
  padding: var(--spacing-2xl);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
}

.empty-content,
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.empty-icon,
.loading-icon {
  font-size: 3rem;
  color: var(--accent-color);
  margin-bottom: var(--spacing-md);
}

.empty-title,
.loading-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.empty-description,
.loading-description {
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
  max-width: 400px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: var(--font-size-3xl);
  }

  .results-overview {
    grid-template-columns: 1fr;
  }

  .charts-section .el-row {
    flex-direction: column;
  }

  .chart-header {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }

  .results-header {
    flex-direction: column;
    align-items: stretch;
  }

  .results-actions {
    justify-content: center;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .range-input {
    flex-direction: column;
    align-items: stretch;
  }

  .range-separator {
    text-align: center;
    margin: var(--spacing-xs) 0;
  }

  .form-actions {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 480px) {
  .advanced-form {
    padding: var(--spacing-lg);
  }

  .stat-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }

  .chart-container {
    height: 250px;
  }
}
</style>
