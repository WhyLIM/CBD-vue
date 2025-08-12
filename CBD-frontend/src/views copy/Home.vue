<template>
  <div class="home">
    <!-- Academic Hero Section -->
    <section class="academic-hero">
      <div class="container">
        <div class="hero-content">
          <h1 class="hero-title">
            CBD3: Colorectal Cancer Biomarker Database<br>
          </h1>
          <p class="hero-description">
            An evidence-based biomarker data integration platform that aggregates research findings from authoritative
            journals worldwide, providing scientific evidence for clinical diagnosis, prognosis assessment, and
            personalized treatment.
          </p>
          <div class="research-metrics">
            <div class="metric-card" v-loading="loading">
              <div class="metric-icon">
                <font-awesome-icon :icon="['fas', 'flask']" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ stats.totalBiomarkers }}</div>
                <div class="metric-label">Validated Biomarkers</div>
              </div>
            </div>
            <div class="metric-card" v-loading="loading">
              <div class="metric-icon">
                <font-awesome-icon :icon="['fas', 'file-alt']" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ stats.totalDownloads }}</div>
                <div class="metric-label">Literature Citations</div>
              </div>
            </div>
            <div class="metric-card" v-loading="loading">
              <div class="metric-icon">
                <font-awesome-icon :icon="['fas', 'university']" />
              </div>
              <div class="metric-info">
                <div class="metric-value">{{ stats.monthlyDownloads }}</div>
                <div class="metric-label">Research Institutions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Quick Search Section -->
    <QuickSearch title="Quick Search" placeholder="Enter biomarker name, gene symbol or keywords..." />

    <!-- Research Tools Navigation -->
    <section class="research-tools">
      <div class="container">
        <h2 class="section-title">Research Tools</h2>
        <div class="tools-grid">
          <div class="tool-card primary-tool" @click="$router.push('/biomarkers')">
            <div class="tool-header">
              <font-awesome-icon :icon="['fas', 'microscope']" class="tool-icon" />
              <h3>Browse Biomarkers</h3>
            </div>
            <p class="tool-description">
              Browse and search all colorectal cancer biomarkers in our collection
            </p>
            <div class="tool-features">
              <span class="feature-tag">Multi-dimensional Filtering</span>
              <span class="feature-tag">Real-time Search</span>
            </div>
          </div>

          <div class="tool-card" @click="$router.push('/advanced')">
            <div class="tool-header">
              <font-awesome-icon :icon="['fas', 'filter']" class="tool-icon" />
              <h3>Advanced Search</h3>
            </div>
            <p class="tool-description">
              Use multiple filtering criteria for precise data retrieval
            </p>
            <div class="tool-features">
              <span class="feature-tag">Combined Queries</span>
              <span class="feature-tag">Statistical Analysis</span>
            </div>
          </div>

          <div class="tool-card" @click="$router.push('/explore')">
            <div class="tool-header">
              <font-awesome-icon :icon="['fas', 'chart-line']" class="tool-icon" />
              <h3>Data Exploration</h3>
            </div>
            <p class="tool-description">
              In-depth analysis of biomarker data through visualization tools
            </p>
            <div class="tool-features">
              <span class="feature-tag">Interactive Charts</span>
              <span class="feature-tag">Trend Analysis</span>
            </div>
          </div>

          <div class="tool-card" @click="$router.push('/download')">
            <div class="tool-header">
              <font-awesome-icon :icon="['fas', 'download']" class="tool-icon" />
              <h3>Data Download</h3>
            </div>
            <p class="tool-description">
              Download qualified datasets for further research
            </p>
            <div class="tool-features">
              <span class="feature-tag">Multiple Formats</span>
              <span class="feature-tag">Batch Export</span>
            </div>
          </div>

          <div class="tool-card" @click="$router.push('/submission')">
            <div class="tool-header">
              <font-awesome-icon :icon="['fas', 'upload']" class="tool-icon" />
              <h3>Data Submission</h3>
            </div>
            <p class="tool-description">
              Submit new biomarker information to the database
            </p>
            <div class="tool-features">
              <span class="feature-tag">Peer Review</span>
              <span class="feature-tag">Quality Control</span>
            </div>
          </div>

          <div class="tool-card" @click="$router.push('/about')">
            <div class="tool-header">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="tool-icon" />
              <h3>About Us</h3>
            </div>
            <p class="tool-description">
              Learn about database construction methods and usage guidelines
            </p>
            <div class="tool-features">
              <span class="feature-tag">User Guide</span>
              <span class="feature-tag">Technical Support</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Latest Research Updates -->
    <section class="research-updates">
      <div class="container">
        <div class="updates-content">
          <div class="updates-text">
            <h2 class="section-title">Latest Research Updates</h2>
            <div class="recent-biomarkers-section">
              <el-table :data="recentBiomarkers" v-loading="loading" class="recent-table" @row-click="handleRowClick">
                <el-table-column prop="name" label="Biomarker Name" width="150" />
                <el-table-column prop="category" label="Category" width="120" />
                <el-table-column prop="application" label="Application" />
                <el-table-column prop="first_author" label="First Author" width="150" />
                <el-table-column prop="journal" label="Journal" width="180" />
                <el-table-column prop="publication_year" label="Year" width="80" />
              </el-table>
            </div>
            <el-button type="primary" @click="$router.push('/biomarkers')">
              View All Biomarkers
              <font-awesome-icon :icon="['fas', 'arrow-right']" />
            </el-button>
          </div>
          <div class="updates-stats">
            <div class="stats-card">
              <h3>Database Statistics</h3>
              <div class="stats-grid">
                <div class="stat-item" v-for="item in categoryStats.slice(0, 4)" :key="item.category">
                  <div class="stat-label">{{ item.category }}</div>
                  <div class="stat-value">{{ item.count }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Academic Collaboration -->
    <section class="academic-collaboration">
      <div class="container">
        <h2 class="section-title">Academic Collaboration</h2>
        <div class="collaboration-content">
          <div class="collaboration-text">
            <h3>Collaborating with Top Research Institutions Worldwide</h3>
            <p>
              We have established extensive partnerships with renowned universities, research institutes, and medical
              institutions around the world,
              jointly advancing the development of colorectal cancer biomarker research.
            </p>
            <div class="collaboration-benefits">
              <div class="benefit-item">
                <font-awesome-icon :icon="['fas', 'handshake']" />
                <span>Data Sharing</span>
              </div>
              <div class="benefit-item">
                <font-awesome-icon :icon="['fas', 'users']" />
                <span>Academic Exchange</span>
              </div>
              <div class="benefit-item">
                <font-awesome-icon :icon="['fas', 'lightbulb']" />
                <span>Innovative Research</span>
              </div>
            </div>
          </div>
          <div class="partner-logos">
            <div class="logo-grid">
              <div class="partner-logo" v-for="i in 6" :key="i">
                <font-awesome-icon :icon="['fas', 'university']" />
                <span>Partner Institution {{ i }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/utils/api'
import { ElMessage } from 'element-plus'
import QuickSearch from '@/components/common/QuickSearch.vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)

const stats = ref({
  totalBiomarkers: 2847,
  totalDownloads: 1256,
  monthlyDownloads: 89,
  lastUpdated: ''
})

const recentBiomarkers = ref([])
const categoryStats = ref([
  { category: 'Protein', count: 1245 },
  { category: 'Gene', count: 892 },
  { category: 'microRNA', count: 456 },
  { category: 'Metabolite', count: 254 }
])
const yearStats = ref([])

// 获取统计数据
const fetchStats = async () => {
  try {
    const response = await api.get('/stats')
    if (response.success) {
      const data = response.data
      stats.value = {
        totalBiomarkers: data.overview.totalBiomarkers || 2847,
        totalDownloads: data.overview.totalDownloads || 1256,
        monthlyDownloads: data.overview.monthlyDownloads || 89,
        lastUpdated: data.overview.lastUpdated ?
          new Date(data.overview.lastUpdated).toLocaleDateString() : 'N/A'
      }
      categoryStats.value = data.categories || categoryStats.value
      yearStats.value = data.yearDistribution || []
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取最新生物标记物
const fetchRecentBiomarkers = async () => {
  try {
    const response = await api.get('/stats/recent')
    if (response.success) {
      recentBiomarkers.value = response.data
    }
  } catch (error) {
    console.error('获取最新生物标记物失败:', error)
    // 提供默认数据
    recentBiomarkers.value = [
      {
        id: 1,
        name: 'CEA',
        category: '蛋白质',
        application: '诊断标记物',
        first_author: 'Zhang L',
        journal: 'Nature Medicine',
        publication_year: 2024
      },
      {
        id: 2,
        name: 'KRAS',
        category: '基因',
        application: '预后标记物',
        first_author: 'Wang M',
        journal: 'Cell',
        publication_year: 2024
      }
    ]
  }
}


// 表格行点击
const handleRowClick = (row) => {
  router.push(`/biomarkers/${row.id}`)
}

// 初始化数据
const initializeData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchStats(),
      fetchRecentBiomarkers()
    ])
  } catch (error) {
    console.error('初始化数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  initializeData()
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: #fafbfc;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.academic-hero {
  background: var(--primary-gradient-light), url('/images/banner.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  color: white;
  padding: 120px 20px 100px;
  position: relative;
}

.academic-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

/* .hero-content {
  position: relative;
  z-index: 1;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
} */

/* .hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
} */

.hero-title {
  color: white;
  font-size: 3.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

/* .title-highlight {
  color: #64b5f6;
  position: relative;
} */

.title-highlight::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #64b5f6, #42a5f5);
  border-radius: 2px;
}

.hero-description {
  font-size: 1.2rem;
  line-height: 1.7;
  opacity: 0.9;
  margin-bottom: 3rem;
}

.research-metrics {
  display: flex;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.metric-card {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 200px;
}

.metric-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.metric-value {
  font-size: 2rem;
  font-weight: 700;
  color: #64b5f6;
}

.metric-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 3rem;
  color: #1e3c72;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #1e3c72, #2a5298);
  border-radius: 2px;
}


.research-tools {
  padding: 80px 20px;
  background: white;
}

.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.tool-card {
  background: white;
  border: 2px solid #e3f2fd;
  border-radius: 12px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.tool-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1e3c72, #2a5298);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.tool-card:hover::before {
  transform: scaleX(1);
}

.tool-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(30, 60, 114, 0.15);
  border-color: #2a5298;
}

/* .primary-tool {
  border-color: #2a5298;
  background: linear-gradient(135deg, #f8fbff 0%, #e3f2fd 100%);
} */

.tool-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.tool-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #1e3c72, #2a5298);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.tool-header h3 {
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e3c72;
  margin: 0;
}

.tool-description {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.tool-features {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.feature-tag {
  background: #e3f2fd;
  color: #1e3c72;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.research-updates {
  padding: 80px 20px;
  background: #f8fbff;
}

.updates-content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 4rem;
  align-items: start;
}

.recent-biomarkers-section {
  margin-bottom: 2rem;
}

.recent-table {
  margin-bottom: 1rem;
}

.recent-table :deep(.el-table__row) {
  cursor: pointer;
}

.recent-table :deep(.el-table__row:hover) {
  background-color: #f5f7fa;
}

.stats-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.stats-card h3 {
  color: #1e3c72;
  margin-bottom: 1.5rem;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2a5298;
}

.academic-collaboration {
  padding: 80px 20px;
  background: white;
}

.collaboration-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.collaboration-text h3 {
  font-size: 1.8rem;
  color: #1e3c72;
  margin-bottom: 1rem;
}

.collaboration-text p {
  color: #666;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.collaboration-benefits {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.benefit-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: #1e3c72;
  font-weight: 500;
}

.benefit-item svg {
  color: #2a5298;
}

.logo-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

.partner-logo {
  background: #f8fbff;
  border: 2px solid #e3f2fd;
  border-radius: 8px;
  padding: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.partner-logo:hover {
  border-color: #2a5298;
  background: white;
  box-shadow: 0 5px 15px rgba(30, 60, 114, 0.1);
}

.partner-logo svg {
  font-size: 2rem;
  color: #2a5298;
}

.partner-logo span {
  font-size: 0.8rem;
  color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .research-metrics {
    flex-direction: column;
    align-items: center;
  }

  .metric-card {
    min-width: auto;
    width: 100%;
    max-width: 300px;
  }

  .updates-content,
  .collaboration-content {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .logo-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>