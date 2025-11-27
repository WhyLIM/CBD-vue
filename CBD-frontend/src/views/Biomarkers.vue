<template>
  <div class="biomarkers">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Biomarker Browse</h1>
            <p class="hero-subtitle">Explore and discover the latest biomarker research findings</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Search Section -->
    <QuickSearch :show-title="false" placeholder="Enter biomarker name, gene symbol or keywords..."
      @search="handleQuickSearchFromComponent" />

    <!-- Filter Control Section -->
    <section class="filter-section">
      <div class="container">
        <div class="filter-header">
          <div class="filter-controls">
            <div class="filter-group">
              <div class="filter-item">
                <label class="filter-label">Category:</label>
                <el-select v-model="selectedCategory" placeholder="All Categories" @change="handleCategoryChange"
                  class="filter-select">
                  <el-option v-for="category in categories" :key="category.value" :label="category.label"
                    :value="category.value" />
                </el-select>
              </div>

              <div class="filter-item">
                <label class="filter-label">Sort:</label>
                <el-select v-model="sortBy" @change="handleSortChange" class="filter-select">
                  <el-option v-for="option in sortOptions" :key="option.value" :label="option.label"
                    :value="option.value" />
                </el-select>
              </div>

              <div class="filter-item">
                <el-button type="info" @click="handleAdvancedSearch" class="advanced-btn">
                  <font-awesome-icon :icon="['fas', 'cog']" class="btn-icon" />
                  Advanced Search
                </el-button>
              </div>
            </div>

            <div class="view-controls">
              <span class="results-count">
                Showing {{ paginatedBiomarkers.length }} / {{ totalItems }} biomarkers
              </span>
              <el-button-group class="view-toggle">
                <el-button :type="viewMode === 'table' ? 'primary' : 'default'" @click="viewMode = 'table'"
                  size="small">
                  <font-awesome-icon :icon="['fas', 'list']" />
                  Table
                </el-button>
                <el-button :type="viewMode === 'card' ? 'primary' : 'default'" @click="viewMode = 'card'" size="small">
                  <font-awesome-icon :icon="['fas', 'th-large']" />
                  Cards
                </el-button>
              </el-button-group>
            </div>
          </div>
        </div>

        <!-- Table View -->
        <div v-if="viewMode === 'table'" class="table-view">
          <el-card class="table-card">
            <el-table :data="paginatedBiomarkers" v-loading="loading" @row-click="handleRowClick"
              class="biomarkers-table" stripe highlight-current-row>
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
                  {{ row.reference.author || 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column label="Journal" width="150">
                <template #default="{ row }">
                  {{ row.reference.journal || 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column label="Year" width="80" sortable>
                <template #default="{ row }">
                  {{ row.reference.year || 'N/A' }}
                </template>
              </el-table-column>
              <el-table-column prop="target" label="Target" min-width="90">
                <template #default="{ row }">
                  <el-tag :type="row.target === '1' ? 'success' : 'danger'" size="small" effect="dark">
                    {{ row.target === '1' ? 'Yes' : 'No' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="drugs" label="Drugs" width="500" />
              <!-- <el-table-column label="Actions" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click.stop="handleRowClick(row)">
                    View
                  </el-button>
                </template>
              </el-table-column> -->
            </el-table>
          </el-card>
        </div>

        <!-- Card View -->
        <div v-else class="card-view">
          <div class="cards-grid" v-loading="loading">
            <el-card v-for="biomarker in paginatedBiomarkers" :key="biomarker.id" class="biomarker-card"
              @click="handleRowClick(biomarker)">
              <template #header>
                <div class="card-header">
                  <h3 class="biomarker-name">{{ biomarker.biomarker }}</h3>
                  <div>
                    <el-tag :color="getCategoryColor(biomarker.category)"
                      :class="['category-tag', getTextColorClass(biomarker.category)]"
                      style="border: 1px; margin-right: 8px;">
                      {{ biomarker.category }}
                    </el-tag>
                    <el-tag :type="biomarker.clinical_use === 'Yes' ? 'success' : 'danger'" effect="dark">
                      {{ biomarker.clinical_use === 'Yes' ? 'Clinical Use' : 'Unknown Clinical Info' }}
                    </el-tag>
                  </div>
                </div>
              </template>

              <div class="card-content">
                <div class="info-row" v-if="biomarker.description">
                  <font-awesome-icon :icon="['fas', 'info-circle']" class="info-icon" />
                  <span class="info-label">Description:</span>
                  <span class="info-value">{{ biomarker.description }}</span>
                </div>
                <div class="info-row" v-if="biomarker.application">
                  <font-awesome-icon :icon="['fas', 'flask']" class="info-icon" />
                  <span class="info-label">Application:</span>
                  <span class="info-value">{{ biomarker.application }}</span>
                </div>
                <div class="info-row" v-if="biomarker.location">
                  <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="info-icon" />
                  <span class="info-label">Location:</span>
                  <span class="info-value">{{ biomarker.location }}</span>
                </div>
                <div class="info-row" v-if="biomarker.source">
                  <font-awesome-icon :icon="['fas', 'dna']" class="info-icon" />
                  <span class="info-label">Source:</span>
                  <span class="info-value">{{ biomarker.source }}</span>
                </div>
                <div class="info-row" v-if="biomarker.target">
                  <font-awesome-icon :icon="['fas', 'bullseye']" class="info-icon" />
                  <span class="info-label">Target:</span>
                  <span class="info-value">
                    <el-tag :type="biomarker.target === '1' ? 'success' : 'danger'" size="small" effect="dark">
                      {{ biomarker.target === '1' ? 'Yes' : 'No' }}
                    </el-tag>
                  </span>
                </div>
                <div class="info-row reference-row" v-if="biomarker.reference.author">
                  <font-awesome-icon :icon="['fas', 'book']" class="info-icon" />
                  <span class="info-label">References:</span>
                  <span class="info-value">
                    {{ biomarker.reference.author }} et al.,
                    {{ biomarker.reference.journal }}
                    ({{ biomarker.reference.year }})
                  </span>
                </div>
              </div>
            </el-card>
          </div>
        </div>

        <!-- Pagination -->
        <div class="pagination-section">
          <div class="pagination-card">
            <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]" :total="totalItems" layout="total, sizes, prev, pager, next, jumper"
              @size-change="handlePageSizeChange" @current-change="handlePageChange" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBiomarkerStore } from '@/stores/biomarker'
import { ElMessage } from 'element-plus'
import QuickSearch from '@/components/common/QuickSearch.vue'
import { getCategoryColor, getTextColorClass } from '@/utils/categoryColors'

const router = useRouter()
const route = useRoute()
const biomarkerStore = useBiomarkerStore()

// Reactive data
const loading = ref(false)
const searchQuery = ref('')
const selectedCategory = ref('all')
const sortBy = ref('id_asc')
const currentPage = ref(1)
const pageSize = ref(20)
const viewMode = ref('table')

const categories = ref([
  { value: 'all', label: 'All Categories' },
  { value: 'Protein', label: 'Protein' },
  { value: 'MicroRNA', label: 'MicroRNA' },
  { value: 'Gene', label: 'Gene' },
  { value: 'Metabolite', label: 'Metabolite' },
  { value: 'DNA', label: 'DNA' },
  { value: 'RNA', label: 'RNA' }
])

const sortOptions = ref([
  { value: 'id_asc', label: 'ID (Ascending)' },
  { value: 'id_desc', label: 'ID (Descending)' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'year_desc', label: 'Year (Newest)' },
  { value: 'year_asc', label: 'Year (Oldest)' }
])

// Computed properties
const totalItems = computed(() => biomarkerStore.pagination.total)
const paginatedBiomarkers = computed(() => biomarkerStore.biomarkers)

// Methods
const fetchBiomarkers = async () => {
  loading.value = true
  try {
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      category: selectedCategory.value !== 'all' ? selectedCategory.value : undefined,
      sort: sortBy.value
    }

    await biomarkerStore.fetchBiomarkers(params)
  } catch (error) {
    console.error('Failed to fetch biomarkers:', error)
    ElMessage.error('Failed to load biomarkers')
  } finally {
    loading.value = false
  }
}

// 处理来自QuickSearch组件的搜索事件
const handleQuickSearchFromComponent = (query) => {
  searchQuery.value = query
  currentPage.value = 1
  fetchBiomarkers()
}

const handleCategoryChange = async () => {
  currentPage.value = 1
  await fetchBiomarkers()
}

const handleSortChange = async () => {
  currentPage.value = 1
  await fetchBiomarkers()
}

const handlePageSizeChange = async (size) => {
  pageSize.value = size
  currentPage.value = 1
  await fetchBiomarkers()
}

const handlePageChange = async (page) => {
  currentPage.value = page
  await fetchBiomarkers()
}

const handleRowClick = (row) => {
  router.push(`/biomarkers/${row.id}`)
}

const handleAdvancedSearch = () => {
  router.push('/advanced')
}



// Watch route query parameters
watch(() => route.query, (newQuery) => {
  if (newQuery.q) {
    searchQuery.value = newQuery.q
    handleSearch()
  }
}, { immediate: true })

onMounted(() => {
  // Initialize search from route query parameters
  if (route.query.q) {
    searchQuery.value = route.query.q
  }

  fetchBiomarkers()
})
</script>

<style scoped>
.biomarkers {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.search-input :deep(.el-input__wrapper) {
  height: 50px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input :deep(.el-input__inner) {
  font-size: 16px;
}

/* Filter Section Styles */
.filter-section {
  padding-top: 30px;
  padding-bottom: 60px;
  background: white;
  border-bottom: 1px solid #eee;
}

.filter-header {
  padding: 25px 10px;
}

.filter-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-weight: 600;
  color: #2c3e50;
  white-space: nowrap;
}

.filter-select {
  width: 150px;
}

.advanced-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  border-radius: 8px;
}

.btn-icon {
  margin-right: 5px;
}

.view-controls {
  display: flex;
  align-items: center;
  gap: 15px;
}

.results-count {
  color: #666;
  font-size: 14px;
  font-weight: 500;
}

.view-toggle {
  border-radius: 8px;
  overflow: hidden;
}

/* Results Display */
.table-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.biomarkers-table {
  border-radius: 12px;
}

.biomarkers-table :deep(.el-table__row) {
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.biomarkers-table :deep(.el-table__row:hover) {
  background-color: #f8f9ff;
}

.biomarkers-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.biomarkers-table :deep(.el-table__header th) {
  /* background: transparent; */
  color: black;
  font-weight: 600;
}

/* Card View Styles */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.biomarker-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.biomarker-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
}

.biomarker-name {
  font-size: 1.3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  line-height: 1.3;
}

.category-tag.text-black {
  --el-tag-text-color: #5a5a5a !important;
}

.category-tag.text-white {
  --el-tag-text-color: #ffffff !important;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 14px;
  line-height: 1.5;
}

.info-icon {
  color: #667eea;
  margin-top: 4px;
  flex-shrink: 0;
  width: 14px;
}

.info-label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 60px;
}

.info-value {
  color: #5a6c7d;
  flex: 1;
}

.reference-row .info-value {
  font-style: italic;
}

/* Pagination Styles */
.pagination-section {
  margin-top: 30px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .filter-controls {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group {
    justify-content: center;
  }

  .view-controls {
    justify-content: space-between;
  }

  .cards-grid {
    grid-template-columns: 1fr;
  }

  .biomarkers-table {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .hero-section {
    padding: 60px 0 40px;
  }

  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-item {
    justify-content: space-between;
  }

  .view-controls {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
