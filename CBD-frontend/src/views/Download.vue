<template>
  <div class="download-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Data Download</h1>
            <p class="hero-subtitle">Download high-quality biomarker datasets with multiple formats and filtering
              options</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Download Statistics Section -->
    <section class="stats-section">
      <div class="container">
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">
              <font-awesome-icon :icon="['fas', 'database']" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalRecords }}</div>
              <div class="stat-label">Available Records</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <font-awesome-icon :icon="['fas', 'file-alt']" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalDownloads }}</div>
              <div class="stat-label">Total Downloads</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <font-awesome-icon :icon="['fas', 'users']" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.activeUsers }}</div>
              <div class="stat-label">Active Users</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">
              <font-awesome-icon :icon="['fas', 'clock']" />
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.lastUpdate }}</div>
              <div class="stat-label">Last Update</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Download Options Section -->
    <section class="download-options-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">
            <font-awesome-icon :icon="['fas', 'cog']" />
            Download Configuration
          </h2>
          <p class="section-description">Select your desired data format and filtering criteria</p>
        </div>

        <el-card class="options-card">
          <div class="options-content">
            <!-- Data Filtering -->
            <div class="filter-section">
              <h3 class="filter-title">
                <font-awesome-icon :icon="['fas', 'filter']" />
                Data Filtering
              </h3>
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="filter-group">
                    <label class="filter-label">Biomarker Categories:</label>
                    <el-select v-model="downloadOptions.categories" multiple placeholder="Select categories"
                      class="filter-select">
                      <el-option v-for="category in categories" :key="category.value" :label="category.label"
                        :value="category.value" />
                    </el-select>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="filter-group">
                    <label class="filter-label">Application Types:</label>
                    <el-select v-model="downloadOptions.applications" multiple placeholder="Select applications"
                      class="filter-select">
                      <el-option v-for="app in applications" :key="app" :label="app" :value="app" />
                    </el-select>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="filter-group">
                    <label class="filter-label">Publication Year:</label>
                    <el-date-picker v-model="downloadOptions.yearRange" type="yearrange" range-separator="to"
                      start-placeholder="Start year" end-placeholder="End year" format="YYYY" value-format="YYYY"
                      class="filter-select" />
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- Format Selection -->
            <div class="format-section">
              <h3 class="format-title">
                <font-awesome-icon :icon="['fas', 'file-export']" />
                Output Format
              </h3>
              <div class="format-options">
                <div class="format-card" v-for="format in formats" :key="format.type"
                  :class="{ active: downloadOptions.format === format.type }"
                  @click="downloadOptions.format = format.type">
                  <div class="format-icon">
                    <font-awesome-icon :icon="format.icon" />
                  </div>
                  <div class="format-info">
                    <h4 class="format-name">{{ format.name }}</h4>
                    <p class="format-description">{{ format.description }}</p>
                    <div class="format-features">
                      <span v-for="feature in format.features" :key="feature" class="feature-tag">
                        {{ feature }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Advanced Options -->
            <div class="advanced-section">
              <h3 class="advanced-title">
                <font-awesome-icon :icon="['fas', 'sliders-h']" />
                Advanced Options
              </h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="option-group">
                    <el-checkbox v-model="downloadOptions.includeMetadata">Include Metadata</el-checkbox>
                    <p class="option-description">Include data source, quality scores and other additional information
                    </p>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="option-group">
                    <el-checkbox v-model="downloadOptions.includeReferences">Include References</el-checkbox>
                    <p class="option-description">Include complete literature citation information</p>
                  </div>
                </el-col>
              </el-row>
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="option-group">
                    <el-checkbox v-model="downloadOptions.compressFile">Compress File</el-checkbox>
                    <p class="option-description">Package download file as ZIP format</p>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="option-group">
                    <label class="option-label">Maximum Records:</label>
                    <el-input-number v-model="downloadOptions.maxRecords" :min="1" :max="10000" :step="100"
                      class="record-input" />
                  </div>
                </el-col>
              </el-row>
            </div>

            <!-- Preview and Download -->
            <div class="preview-section">
              <div class="preview-header">
                <h3 class="preview-title">
                  <font-awesome-icon :icon="['fas', 'eye']" />
                  Data Preview
                </h3>
                <div class="preview-actions">
                  <el-button @click="generatePreview" :loading="previewLoading" type="info">
                    <font-awesome-icon :icon="['fas', 'refresh']" />
                    Refresh Preview
                  </el-button>
                  <el-button @click="startDownload" :loading="downloadLoading" type="primary">
                    <font-awesome-icon :icon="['fas', 'download']" />
                    Start Download ({{ filteredCount }} records)
                  </el-button>
                </div>
              </div>

              <div class="preview-content" v-loading="previewLoading">
                <el-table :data="previewData" class="preview-table" stripe>
                  <el-table-column prop="name" label="Biomarker Name" width="150" />
                  <el-table-column prop="category" label="Category" width="120">
                    <template #default="{ row }">
                      <el-tag :type="getCategoryTagType(row.category)" size="small">
                        {{ row.category }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="application" label="Application" />
                  <el-table-column prop="first_author" label="First Author" width="150" />
                  <el-table-column prop="journal" label="Journal" width="180" />
                  <el-table-column prop="publication_year" label="Year" width="80" />
                </el-table>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </section>

    <!-- Download History Section -->
    <section class="history-section">
      <div class="container">
        <el-card class="history-card">
          <template #header>
            <div class="history-header">
              <h3 class="history-title">
                <font-awesome-icon :icon="['fas', 'history']" />
                Download History
              </h3>
              <el-button @click="clearHistory" type="danger" size="small" plain>
                <font-awesome-icon :icon="['fas', 'trash']" />
                Clear History
              </el-button>
            </div>
          </template>

          <div class="history-content">
            <div v-if="downloadHistory.length === 0" class="empty-history">
              <font-awesome-icon :icon="['fas', 'inbox']" class="empty-icon" />
              <p class="empty-text">No download history</p>
            </div>
            <div v-else class="history-list">
              <div v-for="item in downloadHistory" :key="item.id" class="history-item">
                <div class="history-info">
                  <div class="history-main">
                    <h4 class="history-filename">{{ item.filename }}</h4>
                    <p class="history-details">
                      {{ item.recordCount }} records • {{ item.format }} format • {{ item.fileSize }}
                    </p>
                  </div>
                  <div class="history-meta">
                    <span class="history-date">{{ formatDate(item.downloadDate) }}</span>
                    <el-tag :type="item.status === 'completed' ? 'success' : 'warning'" size="small">
                      {{ item.status === 'completed' ? 'Completed' : 'Processing' }}
                    </el-tag>
                  </div>
                </div>
                <div class="history-actions">
                  <el-button v-if="item.status === 'completed'" @click="redownload(item)" type="primary" size="small">
                    <font-awesome-icon :icon="['fas', 'download']" />
                    Re-download
                  </el-button>
                  <el-button @click="removeHistoryItem(item.id)" type="danger" size="small" plain>
                    <font-awesome-icon :icon="['fas', 'times']" />
                    Delete
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </section>

    <!-- Help Section -->
    <section class="help-section">
      <div class="container">
        <el-card class="help-card">
          <template #header>
            <h3 class="help-title">
              <font-awesome-icon :icon="['fas', 'question-circle']" />
              Usage Instructions
            </h3>
          </template>

          <div class="help-content">
            <el-row :gutter="30">
              <el-col :span="8">
                <div class="help-item">
                  <div class="help-icon">
                    <font-awesome-icon :icon="['fas', 'filter']" />
                  </div>
                  <h4 class="help-item-title">Data Filtering</h4>
                  <p class="help-item-description">
                    Filter data based on biomarker categories, application types, publication years and other criteria.
                    Supports multiple selections and range filtering.
                  </p>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="help-item">
                  <div class="help-icon">
                    <font-awesome-icon :icon="['fas', 'file-export']" />
                  </div>
                  <h4 class="help-item-title">Format Selection</h4>
                  <p class="help-item-description">
                    Multiple formats available including CSV, Excel, JSON, etc. CSV is suitable for data analysis,
                    Excel for viewing, and JSON for programmatic processing.
                  </p>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="help-item">
                  <div class="help-icon">
                    <font-awesome-icon :icon="['fas', 'download']" />
                  </div>
                  <h4 class="help-item-title">Download Limits</h4>
                  <p class="help-item-description">
                    Maximum 10,000 records per download. For larger datasets,
                    please download in batches or contact us for complete datasets.
                  </p>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'

// Reactive data
const previewLoading = ref(false)
const downloadLoading = ref(false)
const previewData = ref([])
const filteredCount = ref(0)

const stats = reactive({
  totalRecords: 2847,
  totalDownloads: 15623,
  activeUsers: 1256,
  lastUpdate: '2024-01-15'
})

const downloadOptions = reactive({
  categories: [],
  applications: [],
  yearRange: null,
  format: 'csv',
  includeMetadata: true,
  includeReferences: false,
  compressFile: false,
  maxRecords: 1000
})

const downloadHistory = ref([
  {
    id: 1,
    filename: 'biomarkers_protein_2024.csv',
    recordCount: 1245,
    format: 'CSV',
    fileSize: '2.3 MB',
    downloadDate: '2024-01-15T10:30:00Z',
    status: 'completed'
  },
  {
    id: 2,
    filename: 'biomarkers_miRNA_2023.xlsx',
    recordCount: 456,
    format: 'Excel',
    fileSize: '1.8 MB',
    downloadDate: '2024-01-14T15:45:00Z',
    status: 'completed'
  }
])

const categories = ref([
  { value: 'Protein', label: 'Protein' },
  { value: 'MicroRNA', label: 'MicroRNA' },
  { value: 'Gene', label: 'Gene' },
  { value: 'Metabolite', label: 'Metabolite' },
  { value: 'DNA', label: 'DNA' },
  { value: 'RNA', label: 'RNA' }
])

const applications = ref([
  'Diagnostic Biomarker', 'Prognostic Biomarker', 'Therapeutic Target', 'Drug Response', 'Disease Subtyping'
])

const formats = ref([
  {
    type: 'csv',
    name: 'CSV',
    description: 'Comma-separated values file, suitable for data analysis',
    icon: ['fas', 'file-csv'],
    features: ['Lightweight', 'Good compatibility', 'Easy processing']
  },
  {
    type: 'excel',
    name: 'Excel',
    description: 'Excel workbook, suitable for viewing and editing',
    icon: ['fas', 'file-excel'],
    features: ['Good visualization', 'Formula support', 'Easy sharing']
  },
  {
    type: 'json',
    name: 'JSON',
    description: 'JSON format, suitable for programmatic processing',
    icon: ['fas', 'file-code'],
    features: ['Structured', 'Easy parsing', 'Nested support']
  },
  {
    type: 'xml',
    name: 'XML',
    description: 'XML format, standardized data exchange',
    icon: ['fas', 'code'],
    features: ['Standardized', 'Validatable', 'Rich metadata']
  }
])

// Methods
const generatePreview = async () => {
  previewLoading.value = true
  try {
    const params = {
      ...downloadOptions,
      limit: 10 // Preview only shows first 10 records
    }

    const response = await api.post('/download/preview', params)
    if (response.success) {
      previewData.value = response.data.records
      filteredCount.value = response.data.total
    }
  } catch (error) {
    console.error('Generate preview failed:', error)
    ElMessage.error('Generate preview failed')
  } finally {
    previewLoading.value = false
  }
}

const startDownload = async () => {
  if (filteredCount.value === 0) {
    ElMessage.warning('No data available for download')
    return
  }

  try {
    await ElMessageBox.confirm(
      `Are you sure you want to download ${filteredCount.value} records?`,
      'Confirm Download',
      {
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        type: 'info'
      }
    )

    downloadLoading.value = true

    const response = await api.post('/download/start', downloadOptions)
    if (response.success) {
      // Add to download history
      const newItem = {
        id: Date.now(),
        filename: response.data.filename,
        recordCount: filteredCount.value,
        format: downloadOptions.format.toUpperCase(),
        fileSize: response.data.fileSize,
        downloadDate: new Date().toISOString(),
        status: 'completed'
      }
      downloadHistory.value.unshift(newItem)

      // Trigger file download
      const link = document.createElement('a')
      link.href = response.data.downloadUrl
      link.download = response.data.filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      ElMessage.success('Download started')
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('Download failed:', error)
      ElMessage.error('Download failed')
    }
  } finally {
    downloadLoading.value = false
  }
}

const redownload = (item) => {
  // Re-download logic
  ElMessage.info('Re-download function under development...')
}

const removeHistoryItem = (id) => {
  const index = downloadHistory.value.findIndex(item => item.id === id)
  if (index > -1) {
    downloadHistory.value.splice(index, 1)
    ElMessage.success('Deleted')
  }
}

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm('Are you sure you want to clear all download history?', 'Confirm Clear', {
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      type: 'warning'
    })

    downloadHistory.value = []
    ElMessage.success('History cleared')
  } catch (error) {
    // User cancelled
  }
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

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('en-US')
}

onMounted(() => {
  generatePreview()
})
</script>

<style scoped>
.download-page {
  min-height: 100vh;
  background: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Statistics Section */
.stats-section {
  padding: var(--spacing-2xl) 0;
  background: white;
  border-bottom: 1px solid var(--border-light);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.stat-card {
  background: white;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
  border-color: var(--accent-color);
}

.stat-icon {
  width: 60px;
  height: 60px;
  background: var(--accent-gradient);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

/* Download Options Section */
.download-options-section {
  padding: var(--spacing-2xl) 0;
}

.section-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
  font-size: var(--font-size-3xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-md) 0;
}

.section-description {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0;
}

.options-card {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-xl);
}

.options-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

/* Filter Section */
.filter-section {
  padding: var(--spacing-xl);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--accent-color);
}

.filter-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-lg) 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.filter-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
}

.filter-select {
  width: 100%;
}

/* Format Selection Section */
.format-section {
  padding: var(--spacing-xl);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--success-color);
}

.format-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-lg) 0;
}

.format-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--spacing-lg);
}

.format-card {
  background: white;
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-normal);
  display: flex;
  gap: var(--spacing-md);
}

.format-card:hover {
  border-color: var(--accent-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.format-card.active {
  border-color: var(--accent-color);
  background: var(--bg-tertiary);
  box-shadow: var(--shadow-md);
}

.format-icon {
  width: 50px;
  height: 50px;
  background: var(--accent-gradient);
  color: white;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.format-info {
  flex: 1;
}

.format-name {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-xs) 0;
}

.format-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-sm) 0;
}

.format-features {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.feature-tag {
  background: var(--border-light);
  color: var(--text-primary);
  padding: 2px var(--spacing-xs);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: 500;
}

/* Advanced Options Section */
.advanced-section {
  padding: var(--spacing-xl);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--warning-color);
}

.advanced-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-lg) 0;
}

.option-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.option-description {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  margin: 0;
}

.option-label {
  font-weight: 600;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  margin-bottom: var(--spacing-xs);
}

.record-input {
  width: 100%;
}

/* Preview Section */
.preview-section {
  padding: var(--spacing-xl);
  background: white;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border-light);
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.preview-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
}

.preview-actions {
  display: flex;
  gap: var(--spacing-md);
}

.preview-table {
  border-radius: var(--radius-lg);
  overflow: hidden;
}

/* History Section */
.history-section {
  padding: var(--spacing-2xl) 0;
}

.history-card {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-xl);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
}

.empty-history {
  text-align: center;
  padding: var(--spacing-3xl) 0;
}

.empty-icon {
  font-size: 4rem;
  color: var(--text-light);
  margin-bottom: var(--spacing-lg);
}

.empty-text {
  font-size: var(--font-size-lg);
  color: var(--text-muted);
  margin: 0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-light);
  transition: all var(--transition-normal);
}

.history-item:hover {
  border-color: var(--accent-color);
  box-shadow: var(--shadow-sm);
}

.history-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.history-main {
  flex: 1;
}

.history-filename {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-xs) 0;
}

.history-details {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.history-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--spacing-xs);
}

.history-date {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.history-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-left: var(--spacing-lg);
}

/* Help Section */
.help-section {
  padding: var(--spacing-2xl) 0;
}

.help-card {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-xl);
}

.help-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
}

.help-content {
  padding: var(--spacing-lg) 0;
}

.help-item {
  text-align: center;
  padding: var(--spacing-lg);
}

.help-icon {
  width: 60px;
  height: 60px;
  background: var(--accent-gradient);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto var(--spacing-lg) auto;
}

.help-item-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-md) 0;
}

.help-item-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  line-height: var(--line-height-relaxed);
  margin: 0;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .format-options {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .format-options {
    grid-template-columns: 1fr;
  }

  .preview-header {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .preview-actions {
    justify-content: center;
  }

  .history-item {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: stretch;
  }

  .history-info {
    flex-direction: column;
    gap: var(--spacing-sm);
    align-items: stretch;
  }

  .history-meta {
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  .history-actions {
    margin-left: 0;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .hero-section {
    padding: 60px 0 40px;
  }

  .section-title {
    font-size: var(--font-size-2xl);
    flex-direction: column;
    gap: var(--spacing-sm);
  }

  .filter-section,
  .format-section,
  .advanced-section,
  .preview-section {
    padding: var(--spacing-lg);
  }

  .format-card {
    flex-direction: column;
    text-align: center;
  }

  .format-icon {
    align-self: center;
  }

  .help-content .el-row {
    flex-direction: column;
  }

  .help-item {
    margin-bottom: var(--spacing-lg);
  }
}

/* Animation Effects */
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.stat-card {
  animation: slideInUp 0.6s ease-out;
}

.stat-card:nth-child(1) {
  animation-delay: 0.1s;
}

.stat-card:nth-child(2) {
  animation-delay: 0.2s;
}

.stat-card:nth-child(3) {
  animation-delay: 0.3s;
}

.stat-card:nth-child(4) {
  animation-delay: 0.4s;
}

.format-card {
  animation: slideInUp 0.6s ease-out;
}

.format-card:nth-child(1) {
  animation-delay: 0.1s;
}

.format-card:nth-child(2) {
  animation-delay: 0.2s;
}

.format-card:nth-child(3) {
  animation-delay: 0.3s;
}

.format-card:nth-child(4) {
  animation-delay: 0.4s;
}

.history-item {
  animation: slideInUp 0.4s ease-out;
}

.help-item {
  animation: slideInUp 0.6s ease-out;
}

.help-item:nth-child(1) {
  animation-delay: 0.1s;
}

.help-item:nth-child(2) {
  animation-delay: 0.2s;
}

.help-item:nth-child(3) {
  animation-delay: 0.3s;
}
</style>
