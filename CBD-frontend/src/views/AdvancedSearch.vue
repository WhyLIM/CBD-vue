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
                  <el-select v-model="searchForm.category" placeholder="Select category" clearable multiple
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
                    <el-option v-for="category in filterOptions.categories" :key="category" :label="category"
                      :value="category" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Symbol">
                  <el-input v-model="searchForm.string_name" placeholder="Enter gene symbol" clearable />
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
                  <el-select v-model="searchForm.region" placeholder="Select region" clearable
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
                    <el-option v-for="region in filterOptions.regions" :key="region" :label="region" :value="region" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Race">
                  <el-select v-model="searchForm.race" placeholder="Select race" clearable
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
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
                  <el-select v-model="searchForm.stage" placeholder="Select stage" clearable
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
                    <el-option v-for="stage in filterOptions.stages" :key="stage" :label="stage" :value="stage" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Source">
                  <el-select v-model="searchForm.source" placeholder="Select source" clearable
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
                    <el-option v-for="source in filterOptions.sources" :key="source" :label="source" :value="source" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Experiment Method">
                  <el-select v-model="searchForm.experiment" placeholder="Select experiment method" clearable
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
                    <el-option v-for="experiment in filterOptions.experiments" :key="experiment" :label="experiment"
                      :value="experiment" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Application">
                  <el-select v-model="searchForm.application" placeholder="Select application" clearable
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
                    <el-option v-for="application in filterOptions.applications" :key="application" :label="application"
                      :value="application" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Clinical Use">
                  <el-select v-model="searchForm.clinical_use" placeholder="Select clinical use status" clearable
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
                    <el-option v-for="clinical_use in filterOptions.clinical_uses" :key="clinical_use"
                      :label="clinical_use" :value="clinical_use" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Is Target">
                  <el-select v-model="searchForm.target" placeholder="Select if target" clearable
                    :loading="filterOptionsLoading" :disabled="filterOptionsLoading">
                    <el-option v-for="target in filterOptions.targets" :key="target" :label="target" :value="target" />
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
                    <el-input-number :model-value="searchForm.number_min"
                      @update:model-value="(val) => searchForm.number_min = val === '' ? null : Number(val)"
                      placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number :model-value="searchForm.number_max"
                      @update:model-value="(val) => searchForm.number_max = val === '' ? null : Number(val)"
                      placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Male Sample Size">
                  <div class="range-input">
                    <el-input-number :model-value="searchForm.male_min"
                      @update:model-value="(val) => searchForm.male_min = val === '' ? null : Number(val)"
                      placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number :model-value="searchForm.male_max"
                      @update:model-value="(val) => searchForm.male_max = val === '' ? null : Number(val)"
                      placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Female Sample Size">
                  <div class="range-input">
                    <el-input-number :model-value="searchForm.female_min"
                      @update:model-value="(val) => searchForm.female_min = val === '' ? null : Number(val)"
                      placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number :model-value="searchForm.female_max"
                      @update:model-value="(val) => searchForm.female_max = val === '' ? null : Number(val)"
                      placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="Average Age">
                  <div class="range-input">
                    <el-input-number :model-value="searchForm.age_mean_min"
                      @update:model-value="(val) => searchForm.age_mean_min = val === '' ? null : Number(val)"
                      placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number :model-value="searchForm.age_mean_max"
                      @update:model-value="(val) => searchForm.age_mean_max = val === '' ? null : Number(val)"
                      placeholder="Max value" :min="0" />
                  </div>
                </el-form-item>
              </el-col>
            </el-row>

            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="Age Range">
                  <div class="range-input">
                    <el-input-number :model-value="searchForm.age_min"
                      @update:model-value="(val) => searchForm.age_min = val === '' ? null : Number(val)"
                      placeholder="Min value" :min="0" />
                    <span class="range-separator">to</span>
                    <el-input-number :model-value="searchForm.age_max"
                      @update:model-value="(val) => searchForm.age_max = val === '' ? null : Number(val)"
                      placeholder="Max value" :min="0" />
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
              <el-table-column prop="id" label="ID" width="70" sortable />
              <el-table-column prop="biomarker" label="Biomarker" width="140" sortable />
              <el-table-column prop="category" label="Category" width="100">
                <template #default="{ row }">
                  <el-tag :color="getCategoryColor(row.category)" size="small"
                    :class="['category-tag', getTextColorClass(row.category)]" style="border: 1px;">
                    {{ row.category }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="application" label="Application" min-width="100" />
              <el-table-column prop="clinical_use" label="Clinical Use" min-width="100">
                <template #default="{ row }">
                  <el-tag :type="row.clinical_use === 'Yes' ? 'success' : 'danger'" size="small" effect="dark">
                    {{ row.clinical_use }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="location" label="Location" width="120" />
              <el-table-column prop="source" label="Source" width="80" />
              <el-table-column label="Author" width="150">
                <template #default="{ row }">
                  {{ row.reference?.author || 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column label="Journal" width="150">
                <template #default="{ row }">
                  {{ row.reference?.journal || 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column label="Year" width="80" sortable>
                <template #default="{ row }">
                  {{ row.reference?.year || 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column prop="target" label="Target" min-width="90">
                <template #default="{ row }">
                  <el-tag :type="row.target === 'Yes' ? 'success' : 'danger'" size="small" effect="dark">
                    {{ row.target || 'No' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="drugs" label="Drugs" width="500" />
            </el-table>
          </div>

          <!-- Card View -->
          <div v-else class="card-view">
            <div class="cards-grid" v-loading="loading">
              <el-card v-for="result in searchResults" :key="result.id" class="biomarker-card"
                @click="handleResultClick(result)">
                <template #header>
                  <div class="card-header">
                    <h3 class="biomarker-name">{{ result.biomarker }}</h3>
                    <el-tag :color="getCategoryColor(result.category)"
                      :class="['category-tag', getTextColorClass(result.category)]"
                      style="border: 1px; margin-right: 8px;">
                      {{ result.category }}
                    </el-tag>
                    <el-tag :type="result.clinical_use === 'Yes' ? 'success' : 'danger'" effect="dark">
                      {{ result.clinical_use === 'Yes' ? 'Clinical Use' : 'Unknown Clinical Info' }}
                    </el-tag>
                  </div>
                </template>

                <div class="card-content">
                  <div class="info-row" v-if="result.description">
                    <font-awesome-icon :icon="['fas', 'info-circle']" class="info-icon" />
                    <span class="info-label">Description:</span>
                    <span class="info-value">{{ result.description }}</span>
                  </div>
                  <div class="info-row" v-if="result.application">
                    <font-awesome-icon :icon="['fas', 'flask']" class="info-icon" />
                    <span class="info-label">Application:</span>
                    <span class="info-value">{{ result.application }}</span>
                  </div>
                  <div class="info-row" v-if="result.location">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="info-icon" />
                    <span class="info-label">Location:</span>
                    <span class="info-value">{{ result.location }}</span>
                  </div>
                  <div class="info-row" v-if="result.source">
                    <font-awesome-icon :icon="['fas', 'dna']" class="info-icon" />
                    <span class="info-label">Source:</span>
                    <span class="info-value">{{ result.source }}</span>
                  </div>
                  <div class="info-row" v-if="result.target">
                    <font-awesome-icon :icon="['fas', 'bullseye']" class="info-icon" />
                    <span class="info-label">Target:</span>
                    <span class="info-value">
                      <el-tag :type="result.target === 'Yes' ? 'success' : 'danger'" size="small" effect="dark">
                        {{ result.target || 'No' }}
                      </el-tag>
                    </span>
                  </div>
                  <div class="info-row reference-row" v-if="result.reference?.author">
                    <font-awesome-icon :icon="['fas', 'book']" class="info-icon" />
                    <span class="info-label">References:</span>
                    <span class="info-value">
                      {{ result.reference.author }} et al.,
                      {{ result.reference.journal }}
                      ({{ result.reference.year }})
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
import { getCategoryColor, getTextColorClass } from '@/utils/categoryColors'

const router = useRouter()
const route = useRoute()
const biomarkerStore = useBiomarkerStore()

// Reactive data
const loading = ref(false)
const hasSearched = ref(false)
const filterOptionsLoading = ref(false)
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



// Default form values
const defaultFormValues = {
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
  number_min: null,
  number_max: null,
  male_min: null,
  male_max: null,
  female_min: null,
  female_max: null,
  age_mean_min: null,
  age_mean_max: null,
  age_min: null,
  age_max: null,
  reference_first_author: '',
  reference_journal: '',
  reference_year_from: '',
  reference_year_to: '',
  reference_year_range: '',
  pmid: '',
  keywords: ''
}

// Chart view types
const categoryViewType = ref('pie')

const searchForm = reactive({ ...defaultFormValues })

const searchResults = ref([])
const allSearchResults = ref([]) // 存储所有搜索结果用于统计
const filterOptions = ref({
  categories: [],
  sources: [],
  stages: [],
  experiments: [],
  regions: [],
  races: [],
  applications: [],
  clinical_uses: [],
  targets: []
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
  allSearchResults.value.forEach(result => {
    if (result.category) categories.add(result.category)
  })
  return Array.from(categories)
}

const getValidatedCount = () => {
  return allSearchResults.value.filter(result => result.clinical_use === 'Yes').length
}

const getRecentCount = () => {
  const currentYear = new Date().getFullYear()
  return allSearchResults.value.filter(result =>
    result.reference?.year && (currentYear - result.reference.year) <= 5
  ).length
}

// Chart initialization functions
const initCategoryChart = () => {
  if (!categoryChartRef.value) return

  categoryChart = echarts.init(categoryChartRef.value)

  const updateChart = () => {
    const categoryData = getUniqueCategories().map(category => ({
      name: category,
      value: allSearchResults.value.filter(result => result.category === category).length
    }))

    // 清理图表配置，避免切换时残留
    categoryChart.clear()

    const option = categoryViewType.value === 'pie' ? {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 0,
        itemGap: 20,
        padding: [5, 20]
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
      legend: {
        type: 'scroll',
        orient: 'horizontal',
        bottom: 10,
        itemGap: 20,
        padding: [5, 20]
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
  allSearchResults.value.forEach(result => {
    if (result.reference?.year) {
      yearData[result.reference.year] = (yearData[result.reference.year] || 0) + 1
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
  initChartsIfVisible()
}

// Helper function to clean search parameters
const cleanSearchParams = (params) => {
  const cleaned = { ...params }

  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === '' || cleaned[key] === null ||
      (Array.isArray(cleaned[key]) && cleaned[key].length === 0)) {
      delete cleaned[key]
    }
  })

  // Handle year range
  if (cleaned.reference_year_range && Array.isArray(cleaned.reference_year_range)) {
    cleaned.reference_year_from = cleaned.reference_year_range[0]?.getFullYear() || null;
    cleaned.reference_year_to = cleaned.reference_year_range[1]?.getFullYear() || null;
    delete cleaned.reference_year_range;
  }

  return cleaned
}

// Helper function to initialize charts
const initChartsIfVisible = () => {
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
    // 首先获取当前页的数据
    const params = cleanSearchParams({
      page: currentPage.value,
      limit: pageSize.value,
      sort: sortBy.value,
      ...searchForm
    })

    const response = await biomarkerStore.advancedSearch(params)

    if (response.success) {
      // 转换字段名为小写，保持与前端代码一致
      const convertFields = (data) => {
        return data.map(item => ({
          id: item.ID,
          biomarker: item.Biomarker,
          category: item.Category,
          string_name: item.String_Name,
          description: item.Description,
          region: item.Region,
          race: item.Race,
          location: item.Location,
          stage: item.Stage,
          source: item.Source,
          experiment: item.Experiment,
          application: item.Application,
          clinical_use: item.Clinical_Use,
          target: item.Target,
          drugs: item.Drugs,
          number: item.Number,
          male: item.Male,
          female: item.Female,
          age_mean: item.Age_Mean,
          age: item.Age,
          reference: {
            author: item.First_Author,
            journal: item.Journal,
            year: item.Year,
            pmid: item.PMID
          },
          pmid: item.PMID,
          keywords: item.Keywords
        }))
      }

      const convertedData = convertFields(response.data || [])
      searchResults.value = convertedData
      const total = response.pagination.totalItems || 0
      totalResults.value = total

      // 如果总结果数大于当前页数据量，需要获取所有数据用于统计
      if (total > pageSize.value) {
        try {
          const allParams = cleanSearchParams({
            page: 1,
            limit: total, // 获取所有结果进行统计
            sort: sortBy.value,
            ...searchForm
          })

          const allResponse = await biomarkerStore.advancedSearch(allParams)
          if (allResponse.success) {
            allSearchResults.value = convertFields(allResponse.data || [])
          } else {
            // 如果获取所有数据失败，使用当前页数据进行统计
            allSearchResults.value = convertedData
          }
        } catch (error) {
          // 如果获取所有数据失败，使用当前页数据进行统计
          allSearchResults.value = convertedData
        }
      } else {
        // 如果所有数据都在当前页，直接使用
        allSearchResults.value = convertedData
      }

      ElMessage.success(`Found ${totalResults.value} matching results`)
    } else {
      throw new Error(response.message || 'Search failed')
    }
  } catch (error) {
    ElMessage.error('Unable to connect to the server.')
    searchResults.value = []
    allSearchResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
    initChartsIfVisible()
  }
}



// 重置表单
const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, defaultFormValues)
  searchResults.value = []
  allSearchResults.value = []
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
  router.push(`/biomarkers/${result.id}`)
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



// 加载筛选选项
const loadFilterOptions = async () => {
  filterOptionsLoading.value = true
  try {
    const response = await biomarkerStore.getFilterOptions()
    if (response.success) {
      const data = response.data || {}
      filterOptions.value = {
        categories: data.categories || [],
        sources: data.sources || [],
        stages: data.stages || [],
        experiments: data.experiments || [],
        regions: data.regions || [],
        races: data.races || [],
        applications: data.applications || [],
        clinical_uses: data.clinical_uses || [],
        targets: data.targets || []
      }
    }
  } catch (error) {
    filterOptions.value = {
      categories: [],
      sources: [],
      stages: [],
      experiments: [],
      regions: [],
      races: [],
      applications: [],
      clinical_uses: [],
      targets: []
    }
    ElMessage.error('Failed to load filter options from server. Please refresh the page.')
  } finally {
    filterOptionsLoading.value = false
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
  background: var(--accent-gradient);
  border: none;
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

.category-tag.text-black {
  --el-tag-text-color: #5a5a5a !important;
}

.category-tag.text-white {
  --el-tag-text-color: #ffffff !important;
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
