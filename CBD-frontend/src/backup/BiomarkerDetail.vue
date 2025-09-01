<template>
  <div class="biomarker-detail">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-result
        icon="error"
        title="Error Loading Biomarker"
        :sub-title="error"
      >
        <template #extra>
          <el-button type="primary" @click="$router.go(-1)">
            Go Back
          </el-button>
          <el-button @click="fetchBiomarkerDetail">
            Retry
          </el-button>
        </template>
      </el-result>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="biomarker" class="detail-content">
      <!-- 面包屑导航 -->
      <div class="breadcrumb-section">
        <div class="container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/biomarkers' }">Biomarkers</el-breadcrumb-item>
            <el-breadcrumb-item>{{ biomarker.name }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>

      <!-- 标题区域 -->
      <div class="header-section">
        <div class="container">
          <div class="biomarker-header">
            <div class="title-group">
              <h1 class="biomarker-name">{{ biomarker.name }}</h1>
              <el-tag 
                :type="getCategoryTagType(biomarker.category)" 
                size="large"
                class="category-tag"
              >
                {{ biomarker.category }}
              </el-tag>
            </div>
            <div class="action-buttons">
              <el-button type="primary" @click="handleDownload">
                <i class="fas fa-download"></i>
                Download Data
              </el-button>
              <el-button @click="handleShare">
                <i class="fas fa-share"></i>
                Share
              </el-button>
              <el-button @click="$router.go(-1)">
                <i class="fas fa-arrow-left"></i>
                Back
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 详细信息 -->
      <div class="content-section">
        <div class="container">
          <div class="content-grid">
            <!-- 基本信息 -->
            <div class="info-panel">
              <el-card class="info-card">
                <template #header>
                  <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
                </template>
                
                <div class="info-grid">
                  <div class="info-item">
                    <label>Name:</label>
                    <span>{{ biomarker.name }}</span>
                  </div>
                  <div class="info-item">
                    <label>Category:</label>
                    <el-tag :type="getCategoryTagType(biomarker.category)">
                      {{ biomarker.category }}
                    </el-tag>
                  </div>
                  <div class="info-item">
                    <label>Application:</label>
                    <span>{{ biomarker.application }}</span>
                  </div>
                  <div class="info-item">
                    <label>Location:</label>
                    <span>{{ biomarker.location }}</span>
                  </div>
                  <div class="info-item">
                    <label>Source:</label>
                    <span>{{ biomarker.source }}</span>
                  </div>
                  <div class="info-item" v-if="biomarker.gene_symbol">
                    <label>Gene Symbol:</label>
                    <span>{{ biomarker.gene_symbol }}</span>
                  </div>
                  <div class="info-item" v-if="biomarker.protein_name">
                    <label>Protein Name:</label>
                    <span>{{ biomarker.protein_name }}</span>
                  </div>
                  <div class="info-item" v-if="biomarker.pathway">
                    <label>Pathway:</label>
                    <span>{{ biomarker.pathway }}</span>
                  </div>
                </div>
              </el-card>

              <!-- 描述信息 -->
              <el-card class="info-card">
                <template #header>
                  <h3><i class="fas fa-file-text"></i> Description</h3>
                </template>
                <div class="description-content">
                  <p>{{ biomarker.description || 'No description available.' }}</p>
                </div>
              </el-card>

              <!-- 临床意义 -->
              <el-card class="info-card" v-if="biomarker.clinical_significance">
                <template #header>
                  <h3><i class="fas fa-stethoscope"></i> Clinical Significance</h3>
                </template>
                <div class="clinical-content">
                  <p>{{ biomarker.clinical_significance }}</p>
                </div>
              </el-card>
            </div>

            <!-- 参考文献和数据 -->
            <div class="reference-panel">
              <!-- 参考文献 -->
              <el-card class="reference-card">
                <template #header>
                  <h3><i class="fas fa-book"></i> Reference</h3>
                </template>
                
                <div class="reference-info">
                  <div class="reference-item">
                    <label>First Author:</label>
                    <span>{{ biomarker.first_author }}</span>
                  </div>
                  <div class="reference-item">
                    <label>Journal:</label>
                    <span>{{ biomarker.journal }}</span>
                  </div>
                  <div class="reference-item">
                    <label>Publication Year:</label>
                    <span>{{ biomarker.publication_year }}</span>
                  </div>
                  <div class="reference-item" v-if="biomarker.pmid">
                    <label>PMID:</label>
                    <el-link 
                      :href="`https://pubmed.ncbi.nlm.nih.gov/${biomarker.pmid}/`" 
                      target="_blank"
                      type="primary"
                    >
                      {{ biomarker.pmid }}
                    </el-link>
                  </div>
                  <div class="reference-item" v-if="biomarker.doi">
                    <label>DOI:</label>
                    <el-link 
                      :href="`https://doi.org/${biomarker.doi}`" 
                      target="_blank"
                      type="primary"
                    >
                      {{ biomarker.doi }}
                    </el-link>
                  </div>
                </div>
              </el-card>

              <!-- 统计数据 -->
              <el-card class="stats-card">
                <template #header>
                  <h3><i class="fas fa-chart-bar"></i> Statistics</h3>
                </template>
                
                <div class="stats-grid">
                  <div class="stat-item">
                    <div class="stat-value">{{ biomarker.view_count || 0 }}</div>
                    <div class="stat-label">Views</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ biomarker.download_count || 0 }}</div>
                    <div class="stat-label">Downloads</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ biomarker.citation_count || 0 }}</div>
                    <div class="stat-label">Citations</div>
                  </div>
                </div>
              </el-card>

              <!-- 相关链接 -->
              <el-card class="links-card">
                <template #header>
                  <h3><i class="fas fa-link"></i> External Links</h3>
                </template>
                
                <div class="links-list">
                  <el-button 
                    v-if="biomarker.gene_symbol"
                    type="info" 
                    size="small" 
                    @click="openExternalLink('ncbi', biomarker.gene_symbol)"
                  >
                    <i class="fas fa-external-link-alt"></i>
                    NCBI Gene
                  </el-button>
                  <el-button 
                    v-if="biomarker.protein_name"
                    type="info" 
                    size="small" 
                    @click="openExternalLink('uniprot', biomarker.protein_name)"
                  >
                    <i class="fas fa-external-link-alt"></i>
                    UniProt
                  </el-button>
                  <el-button 
                    v-if="biomarker.pathway"
                    type="info" 
                    size="small" 
                    @click="openExternalLink('kegg', biomarker.pathway)"
                  >
                    <i class="fas fa-external-link-alt"></i>
                    KEGG Pathway
                  </el-button>
                </div>
              </el-card>
            </div>
          </div>
        </div>
      </div>

      <!-- 相关生物标记物 -->
      <div class="related-section" v-if="relatedBiomarkers.length > 0">
        <div class="container">
          <h2 class="section-title">Related Biomarkers</h2>
          <div class="related-grid">
            <el-card 
              v-for="related in relatedBiomarkers" 
              :key="related.id"
              class="related-card"
              @click="$router.push(`/biomarkers/${related.id}`)"
            >
              <div class="related-header">
                <span class="related-name">{{ related.name }}</span>
                <el-tag :type="getCategoryTagType(related.category)" size="small">
                  {{ related.category }}
                </el-tag>
              </div>
              <div class="related-info">
                <p>{{ related.application }}</p>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBiomarkerStore } from '@/stores/biomarker'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '@/utils/api'

const route = useRoute()
const router = useRouter()
const biomarkerStore = useBiomarkerStore()

// 响应式数据
const loading = ref(false)
const error = ref(null)
const biomarker = ref(null)
const relatedBiomarkers = ref([])

// 获取生物标记物详情
const fetchBiomarkerDetail = async () => {
  const id = route.params.id
  if (!id) {
    error.value = 'Invalid biomarker ID'
    return
  }

  loading.value = true
  error.value = null

  try {
    const response = await api.get(`/biomarkers/${id}`)
    if (response.success) {
      biomarker.value = response.data
      // 增加浏览次数
      await incrementViewCount(id)
      // 获取相关生物标记物
      await fetchRelatedBiomarkers(id)
    } else {
      error.value = response.message || 'Failed to load biomarker details'
    }
  } catch (err) {
    console.error('获取生物标记物详情失败:', err)
    error.value = 'Failed to load biomarker details'
  } finally {
    loading.value = false
  }
}

// 增加浏览次数
const incrementViewCount = async (id) => {
  try {
    await api.post(`/biomarkers/${id}/view`)
  } catch (error) {
    console.error('增加浏览次数失败:', error)
  }
}

// 获取相关生物标记物
const fetchRelatedBiomarkers = async (id) => {
  try {
    const response = await api.get(`/biomarkers/${id}/related`)
    if (response.success) {
      relatedBiomarkers.value = response.data
    }
  } catch (error) {
    console.error('获取相关生物标记物失败:', error)
  }
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

// 下载数据
const handleDownload = async () => {
  try {
    const response = await api.get(`/biomarkers/${biomarker.value.id}/download`, {
      responseType: 'blob'
    })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `${biomarker.value.name}_data.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('Data downloaded successfully')
  } catch (error) {
    console.error('下载失败:', error)
    ElMessage.error('Download failed')
  }
}

// 分享功能
const handleShare = async () => {
  const url = window.location.href
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: `${biomarker.value.name} - CBD2 Database`,
        text: `Check out this biomarker: ${biomarker.value.name}`,
        url: url
      })
    } else {
      // 复制到剪贴板
      await navigator.clipboard.writeText(url)
      ElMessage.success('Link copied to clipboard')
    }
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('Share failed')
  }
}

// 打开外部链接
const openExternalLink = (type, query) => {
  const urls = {
    ncbi: `https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(query)}`,
    uniprot: `https://www.uniprot.org/uniprot/?query=${encodeURIComponent(query)}`,
    kegg: `https://www.genome.jp/kegg-bin/search_pathway_text?map=map&keyword=${encodeURIComponent(query)}`
  }
  
  if (urls[type]) {
    window.open(urls[type], '_blank')
  }
}

// 监听路由参数变化
watch(() => route.params.id, (newId) => {
  if (newId) {
    fetchBiomarkerDetail()
  }
})

onMounted(() => {
  fetchBiomarkerDetail()
})
</script>

<style scoped>
.biomarker-detail {
  min-height: 100vh;
  background: #f8f9fa;
}

.loading-container, .error-container {
  padding: 60px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.breadcrumb-section {
  background: white;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.header-section {
  background: linear-gradient(135deg, #002e45 0%, #014371 100%);
  color: white;
  padding: 40px 0;
}

.biomarker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.biomarker-name {
  font-size: 2.5rem;
  font-weight: bold;
  margin: 0;
}

.category-tag {
  font-size: 14px;
  padding: 8px 16px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.action-buttons .el-button:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.action-buttons .el-button--primary {
  background: #27ae60;
  border-color: #27ae60;
}

.action-buttons .el-button--primary:hover {
  background: #219a52;
  border-color: #219a52;
}

.content-section {
  padding: 40px 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
}

.info-card, .reference-card, .stats-card, .links-card {
  margin-bottom: 20px;
}

.info-card :deep(.el-card__header),
.reference-card :deep(.el-card__header),
.stats-card :deep(.el-card__header),
.links-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 2px solid #27ae60;
}

.info-card h3, .reference-card h3, .stats-card h3, .links-card h3 {
  margin: 0;
  color: #002e45;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-item label {
  font-weight: bold;
  color: #333;
  font-size: 14px;
}

.info-item span {
  color: #666;
}

.description-content, .clinical-content {
  line-height: 1.6;
  color: #333;
}

.reference-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.reference-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.reference-item label {
  font-weight: bold;
  color: #333;
  min-width: 120px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  text-align: center;
}

.stat-item {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 2rem;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.related-section {
  padding: 40px 0;
  background: white;
}

.section-title {
  text-align: center;
  font-size: 2rem;
  color: #002e45;
  margin-bottom: 30px;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.related-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.related-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 46, 69, 0.15);
  border-color: #27ae60;
}

.related-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.related-name {
  font-weight: bold;
  color: #002e45;
}

.related-info {
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .biomarker-name {
    font-size: 2rem;
  }
  
  .biomarker-header {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .related-grid {
    grid-template-columns: 1fr;
  }
}
</style>