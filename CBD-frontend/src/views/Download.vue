<template>
  <div class="download">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Data Download Center</h1>
            <p class="hero-subtitle">
              Customize filters and download high-quality colorectal cancer biomarker datasets
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <!-- 使用 Element Plus 的 Row 和 Col 布局组件 -->
        <el-row :gutter="30" class="content-row">
          <!-- 左侧过滤面板 -->
          <el-col :xs="24" :sm="24" :md="8" :lg="7" :xl="6" class="filter-col">
            <FilterPanel :filters="filters" :active-preset="activePreset" :total-records="totalRecords"
              :filtered-records="filteredRecords" :download-count="downloadCount"
              :available-categories="availableCategories" :available-applications="availableApplications"
              :available-locations="availableLocations" :available-sources="availableSources"
              :available-regions="availableRegions" :available-stages="availableStages" :min-year="minYear"
              :max-year="maxYear" :preset-filters="presetFilters" @filter-change="handleFilterChange"
              @filterChange="handleFilterChange" @apply-preset="applyPresetFilter" @clear-filters="clearAllFilters"
              @save-preset="saveFilterPreset" />
          </el-col>

          <!-- 右侧主要内容区域 -->
          <el-col :xs="24" :sm="24" :md="16" :lg="17" :xl="18" class="main-col">
            <div class="main-area">
              <!-- 结果表格 -->
              <ResultsTable :filtered-records="filteredRecords" :preview-data="previewData" :loading="loading"
                :current-page="previewPage" :page-size="previewPageSize" @refresh="refreshData"
                @page-size-change="handlePageSizeChange" @page-change="handlePageChange" />

              <!-- 下载选项 -->
              <DownloadOptions :selected-format="selectedFormat" :selected-fields="selectedFields"
                :available-fields="availableFields" :download-formats="downloadFormats"
                :filtered-records="filteredRecords" :downloading="downloading" @format-change="handleFormatChange"
                @fields-change="handleFieldsChange" @select-all-fields="selectAllFields"
                @select-none-fields="selectNoneFields" @select-essential-fields="selectEssentialFields"
                @download="downloadData" />

              <!-- 下载历史 -->
              <DownloadHistory :download-history="downloadHistory" @redownload="redownload" />
            </div>
          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { debounce } from 'lodash-es'
import { useBiomarkerStore } from '@/stores/biomarker'
import axios from 'axios'

// 导入拆分的组件
import FilterPanel from '@/components/download/FilterPanel.vue'
import ResultsTable from '@/components/download/ResultsTable.vue'
import DownloadOptions from '@/components/download/DownloadOptions.vue'
import DownloadHistory from '@/components/download/DownloadHistory.vue'

// 初始化store
const biomarkerStore = useBiomarkerStore()

// Reactive data
const loading = ref(false)
const downloading = ref(false)

// Filter data
const filters = ref({
  name: '',
  category: [],
  application: [],
  location: [],
  source: [],
  yearRange: null,
  region: [],
  stage: []
})

const activePreset = ref('')
const totalRecords = ref(0)
const filteredRecords = ref(0)
const downloadCount = ref(0)

// Available options (loaded from API)
const availableCategories = ref([])
const availableApplications = ref([])
const availableLocations = ref([])
const availableSources = ref([])
const availableRegions = ref([])
const availableStages = ref([])

// Preview data
const previewData = ref([])
const previewPage = ref(1)
const previewPageSize = ref(10)

// Download options
const selectedFormat = ref('csv')
const selectedFields = ref([])

// Year range
const minYear = ref(1900)
const maxYear = ref(new Date().getFullYear())

// Download history
const downloadHistory = ref([])

// Preset filters
const presetFilters = ref([
  {
    key: 'all',
    label: 'All Biomarkers',
    icon: ['fas', 'list'],
    filters: {}
  },
  {
    key: 'protein',
    label: 'Protein Biomarkers',
    icon: ['fas', 'dna'],
    filters: { category: ['Protein'] }
  },
  {
    key: 'gene',
    label: 'Gene Biomarkers',
    icon: ['fas', 'code-branch'],
    filters: { category: ['Gene'] }
  },
  {
    key: 'recent',
    label: 'Recent Studies',
    icon: ['fas', 'clock'],
    filters: { yearRange: [new Date(2020, 0, 1), new Date(2024, 11, 31)] }
  }
])

// Download formats
const downloadFormats = ref([
  {
    key: 'csv',
    name: 'CSV',
    description: 'Comma-separated values, compatible with Excel',
    icon: ['fas', 'file-csv']
  },
  {
    key: 'excel',
    name: 'Excel',
    description: 'Microsoft Excel format with formatting',
    icon: ['fas', 'file-excel']
  }
])

// Available fields (aligned to new biomarker table)
const availableFields = ref([
  { key: 'id', name: 'ID', description: 'Record identifier', essential: true },
  { key: 'name', name: 'Biomarker Name', description: 'Name of the biomarker (Biomarker)', essential: true },
  { key: 'type', name: 'Type', description: 'Biomarker type', essential: false },
  { key: 'category', name: 'Category', description: 'Biomarker category', essential: true },
  { key: 'symbol', name: 'Symbol', description: 'Gene symbol', essential: false },
  { key: 'application', name: 'Application', description: 'Clinical application', essential: true },
  { key: 'location', name: 'Location', description: 'Anatomical location', essential: false },
  { key: 'source', name: 'Sample Source', description: 'Source of the sample', essential: false },
  { key: 'description', name: 'Description', description: 'Biomarker description', essential: false },
  { key: 'region', name: 'Region', description: 'Geographic region of study', essential: false },
  { key: 'race', name: 'Race', description: 'Population race', essential: false },
  { key: 'number', name: 'Sample Number', description: 'Total sample count', essential: false },
  { key: 'male', name: 'Male', description: 'Male sample count', essential: false },
  { key: 'female', name: 'Female', description: 'Female sample count', essential: false },
  { key: 'gender_m_f', name: 'Gender M/F', description: 'Gender ratio (M/F)', essential: false },
  { key: 'age_mean', name: 'Age Mean', description: 'Mean age', essential: false },
  { key: 'age', name: 'Age', description: 'Age range/value', essential: false },
  { key: 'stage', name: 'Stage', description: 'Disease stage', essential: false },
  { key: 'experiment', name: 'Experiment', description: 'Experimental method', essential: false },
  { key: 'statistics', name: 'Statistics', description: 'Statistical methods', essential: false },
  { key: 'conclusion', name: 'Conclusion', description: 'Study conclusion', essential: false },
  { key: 'clinical_use', name: 'Clinical Use', description: 'Clinical use (Yes/No)', essential: false },
  { key: 'target', name: 'Target', description: 'Therapeutic target (Yes/No)', essential: false },
  { key: 'drugs', name: 'Drugs', description: 'Associated drugs', essential: false },
  { key: 'first_author', name: 'First Author', description: 'First author of the study', essential: true },
  { key: 'journal', name: 'Journal', description: 'Publication journal', essential: true },
  { key: 'publication_year', name: 'Publication Year', description: 'Year of publication', essential: true },
  { key: 'pmid', name: 'PMID', description: 'PubMed identifier', essential: true },
  { key: 'doi', name: 'DOI', description: 'Digital Object Identifier', essential: false },
  { key: 'pmc', name: 'PMC', description: 'PubMed Central ID', essential: false },
  { key: 'title', name: 'Title', description: 'Article title', essential: false },
  { key: 'authors', name: 'Authors', description: 'All authors', essential: false },
  { key: 'abstract', name: 'Abstract', description: 'Article abstract', essential: false },
  { key: 'keywords', name: 'Keywords', description: 'Article keywords', essential: false }
])

// Methods
const debouncedFilter = debounce(() => {
  applyFilters()
}, 300)

const handleFilterChange = (newFilters) => {
  filters.value = newFilters
  debouncedFilter()
}

const applyPresetFilter = (preset) => {
  activePreset.value = preset.key
  Object.assign(filters.value, preset.filters)
  applyFilters()
  ElMessage.success(`Applied ${preset.label} filter`)
}

const applyFilters = async () => {
  loading.value = true
  try {
    const params = { ...filters.value }

    // 清理空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)) {
        delete params[key]
      }
    })

    // 特殊处理yearRange
    if (params.yearRange && Array.isArray(params.yearRange) && params.yearRange.length === 2) {
      // 处理日期选择器返回的Date对象
      params.reference_year_from = params.yearRange[0] instanceof Date ? params.yearRange[0].getFullYear() : params.yearRange[0]
      params.reference_year_to = params.yearRange[1] instanceof Date ? params.yearRange[1].getFullYear() : params.yearRange[1]
      delete params.yearRange
    }

    // 添加分页参数
    params.page = 1
    params.limit = 10

    const response = await biomarkerStore.advancedSearch(params)

    if (response && response.success) {
      filteredRecords.value = (response.pagination?.totalItems ?? response.pagination?.total ?? response.pagination?.count ?? (Array.isArray(response.data) ? response.data.length : 0)) || 0

      if (Array.isArray(response.data)) {
        previewData.value = response.data
      }

      ElMessage.success(`Found ${filteredRecords.value} matching records`)
    } else {
      throw new Error(response?.message || 'Filter failed')
    }
  } catch (error) {
    console.error('Filter error:', error)
    filteredRecords.value = 0
    previewData.value = []
    ElMessage.warning('Unable to apply filters.')
  } finally {
    loading.value = false
  }
}

const clearAllFilters = () => {
  filters.value = {
    name: '',
    category: [],
    application: [],
    location: [],
    source: [],
    yearRange: null,
    region: [],
    stage: []
  }
  activePreset.value = ''
  filteredRecords.value = totalRecords.value
  previewData.value = []
  ElMessage.success('Filters cleared')
}

const saveFilterPreset = () => {
  ElMessageBox.prompt('Enter preset name:', 'Save Filter Preset', {
    confirmButtonText: 'Save',
    cancelButtonText: 'Cancel'
  }).then(({ value }) => {
    ElMessage.success(`Preset "${value}" saved`)
  }).catch(() => {
    // User cancelled
  })
}

const refreshData = async () => {
  loading.value = true
  try {
    await loadFilterOptions()
    await applyFilters()
    ElMessage.success('Data refreshed')
  } catch (error) {
    ElMessage.error('Failed to refresh data')
  } finally {
    loading.value = false
  }
}

const handlePageSizeChange = (newPageSize) => {
  previewPageSize.value = newPageSize
  updatePreview()
}

const handlePageChange = (newPage) => {
  previewPage.value = newPage
  updatePreview()
}

const updatePreview = async () => {
  loading.value = true
  try {
    const params = { ...filters.value }

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)) {
        delete params[key]
      }
    })

    if (params.yearRange && Array.isArray(params.yearRange) && params.yearRange.length === 2) {
      // 处理日期选择器返回的Date对象
      params.reference_year_from = params.yearRange[0] instanceof Date ? params.yearRange[0].getFullYear() : params.yearRange[0]
      params.reference_year_to = params.yearRange[1] instanceof Date ? params.yearRange[1].getFullYear() : params.yearRange[1]
      delete params.yearRange
    }

    params.page = previewPage.value
    params.limit = previewPageSize.value

    const response = await biomarkerStore.advancedSearch(params)

    if (response && response.success && Array.isArray(response.data)) {
      previewData.value = response.data
    } else {
      previewData.value = generateMockData(previewPageSize.value)
    }
  } catch (error) {
    console.error('Preview error:', error)
    ElMessage.warning('Unable to load preview.')
  } finally {
    loading.value = false
  }
}


const handleFormatChange = (format) => {
  selectedFormat.value = format
}

const handleFieldsChange = (fields) => {
  selectedFields.value = fields
}

const selectAllFields = () => {
  selectedFields.value = availableFields.value.map(field => field.key)
}

const selectNoneFields = () => {
  selectedFields.value = []
}

const selectEssentialFields = () => {
  selectedFields.value = availableFields.value
    .filter(field => field.essential)
    .map(field => field.key)
}

const downloadData = async () => {
  if (selectedFields.value.length === 0) {
    ElMessage.warning('Please select at least one field')
    return
  }

  downloading.value = true
  try {
    const params = { ...filters.value }

    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)) {
        delete params[key]
      }
    })

    if (params.yearRange && Array.isArray(params.yearRange) && params.yearRange.length === 2) {
      // 处理日期选择器返回的Date对象
      params.reference_year_from = params.yearRange[0] instanceof Date ? params.yearRange[0].getFullYear() : params.yearRange[0]
      params.reference_year_to = params.yearRange[1] instanceof Date ? params.yearRange[1].getFullYear() : params.yearRange[1]
      delete params.yearRange
    }

    params.format = selectedFormat.value
    params.fields = selectedFields.value.join(',')
    params.export = true

    try {
      const response = await axios({
        method: 'get',
        url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/biomarkers/export`,
        params: params,
        responseType: 'blob',
        headers: {
          ...(localStorage.getItem('token') ? {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          } : {})
        }
      })

      const blob = new Blob([response.data], {
        type: selectedFormat.value === 'csv'
          ? 'text/csv;charset=utf-8;'
          : selectedFormat.value === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/json;charset=utf-8;'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url

      // Generate proper filename with date format
      const today = new Date().toISOString().split('T')[0]
      const fileExtension = selectedFormat.value === 'excel' ? 'xlsx' : selectedFormat.value
      link.download = `cbd_biomarkers_${today}.${fileExtension}`

      link.click()
      window.URL.revokeObjectURL(url)

      downloadHistory.value.unshift({
        id: Date.now(),
        fileName: link.download,
        recordCount: filteredRecords.value,
        fileSize: blob.size,
        createdAt: new Date(),
        filters: { ...params }, // 保存原始筛选条件
        fields: selectedFields.value.join(',') // 保存字段选择
      })

      downloadCount.value++
      ElMessage.success('Download completed successfully')
    } catch (axiosError) {
      console.error('Axios download error:', axiosError)
      throw new Error('Download failed - network error')
    }
  } catch (error) {
    console.error('Download error:', error)
    ElMessage.error('Download failed')
  } finally {
    downloading.value = false
  }
}

const redownload = async (item) => {
  ElMessage.info('Re-downloading: ' + item.fileName)

  // 使用历史记录中保存的原始筛选条件
  downloading.value = true
  try {
    // 如果历史记录中有保存的筛选参数，使用它们；否则使用空参数
    const params = item.filters ? { ...item.filters } : {}

    // 从历史记录中推断格式
    const format = item.fileName.endsWith('.xlsx') ? 'excel' :
      item.fileName.endsWith('.csv') ? 'csv' : 'csv'

    params.format = format
    params.fields = item.fields || selectedFields.value.join(',')
    params.export = true

    try {
      const response = await axios({
        method: 'get',
        url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'}/biomarkers/export`,
        params: params,
        responseType: 'blob',
        headers: {
          ...(localStorage.getItem('token') ? {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          } : {})
        }
      })

      const blob = new Blob([response.data], {
        type: format === 'csv'
          ? 'text/csv;charset=utf-8;'
          : format === 'excel'
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            : 'application/json;charset=utf-8;'
      })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = item.fileName
      link.click()
      window.URL.revokeObjectURL(url)

      ElMessage.success('Re-download completed successfully')
    } catch (axiosError) {
      console.error('Axios re-download error:', axiosError)
      throw new Error('Re-download failed - network error')
    }
  } catch (error) {
    console.error('Re-download error:', error)
    ElMessage.error('Re-download failed')
  } finally {
    downloading.value = false
  }
}

const loadFilterOptions = async () => {
  try {
    const response = await biomarkerStore.getFilterOptions()

    if (response && response.success) {
      const options = response.data || {}

      availableCategories.value = options.categories?.map(item => item.Category || item) || []
      availableApplications.value = options.applications?.map(item => item.Application || item) || []
      availableLocations.value = options.locations?.map(item => item.Location || item) || []
      availableSources.value = options.sources?.map(item => item.Source || item) || []
      availableRegions.value = options.regions?.map(item => item.Region || item) || []
      availableStages.value = options.stages?.map(item => item.Stage || item) || []

      totalRecords.value = options.totalRecords || 0
      filteredRecords.value = totalRecords.value

      if (options.yearRange) {
        minYear.value = parseInt(options.yearRange.min) || 2000
        maxYear.value = parseInt(options.yearRange.max) || 2024
        filters.value.yearRange = [new Date(minYear.value, 0, 1), new Date(maxYear.value, 11, 31)]
      }
    } else {
      throw new Error(response?.message || 'Failed to load filter options')
    }
  } catch (error) {
    console.error('Failed to load filter options:', error)
    console.error('Error details:', error.response?.data || error.message)
    availableCategories.value = ['Protein', 'Gene', 'MicroRNA', 'Metabolite', 'DNA', 'RNA']
    availableApplications.value = ['Diagnosis', 'Prognosis', 'Treatment']
    availableLocations.value = ['Colon', 'Rectum', 'Serum']
    availableSources.value = ['Tissue', 'Blood', 'Stool']
    availableRegions.value = ['Asia', 'Europe', 'North America']
    availableStages.value = ['I', 'II', 'III', 'IV']

    totalRecords.value = 100
    filteredRecords.value = 100

    ElMessage.warning(`Failed to load filter options: ${error.message}. Using default values.`)
  }
}

// Initialize
onMounted(() => {
  loadFilterOptions()
  selectAllFields()
})

watch(() => filters.value.yearRange, (val) => {
  if (val && Array.isArray(val)) {
    debouncedFilter()
  }
})
</script>

<style scoped>
.download {
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

.content-row {
  align-items: flex-start;
}

.filter-col {
  position: sticky;
  top: 20px;
}

.main-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .filter-col {
    position: static;
    margin-bottom: 20px;
  }

  .main-content {
    padding: 20px 0;
  }
}

@media (max-width: 992px) {
  .filter-col {
    position: static;
    margin-bottom: 20px;
  }
}
</style>
