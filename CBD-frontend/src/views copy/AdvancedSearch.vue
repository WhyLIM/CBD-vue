<template>
  <div class="advanced-search">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <div class="academic-badge">
              <font-awesome-icon :icon="['fas', 'search-plus']" class="badge-icon" />
              <span>Advanced Search Function</span>
            </div>
            <h1 class="hero-title">Advanced Search</h1>
            <p class="hero-subtitle">Use multiple criteria to precisely search biomarker data</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Form Section -->
    <section class="search-form-section">
      <div class="container">
        <el-card class="search-form-card">
          <template #header>
            <div class="card-header">
              <h2 class="form-title">
                <font-awesome-icon :icon="['fas', 'filter']" class="title-icon" />
                Search Criteria Settings
              </h2>
              <el-button type="primary" @click="handleReset" size="small">
                <font-awesome-icon :icon="['fas', 'undo']" />
                Reset
              </el-button>
            </div>
          </template>

          <el-form :model="searchForm" ref="searchFormRef" label-width="120px" class="advanced-form">
            <!-- Basic Information Search -->
            <div class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'info-circle']" />
                Basic Information
              </h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Biomarker Name">
                    <el-input v-model="searchForm.name" placeholder="Enter biomarker name" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Category">
                    <el-select v-model="searchForm.category" placeholder="Select category" clearable multiple>
                      <el-option v-for="category in categories" :key="category.value" :label="category.label"
                        :value="category.value" />
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
                  <el-form-item label="Location">
                    <el-input v-model="searchForm.location" placeholder="Enter location information" clearable />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Source">
                    <el-select v-model="searchForm.source" placeholder="Select source" clearable multiple>
                      <el-option v-for="source in sources" :key="source" :label="source" :value="source" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Disease Type">
                    <el-input v-model="searchForm.disease" placeholder="Enter disease type" clearable />
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
                    <el-input v-model="searchForm.first_author" placeholder="Enter first author name" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Journal Name">
                    <el-input v-model="searchForm.journal" placeholder="Enter journal name" clearable />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Publication Year">
                    <el-date-picker v-model="searchForm.year_range" type="yearrange" range-separator="to"
                      start-placeholder="Start year" end-placeholder="End year" format="YYYY" value-format="YYYY" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="DOI">
                    <el-input v-model="searchForm.doi" placeholder="Enter DOI" clearable />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="Keywords">
                    <el-input v-model="searchForm.keywords" placeholder="Enter keywords, separated by commas" clearable
                      type="textarea" :rows="2" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- Data Quality Filter -->
            <div class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'star']" />
                Data Quality
              </h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Sample Size Range">
                    <el-slider v-model="searchForm.sample_size_range" range :min="0" :max="10000" :step="100"
                      show-stops />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Validation Status">
                    <el-checkbox-group v-model="searchForm.validation_status">
                      <el-checkbox label="Validated">Validated</el-checkbox>
                      <el-checkbox label="Pending">Pending</el-checkbox>
                      <el-checkbox label="In Progress">In Progress</el-checkbox>
                    </el-checkbox-group>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- Search Buttons -->
            <div class="form-actions">
              <el-button type="primary" @click="handleSearch" :loading="loading" size="large" class="search-btn">
                <font-awesome-icon :icon="['fas', 'search']" />
                Start Search
              </el-button>
              <el-button @click="handleSaveSearch" size="large" class="save-btn">
                <font-awesome-icon :icon="['fas', 'bookmark']" />
                Save Search Criteria
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </section>

    <!-- Search Results Section -->
    <section v-if="searchResults.length > 0" class="results-section">
      <div class="container">
        <el-card class="results-card">
          <template #header>
            <div class="results-header">
              <h3 class="results-title">
                <font-awesome-icon :icon="['fas', 'list-ul']" />
                Search Results ({{ totalResults }} items)
              </h3>
              <div class="results-actions">
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

          <!-- Results List -->
          <div class="results-list" v-loading="loading">
            <div v-for="result in searchResults" :key="result.id" class="result-item"
              @click="handleResultClick(result)">
              <div class="result-header">
                <h4 class="result-name">{{ result.name }}</h4>
                <el-tag :type="getCategoryTagType(result.category)" size="small">
                  {{ result.category }}
                </el-tag>
              </div>
              <div class="result-content">
                <div class="result-info">
                  <div class="info-item">
                    <font-awesome-icon :icon="['fas', 'flask']" class="info-icon" />
                    <span class="info-label">Application:</span>
                    <span class="info-value">{{ result.application }}</span>
                  </div>
                  <div class="info-item">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="info-icon" />
                    <span class="info-label">Location:</span>
                    <span class="info-value">{{ result.location }}</span>
                  </div>
                  <div class="info-item">
                    <font-awesome-icon :icon="['fas', 'book']" class="info-icon" />
                    <span class="info-label">Literature:</span>
                    <span class="info-value">{{ result.first_author }} et al., {{ result.journal }} ({{
                      result.publication_year }})</span>
                  </div>
                </div>
                <div class="result-actions">
                  <el-button type="primary" size="small" @click.stop="handleResultClick(result)">
                    View Details
                  </el-button>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div class="pagination-wrapper">
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
            <p class="empty-description">Please try adjusting your search criteria or using different keywords</p>
            <el-button type="primary" @click="handleReset">
              Search Again
            </el-button>
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBiomarkerStore } from '@/stores/biomarker'
import { ElMessage } from 'element-plus'

const router = useRouter()
const biomarkerStore = useBiomarkerStore()

// Reactive data
const loading = ref(false)
const hasSearched = ref(false)
const searchFormRef = ref()
const currentPage = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)
const sortBy = ref('relevance')

const searchForm = reactive({
  name: '',
  category: [],
  application: '',
  location: '',
  source: [],
  disease: '',
  first_author: '',
  journal: '',
  year_range: null,
  doi: '',
  keywords: '',
  sample_size_range: [0, 10000],
  validation_status: []
})

const searchResults = ref([])

const categories = ref([
  { value: 'Protein', label: 'Protein' },
  { value: 'MicroRNA', label: 'MicroRNA' },
  { value: 'Gene', label: 'Gene' },
  { value: 'Metabolite', label: 'Metabolite' },
  { value: 'DNA', label: 'DNA' },
  { value: 'RNA', label: 'RNA' }
])

const sources = ref([
  'Blood', 'Urine', 'Tissue', 'Saliva', 'CSF', 'Plasma', 'Serum'
])

const sortOptions = ref([
  { value: 'relevance', label: 'Relevance' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'year_desc', label: 'Year (Newest)' },
  { value: 'year_asc', label: 'Year (Oldest)' }
])

// Methods
const handleSearch = async () => {
  loading.value = true
  hasSearched.value = true

  try {
    // Build search parameters
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...searchForm,
      sort: sortBy.value
    }

    // Clean empty values
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)) {
        delete params[key]
      }
    })

    const response = await biomarkerStore.advancedSearch(params)
    searchResults.value = response.data || []
    totalResults.value = response.total || 0

    ElMessage.success(`Found ${totalResults.value} matching results`)
  } catch (error) {
    console.error('Search failed:', error)
    ElMessage.error('Search failed, please try again later')
    searchResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
}

const handleReset = () => {
  searchFormRef.value?.resetFields()
  Object.assign(searchForm, {
    name: '',
    category: [],
    application: '',
    location: '',
    source: [],
    disease: '',
    first_author: '',
    journal: '',
    year_range: null,
    doi: '',
    keywords: '',
    sample_size_range: [0, 10000],
    validation_status: []
  })
  searchResults.value = []
  hasSearched.value = false
  currentPage.value = 1
}

const handleSort = () => {
  if (hasSearched.value) {
    handleSearch()
  }
}

const handlePageChange = (page) => {
  currentPage.value = page
  handleSearch()
}

const handlePageSizeChange = (size) => {
  pageSize.value = size
  currentPage.value = 1
  handleSearch()
}

const handleResultClick = (result) => {
  router.push(`/biomarkers/${result.id}`)
}

const handleSaveSearch = () => {
  // Save search criteria to local storage
  const searchConditions = { ...searchForm }
  localStorage.setItem('savedSearchConditions', JSON.stringify(searchConditions))
  ElMessage.success('Search criteria saved')
}

const handleExport = () => {
  // Export search results
  ElMessage.info('Export function under development...')
}

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

onMounted(() => {
  // Try to load saved search criteria
  const saved = localStorage.getItem('savedSearchConditions')
  if (saved) {
    try {
      const conditions = JSON.parse(saved)
      Object.assign(searchForm, conditions)
    } catch (error) {
      console.error('Failed to load saved search criteria:', error)
    }
  }
})
</script>

<style scoped>
.advanced-search {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Hero Section Styles */
.hero-section {
  position: relative;
  padding: 80px 0 60px;
  overflow: hidden;
}

.hero-background {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  position: relative;
}

.hero-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
}

.academic-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.badge-icon {
  font-size: 16px;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  margin: 0 0 15px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero-subtitle {
  font-size: 1.2rem;
  margin: 0;
  opacity: 0.9;
}

/* Search Form Section */
.search-form-section {
  padding: 40px 0;
}

.search-form-card {
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
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

.advanced-form {
  margin-top: 20px;
}

.form-section {
  margin-bottom: 40px;
  padding: 20px;
  background: #f8f9ff;
  border-radius: 12px;
  border-left: 4px solid #667eea;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-actions {
  text-align: center;
  padding: 30px 0;
  border-top: 1px solid #eee;
  margin-top: 20px;
}

.search-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 12px 30px;
  font-size: 16px;
  margin-right: 15px;
}

.save-btn {
  padding: 12px 30px;
  font-size: 16px;
}

/* Search Results Section */
.results-section {
  padding: 40px 0;
}

.results-card {
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.results-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
}

.results-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.results-list {
  margin-top: 20px;
}

.result-item {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 12px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.result-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 46, 69, 0.15);
  border-color: #667eea;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-name {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: #2c3e50;
}

.result-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.result-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.info-icon {
  color: #667eea;
  width: 14px;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 50px;
}

.info-value {
  color: #5a6c7d;
}

.result-actions {
  flex-shrink: 0;
}

.pagination-wrapper {
  margin-top: 30px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

/* Empty State */
.empty-state {
  padding: 60px 0;
}

.empty-card {
  border: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-radius: 16px;
}

.empty-content {
  text-align: center;
  padding: 40px;
}

.empty-icon {
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 10px 0;
}

.empty-description {
  color: #666;
  margin: 0 0 30px 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .card-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .results-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .result-content {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }

  .form-actions {
    text-align: center;
  }

  .search-btn,
  .save-btn {
    width: 100%;
    margin: 5px 0;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .hero-section {
    padding: 60px 0 40px;
  }

  .form-section {
    padding: 15px;
  }

  .result-item {
    padding: 15px;
  }
}
</style>