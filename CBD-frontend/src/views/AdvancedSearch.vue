<template>
  <div class="advanced-search">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">高级搜索</h1>
            <p class="hero-subtitle">使用多种条件精确查询生物标志物数据</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Search Section -->
    <QuickSearch :show-title="false" placeholder="输入生物标志物名称、基因符号或关键词..." @search="handleQuickSearch" />

    <!-- Search Form Section -->
    <section class="search-form-section">
      <div class="container">
        <el-card class="search-form-card">
          <template #header>
            <div class="card-header">
              <h2 class="form-title">
                <font-awesome-icon :icon="['fas', 'filter']" class="title-icon" />
                搜索条件设置
              </h2>
              <div class="header-actions">
                <el-button @click="handleSaveSearch" size="small" type="info">
                  <font-awesome-icon :icon="['fas', 'bookmark']" />
                  保存条件
                </el-button>
                <el-button type="primary" @click="handleReset" size="small">
                  <font-awesome-icon :icon="['fas', 'undo']" />
                  重置
                </el-button>
              </div>
            </div>
          </template>

          <el-form :model="searchForm" ref="searchFormRef" label-width="120px" class="advanced-form">
            <!-- 基本信息搜索 -->
            <div class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'info-circle']" />
                基本信息
              </h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="生物标志物">
                    <el-input v-model="searchForm.biomarker" placeholder="输入生物标志物名称" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="分类">
                    <el-select v-model="searchForm.category" placeholder="选择分类" clearable multiple>
                      <el-option v-for="category in filterOptions.categories" :key="category" :label="category"
                        :value="category" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="String名称">
                    <el-input v-model="searchForm.string_name" placeholder="输入String名称" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="描述">
                    <el-input v-model="searchForm.description" placeholder="输入描述关键词" clearable />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="区域">
                    <el-select v-model="searchForm.region" placeholder="选择区域" clearable>
                      <el-option v-for="region in filterOptions.regions" :key="region" :label="region"
                        :value="region" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="种族">
                    <el-select v-model="searchForm.race" placeholder="选择种族" clearable>
                      <el-option v-for="race in filterOptions.races" :key="race" :label="race" :value="race" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="位置">
                    <el-input v-model="searchForm.location" placeholder="输入位置信息" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="阶段">
                    <el-select v-model="searchForm.stage" placeholder="选择阶段" clearable>
                      <el-option v-for="stage in filterOptions.stages" :key="stage" :label="stage" :value="stage" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="来源">
                    <el-select v-model="searchForm.source" placeholder="选择来源" clearable>
                      <el-option v-for="source in filterOptions.sources" :key="source" :label="source"
                        :value="source" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="实验方法">
                    <el-select v-model="searchForm.experiment" placeholder="选择实验方法" clearable>
                      <el-option v-for="experiment in filterOptions.experiments" :key="experiment" :label="experiment"
                        :value="experiment" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="应用">
                    <el-input v-model="searchForm.application" placeholder="输入应用领域" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="临床使用">
                    <el-select v-model="searchForm.clinical_use" placeholder="选择临床使用状态" clearable>
                      <el-option label="是" value="Yes" />
                      <el-option label="否" value="No" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="是否为靶点">
                    <el-select v-model="searchForm.target" placeholder="选择是否为靶点" clearable>
                      <el-option label="是" :value="1" />
                      <el-option label="否" :value="0" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="药物">
                    <el-input v-model="searchForm.drugs" placeholder="输入相关药物" clearable />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 样本信息搜索 -->
            <div class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'users']" />
                样本信息
              </h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="样本总数">
                    <div class="range-input">
                      <el-input-number v-model="searchForm.number_min" placeholder="最小值" :min="0" />
                      <span class="range-separator">至</span>
                      <el-input-number v-model="searchForm.number_max" placeholder="最大值" :min="0" />
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="男性样本数">
                    <div class="range-input">
                      <el-input-number v-model="searchForm.male_min" placeholder="最小值" :min="0" />
                      <span class="range-separator">至</span>
                      <el-input-number v-model="searchForm.male_max" placeholder="最大值" :min="0" />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="女性样本数">
                    <div class="range-input">
                      <el-input-number v-model="searchForm.female_min" placeholder="最小值" :min="0" />
                      <span class="range-separator">至</span>
                      <el-input-number v-model="searchForm.female_max" placeholder="最大值" :min="0" />
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="平均年龄">
                    <div class="range-input">
                      <el-input-number v-model="searchForm.age_mean_min" placeholder="最小值" :min="0" />
                      <span class="range-separator">至</span>
                      <el-input-number v-model="searchForm.age_mean_max" placeholder="最大值" :min="0" />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="年龄范围">
                    <div class="range-input">
                      <el-input-number v-model="searchForm.age_min" placeholder="最小值" :min="0" />
                      <span class="range-separator">至</span>
                      <el-input-number v-model="searchForm.age_max" placeholder="最大值" :min="0" />
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 文献信息搜索 -->
            <div class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'book']" />
                文献信息
              </h3>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="第一作者">
                    <el-input v-model="searchForm.reference_first_author" placeholder="输入第一作者姓名" clearable />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="期刊名称">
                    <el-input v-model="searchForm.reference_journal" placeholder="输入期刊名称" clearable />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="发表年份">
                    <div class="range-input">
                      <el-input-number v-model="searchForm.reference_year_from" placeholder="起始年份" :min="1900"
                        :max="2030" />
                      <span class="range-separator">至</span>
                      <el-input-number v-model="searchForm.reference_year_to" placeholder="结束年份" :min="1900"
                        :max="2030" />
                    </div>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="PMID">
                    <el-input v-model="searchForm.pmid" placeholder="输入PMID" clearable />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 关键词搜索 -->
            <div class="form-section">
              <h3 class="section-title">
                <font-awesome-icon :icon="['fas', 'search']" />
                关键词搜索
              </h3>
              <el-row :gutter="20">
                <el-col :span="24">
                  <el-form-item label="关键词">
                    <el-input v-model="searchForm.keywords" placeholder="输入关键词，将在多个字段中搜索" clearable type="textarea"
                      :rows="2" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <!-- 搜索按钮 -->
            <div class="form-actions">
              <el-button type="primary" @click="handleSearch" :loading="loading" size="large" class="search-btn">
                <font-awesome-icon :icon="['fas', 'search']" />
                开始搜索
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </section>

    <!-- 搜索结果部分 -->
    <section v-if="searchResults.length > 0" class="results-section">
      <div class="container">
        <el-card class="results-card">
          <template #header>
            <div class="results-header">
              <h3 class="results-title">
                <font-awesome-icon :icon="['fas', 'list-ul']" />
                搜索结果 ({{ totalResults }} 项)
              </h3>
              <div class="results-actions">
                <el-button-group class="view-toggle">
                  <el-button :type="viewMode === 'table' ? 'primary' : 'default'" @click="viewMode = 'table'"
                    size="small">
                    <font-awesome-icon :icon="['fas', 'list']" />
                    表格视图
                  </el-button>
                  <el-button :type="viewMode === 'card' ? 'primary' : 'default'" @click="viewMode = 'card'"
                    size="small">
                    <font-awesome-icon :icon="['fas', 'th-large']" />
                    卡片视图
                  </el-button>
                </el-button-group>
                <el-button type="success" @click="handleExport" size="small">
                  <font-awesome-icon :icon="['fas', 'download']" />
                  导出结果
                </el-button>
                <el-select v-model="sortBy" @change="handleSort" size="small" style="width: 150px;">
                  <el-option v-for="option in sortOptions" :key="option.value" :label="option.label"
                    :value="option.value" />
                </el-select>
              </div>
            </div>
          </template>

          <!-- 表格视图 -->
          <div v-if="viewMode === 'table'" class="table-view">
            <el-table :data="searchResults" v-loading="loading" @row-click="handleResultClick" class="biomarkers-table"
              stripe highlight-current-row>
              <el-table-column prop="ID" label="ID" width="80" sortable />
              <el-table-column prop="Biomarker" label="生物标志物" width="140" sortable />
              <el-table-column prop="Category" label="分类" width="120">
                <template #default="{ row }">
                  <el-tag :type="getCategoryTagType(row.Category)" size="small">
                    {{ row.Category }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="Application" label="应用" min-width="200" />
              <el-table-column prop="Location" label="位置" width="150" />
              <el-table-column prop="Source" label="来源" width="100" />
              <el-table-column prop="Reference_first_author" label="作者" width="150" />
              <el-table-column prop="Reference_journal" label="期刊" width="180" />
              <el-table-column prop="Reference_year" label="年份" width="80" sortable />
              <el-table-column prop="Clinical_Use" label="临床使用" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.Clinical_Use === 'Yes' ? 'success' : 'info'" size="small">
                    {{ row.Clinical_Use === 'Yes' ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right">
                <template #default="{ row }">
                  <el-button type="primary" size="small" @click.stop="handleResultClick(row)">
                    查看
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <!-- 卡片视图 -->
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
                    <span class="info-label">描述:</span>
                    <span class="info-value">{{ result.Discription }}</span>
                  </div>
                  <div class="info-row" v-if="result.Application">
                    <font-awesome-icon :icon="['fas', 'flask']" class="info-icon" />
                    <span class="info-label">应用:</span>
                    <span class="info-value">{{ result.Application }}</span>
                  </div>
                  <div class="info-row" v-if="result.Location">
                    <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="info-icon" />
                    <span class="info-label">位置:</span>
                    <span class="info-value">{{ result.Location }}</span>
                  </div>
                  <div class="info-row" v-if="result.Source">
                    <font-awesome-icon :icon="['fas', 'dna']" class="info-icon" />
                    <span class="info-label">来源:</span>
                    <span class="info-value">{{ result.Source }}</span>
                  </div>
                  <div class="info-row" v-if="result.Number">
                    <font-awesome-icon :icon="['fas', 'users']" class="info-icon" />
                    <span class="info-label">样本数:</span>
                    <span class="info-value">{{ result.Number }}</span>
                  </div>
                  <div class="info-row" v-if="result.Clinical_Use">
                    <font-awesome-icon :icon="['fas', 'hospital']" class="info-icon" />
                    <span class="info-label">临床使用:</span>
                    <el-tag :type="result.Clinical_Use === 'Yes' ? 'success' : 'info'" size="small">
                      {{ result.Clinical_Use === 'Yes' ? '是' : '否' }}
                    </el-tag>
                  </div>
                  <div class="info-row reference-row">
                    <font-awesome-icon :icon="['fas', 'book']" class="info-icon" />
                    <span class="info-label">文献:</span>
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

          <!-- 分页 -->
          <div class="pagination-section">
            <div class="pagination-card">
              <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                :page-sizes="[10, 20, 50, 100]" :total="totalResults" layout="total, sizes, prev, pager, next, jumper"
                @size-change="handlePageSizeChange" @current-change="handlePageChange" />
            </div>
          </div>
        </el-card>
      </div>
    </section>

    <!-- 空结果状态 -->
    <section v-else-if="hasSearched && !loading" class="empty-state">
      <div class="container">
        <el-card class="empty-card">
          <div class="empty-content">
            <font-awesome-icon :icon="['fas', 'search']" class="empty-icon" />
            <h3 class="empty-title">未找到匹配的结果</h3>
            <p class="empty-description">请尝试调整搜索条件或使用不同的关键词</p>
            <el-button type="primary" @click="handleReset">
              重新搜索
            </el-button>
          </div>
        </el-card>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBiomarkerStore } from '@/stores/biomarker'
import { ElMessage } from 'element-plus'
import QuickSearch from '@/components/common/QuickSearch.vue'
import axios from 'axios'

const router = useRouter()
const route = useRoute()
const biomarkerStore = useBiomarkerStore()

// 响应式数据
const loading = ref(false)
const hasSearched = ref(false)
const searchFormRef = ref()
const currentPage = ref(1)
const pageSize = ref(20)
const totalResults = ref(0)
const sortBy = ref('relevance')
const viewMode = ref('table')

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
  { value: 'relevance', label: '相关性' },
  { value: 'biomarker_asc', label: '标志物名称 (A-Z)' },
  { value: 'biomarker_desc', label: '标志物名称 (Z-A)' },
  { value: 'year_desc', label: '年份 (最新)' },
  { value: 'year_asc', label: '年份 (最早)' },
  { value: 'number_desc', label: '样本数 (最多)' },
  { value: 'number_asc', label: '样本数 (最少)' }
])

// 处理快速搜索
const handleQuickSearch = (query) => {
  searchForm.biomarker = query
  currentPage.value = 1
  handleSearch()
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

    // 清理空值
    Object.keys(params).forEach(key => {
      if (params[key] === '' || params[key] === null ||
        (Array.isArray(params[key]) && params[key].length === 0)) {
        delete params[key]
      }
    })

    const response = await axios.post('/api/search/advanced', params)

    if (response.data.success) {
      searchResults.value = response.data.data || []
      totalResults.value = response.data.pagination.total || 0
      ElMessage.success(`找到 ${totalResults.value} 条匹配结果`)
    } else {
      throw new Error(response.data.message || '搜索失败')
    }
  } catch (error) {
    console.error('搜索失败:', error)
    ElMessage.error('搜索失败，请稍后重试')
    searchResults.value = []
    totalResults.value = 0
  } finally {
    loading.value = false
  }
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
  ElMessage.success('搜索条件已保存')
}

// 导出结果
const handleExport = () => {
  ElMessage.info('导出功能开发中...')
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
    const response = await axios.get('/api/search/filters')
    if (response.data.success) {
      filterOptions.value = response.data.data
    }
  } catch (error) {
    console.error('加载筛选选项失败:', error)
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
      console.error('加载保存的搜索条件失败:', error)
    }
  }

  // 如果URL中有查询参数，应用它们
  if (route.query.q) {
    searchForm.biomarker = route.query.q
    handleSearch()
  }
})
</script>

<style scoped>
.advanced-search {
  min-height: 100vh;
  background: #fafbfc;
}

/* Hero Section */
.hero-section {
  background-color: var(--el-color-primary);
  color: white;
  position: relative;
  overflow: hidden;
}

.hero-background {
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  padding: 60px 0;
  position: relative;
}

.hero-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  /* background-image: url('@/assets/images/pattern-bg.svg'); */
  background-size: cover;
  opacity: 0.1;
}

.hero-content {
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 1.2rem;
  font-weight: 400;
  max-width: 600px;
  margin: 0 auto;
  opacity: 0.9;
}

/* Search Form Section */
.search-form-section {
  padding: 40px 0;
}

.search-form-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.title-icon {
  margin-right: 8px;
  color: var(--el-color-primary);
}

.header-actions {
  display: flex;
  gap: 10px;
}

.advanced-form {
  padding: 20px;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
  padding-bottom: 10px;
}

.form-section {
  margin-bottom: 30px;
}

.range-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.range-separator {
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.search-btn {
  min-width: 180px;
  font-weight: 600;
}

/* Results Section */
.results-section {
  padding: 0 0 40px;
}

.results-card {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.results-title {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.results-actions {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

/* Table View */
.table-view {
  margin: 20px 0;
}

.biomarkers-table {
  width: 100%;
}

/* Card View */
.card-view {
  padding: 20px 0;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.biomarker-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.biomarker-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.biomarker-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  flex: 1;
}

.category-tag {
  margin-left: 10px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
}

.info-icon {
  margin-right: 8px;
  color: var(--el-color-info);
  width: 16px;
  margin-top: 3px;
}

.info-label {
  font-weight: 600;
  margin-right: 5px;
  color: var(--el-text-color-secondary);
  min-width: 60px;
}

.info-value {
  flex: 1;
  color: var(--el-text-color-primary);
  word-break: break-word;
}

.reference-row {
  margin-top: 12px;
  padding-top: 8px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

/* Pagination */
.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  padding: 10px 0;
}

.pagination-card {
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

/* Empty State */
.empty-state {
  padding: 40px 0;
}

.empty-card {
  text-align: center;
  padding: 40px;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.empty-icon {
  font-size: 3rem;
  color: var(--el-color-info);
  margin-bottom: 10px;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.empty-description {
  color: var(--el-text-color-secondary);
  margin-bottom: 20px;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-section {
    padding: 60px 0 40px;
  }

  .form-section {
    padding: 15px;
  }

  .card-content {
    padding: 10px;
  }

  .range-input {
    flex-direction: column;
    align-items: stretch;
  }

  .range-separator {
    text-align: center;
    margin: 5px 0;
  }
}
</style>
