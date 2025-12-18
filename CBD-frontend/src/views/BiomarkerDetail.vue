<template>
  <div class="biomarker-page">
    <div v-if="loading" class="loading-wrapper container">
      <el-skeleton :rows="2" animated class="mb-4" />
      <el-row :gutter="24">
        <el-col :span="16"><el-skeleton :rows="10" animated /></el-col>
        <el-col :span="8"><el-skeleton :rows="6" animated /></el-col>
      </el-row>
    </div>

    <div v-else-if="error" class="error-wrapper">
      <el-empty :description="error">
        <el-button type="primary" @click="fetchBiomarkerDetail">Retry</el-button>
        <el-button @click="$router.go(-1)">Go Back</el-button>
      </el-empty>
    </div>

    <div v-else-if="bio" class="content-wrapper">

      <section class="hero-section">
        <div class="hero-background">
          <div class="container">
            <div class="hero-content">
              <div class="hero-row">
                <div class="hero-left">
                  <h1 class="hero-title">{{ display.name }}</h1>
                </div>
                <div class="hero-right">
                  <div class="hero-badges">
                    <span class="hero-id-pill">
                      <font-awesome-icon :icon="['fas', 'id-badge']" class="hero-id-icon" />
                      #{{ display.id }}
                    </span>
                    <el-tag :color="getCategoryColor(display.category)" size="large"
                      :class="['category-tag', getTextColorClass(display.category)]" style="border:1px">
                      {{ display.category }}
                    </el-tag>
                    <el-tag v-if="display.application" class="hero-app-tag" size="large" effect="plain">
                      <font-awesome-icon :icon="['fas', 'flask']" class="mr-2" />
                      {{ display.application }}
                    </el-tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="container main-body">
        <el-row :gutter="32">
          <el-col :xs="24" :lg="6">
            <el-anchor>
              <el-anchor-link href="#basic-info" title="Basic Information" />
              <el-anchor-link v-if="hasArticleInfo" href="#article-info" title="Article Information" />
              <el-anchor-link v-if="hasExperimentInfo" href="#experiment-info"
                title="Experimental and Sample Statistics" />
              <el-anchor-link v-if="hasAssociatedDrugs" href="#associated-drugs" title="Associated Drugs" />
              <el-anchor-link v-if="hasComposition" href="#sample-composition" title="Sample Composition" />
              <el-anchor-link v-if="showEnrichmentLinks" href="#enrichment-links" title="Functional Enrichment Links" />
            </el-anchor>
          </el-col>

          <el-col :xs="24" :lg="18">
            <div class="status-cards" v-if="display.clinical_use === 'Yes' || display.target === 'Yes'">
              <div v-if="display.clinical_use === 'Yes'" class="status-item">
                <el-alert title="Clinical Relevance" type="success" :closable="false" show-icon
                  description="This biomarker has confirmed clinical utility." />
              </div>
              <div v-if="display.target === 'Yes'" class="status-item">
                <el-alert title="Therapeutic Target" type="warning" :closable="false" show-icon
                  description="Identified as a potential drug target." />
              </div>
            </div>

            <div id="basic-info" class="content-card">
              <div class="tab-inner">
                <h3 class="section-heading">Basic Information</h3>
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="Name">{{ display.name || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Type">{{ display.type || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Category">{{ display.category || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item
                    v-if="String(display.category).toLowerCase() === 'protein' && display.string_name && String(display.string_name).trim() !== ''"
                    label="Symbol">{{ display.string_name }}</el-descriptions-item>
                  <el-descriptions-item label="Application">{{ display.application || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Description">{{ display.description || 'N/A' }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>

            <div id="article-info" class="content-card">
              <div class="tab-inner">
                <h3 class="section-heading">References</h3>
                <div class="reference-card" v-if="display.reference">
                  <div class="ref-year">{{ display.reference.year || 'N/A' }}</div>
                  <div class="ref-content">
                    <h4 class="ref-journal">{{ display.reference.journal || 'Unknown Journal' }}</h4>
                    <p class="ref-author">By {{ display.reference.author || 'Unknown Author' }}</p>
                    <el-button v-if="display.pmid" size="small" type="primary" plain
                      @click="openExternalLink('pmid', display.pmid)">
                      View PubMed ({{ display.pmid }})
                    </el-button>
                  </div>
                </div>
                <el-empty v-else description="No citation data available" />
              </div>
            </div>

            <div id="experiment-info" class="content-card">
              <div class="tab-inner">
                <h3 class="section-heading">Experimental and Sample Statistics</h3>
                <el-descriptions :column="1" border label-width="180px">
                  <el-descriptions-item label="Region">{{ display.region || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Race">{{ display.race || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Total Sample Size">{{ display.number || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Male">{{ display.male || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Female">{{ display.female || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Gender Ratio">{{ display.gender_ratio || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Average Age">{{ display.age_mean || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Age Range">{{ display.age || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Location">{{ display.location || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Stage">{{ display.stage || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Source">{{ display.source || 'N/A' }}</el-descriptions-item>
                  <el-descriptions-item label="Experiment Method">{{ display.experiment || 'N/A'
                    }}</el-descriptions-item>
                  <el-descriptions-item label="Statistics">{{ display.statistics || 'N/A' }}</el-descriptions-item>
                </el-descriptions>
              </div>
            </div>

            <div id="associated-drugs" class="content-card">
              <div class="tab-inner">
                <h3 class="section-heading">Associated Drugs</h3>
                <div v-if="drugList.length > 0" class="drug-grid">
                  <a v-for="(drug, idx) in drugList" :key="idx" :href="drug.url" target="_blank" class="drug-item">
                    <font-awesome-icon :icon="['fas', 'capsules']" class="mr-2" />
                    {{ drug.label }}
                  </a>
                </div>
                <el-alert v-else title="No Associated Drugs" type="info" :closable="false" show-icon
                  description="No data available for associated drugs." />
              </div>
            </div>

            <div id="sample-composition" class="content-card" v-if="hasComposition">
              <div class="tab-inner">
                <h3 class="section-heading">Sample Composition</h3>
                <div ref="chartRef" class="chart-box"></div>
                <div class="chart-legend">
                  <span v-if="Number(display.male) > 0"><i class="fas fa-circle" style="color:#409EFF"></i> Male</span>
                  <span v-if="Number(display.female) > 0"><i class="fas fa-circle" style="color:#F56C6C"></i>
                    Female</span>
                </div>
              </div>
            </div>

            <div v-if="showEnrichmentLinks" id="enrichment-links" class="content-card">
              <div class="tab-inner">
                <h3 class="section-heading">Functional Enrichment Links</h3>
                <el-skeleton :loading="enrichmentLoading" animated>
                  <template #template>
                    <el-skeleton-item variant="h3" style="width: 40%" />
                    <el-skeleton-item variant="text" />
                    <el-skeleton-item variant="text" />
                    <el-skeleton-item variant="text" />
                  </template>
                  <template #default>
                    <el-tabs type="border-card">
                      <el-tab-pane v-for="(items, cat) in enrichmentByCategory" :key="cat" :label="cat">
                        <el-table :data="items" stripe style="width: 100%">
                          <el-table-column prop="term" label="Term" width="200px">
                            <template #default="scope">
                              <a :href="scope.row.url" target="_blank"
                                :style="{ color: scope.row.color, fontWeight: 'bold' }">{{ scope.row.term }}</a>
                            </template>
                          </el-table-column>
                          <el-table-column prop="link" label="Link">
                            <template #default="scope">
                              <a :href="scope.row.url" target="_blank" style="color: #20558a;">{{ scope.row.url }}</a>
                            </template>
                          </el-table-column>
                        </el-table>
                      </el-tab-pane>
                    </el-tabs>
                  </template>
                </el-skeleton>
              </div>
            </div>


          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
// removed ElMessage (share feature deprecated)
import { getCategoryColor, getTextColorClass } from '@/utils/categoryColors'
import api from '@/utils/api'
import stringApi from '@/services/stringApi'
import { EnrichmentProcessor } from '@/utils/networkAnalysis'
import * as echarts from 'echarts'

const route = useRoute()
const loading = ref(false)
const error = ref(null)
const bio = ref(null)
const chartRef = ref(null)
let chartInstance = null

// --- Data Computed Properties ---
const display = computed(() => {
  const b = bio.value || {}
  return {
    ...b,
    name: b.name || b.biomarker,
    view_count: b.view_count || 0,
    download_count: b.download_count || 0,
    citation_count: b.citation_count || 0
  }
})

const drugList = computed(() => {
  const raw = (display.value?.drugs || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean)
    .filter(label => !/^(no\s*data|n\/?a|none|null|\-)$/i.test(label))

  return raw.map(label => {
    const match = label.match(/DB\d+/i)
    const id = match ? match[0].toUpperCase() : ''
    const url = id ? `https://go.drugbank.com/drugs/${id}` : `https://go.drugbank.com/search?query=${encodeURIComponent(label)}`
    return { label, url }
  })
})

const hasComposition = computed(() => Number(display.value?.male) > 0 || Number(display.value?.female) > 0)

const enrichmentLinks = ref([])
const enrichmentLoading = ref(false)
const showEnrichmentLinks = computed(() => {
  const cat = display.value?.category
  const sym = display.value?.string_name
  if (!cat) return false
  if (String(cat).toLowerCase() !== 'protein') return false
  if (!sym) return false
  const s = String(sym).trim()
  return s !== '' && s.toUpperCase() !== 'NA'
})
const enrichmentByCategory = computed(() => {
  const groups = {}
  for (const item of enrichmentLinks.value) {
    if (!groups[item.category]) groups[item.category] = []
    groups[item.category].push(item)
  }
  return groups
})

const hasArticleInfo = computed(() => {
  return !!(display.value?.reference || display.value?.pmid)
})

const hasExperimentInfo = computed(() => {
  const d = display.value || {}
  return [d.region, d.race, d.number, d.male, d.female, d.gender_ratio, d.age_mean, d.age, d.location, d.stage, d.source, d.experiment, d.statistics]
    .some(v => v !== undefined && v !== null && String(v).trim() !== '')
})

const hasAssociatedDrugs = computed(() => drugList.value.length > 0)

// --- Helper Functions ---
const getCategoryTagType = (category) => {
  const m = { Protein: 'primary', MicroRNA: 'success', Gene: 'warning', Metabolite: 'info', DNA: 'danger', RNA: 'success' }
  return m[category] || 'info'
}

// --- Chart Logic ---
const initChart = () => {
  if (!chartRef.value || !hasComposition.value) return
  if (chartInstance) chartInstance.dispose()

  chartInstance = echarts.init(chartRef.value)
  const data = []
  if (Number(display.value.male) > 0) data.push({ value: Number(display.value.male), name: 'Male', itemStyle: { color: '#409EFF' } })
  if (Number(display.value.female) > 0) data.push({ value: Number(display.value.female), name: 'Female', itemStyle: { color: '#F56C6C' } })

  const option = {
    tooltip: { trigger: 'item' },
    series: [{
      name: 'Sample Composition',
      type: 'pie',
      radius: ['50%', '70%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 5, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      data: data
    }]
  }
  chartInstance.setOption(option)
}

// --- API Calls ---
const fetchBiomarkerDetail = async () => {
  const id = route.params.id
  if (!id) { error.value = 'Invalid ID'; return }
  loading.value = true; error.value = null

  try {
    const response = await api.get(`/biomarkers/${id}`)
    if (response.success) {
      bio.value = response.data
      if (showEnrichmentLinks.value) {
        await loadEnrichment()
      }
      nextTick(() => { initChart() })
    } else {
      error.value = response.message || 'Failed to load'
    }
  } catch (err) {
    error.value = 'Network error'
  } finally {
    loading.value = false
  }
}



const loadEnrichment = async () => {
  try {
    enrichmentLoading.value = true
    const symbol = String(display.value?.string_name || '').trim()
    if (!symbol) { enrichmentLinks.value = []; enrichmentLoading.value = false; return }
    const rows = await stringApi.getEnrichmentAnalysis([symbol], '9606')
    const processor = new EnrichmentProcessor()
    const processed = processor.processEnrichmentData(rows || [], '9606')
    enrichmentLinks.value = processed
  } catch (e) {
    console.error('Failed to load enrichment:', e)
    enrichmentLinks.value = []
  } finally {
    enrichmentLoading.value = false
  }
}


// share feature removed

const openExternalLink = (type, query) => {
  const urls = {
    string: `https://string-db.org/search?search=${encodeURIComponent(query)}`,
    pmid: `https://pubmed.ncbi.nlm.nih.gov/${encodeURIComponent(query)}/`
  }
  if (urls[type]) window.open(urls[type], '_blank')
}

// --- Lifecycle ---
const handleResize = () => chartInstance && chartInstance.resize()
onMounted(() => { fetchBiomarkerDetail(); window.addEventListener('resize', handleResize) })
onUnmounted(() => { window.removeEventListener('resize', handleResize); if (chartInstance) chartInstance.dispose() })
watch(() => route.params.id, (n) => { if (n) fetchBiomarkerDetail() })
</script>

<style scoped>
/* --- 1. Global Page Styles --- */
.biomarker-page {
  min-height: 100vh;
  background-color: var(--bg-secondary);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* --- 2. Hero Header (Matches Advanced Search Header) --- */
.hero-content {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-xl) 0;
}

.hero-row {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: var(--spacing-lg);
}

.hero-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.hero-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.hero-badges {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-sm);
}


.hero-id {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
  color: rgba(255, 255, 255, 0.92);
  font-size: var(--font-size-sm);
}

.hero-id-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 5px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
}

.hero-id-icon {
  color: rgba(255, 255, 255, 0.85);
}

/* Consistent pill heights for ID and tags */
.hero-id-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 32px;
  line-height: 32px;
  padding: 0 5px;
  border-radius: 5px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: rgba(255, 255, 255, 0.95);
}

.hero-pill {
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
}

.hero-pill :deep(.el-tag__content) {
  display: inline-flex;
  align-items: center;
}

.hero-title {
  font-family: var(--font-family-heading);
  font-size: var(--font-size-4xl);
  margin: 0 0 var(--spacing-xs) 0;
  font-weight: 700;
  padding: 50px 0;
}

.hero-subtitle {
  font-size: var(--font-size-base);
  color: var(--text-light);
  margin-bottom: var(--spacing-md);
  max-width: 600px;
}

.hero-actions {
  display: flex;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-md);
}

.hero-btn {
  background-color: white;
  color: #1a365d;
  border: none;
  font-weight: 600;
  padding: 12px 24px;
  height: auto;
}

.hero-btn:hover {
  background-color: #f0f0f0;
  transform: translateY(-2px);
}

.hero-btn-outline {
  background: transparent;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  font-weight: 600;
  padding: 12px 24px;
  height: auto;
}

.hero-btn-outline:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Hero application pill */
.hero-app-tag :deep(.el-tag__content) {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

/* --- 3. Main Content Layout --- */
.main-body {
  position: relative;
  z-index: 3;
  padding-bottom: 60px;
}

/* --- 4. Content Cards --- */
.content-card,
.sidebar-widget {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  border: 1px solid #edf2f7;
  overflow: hidden;
  margin-bottom: 24px;
}

/* --- Status Boxes --- */
.status-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.status-box {
  background: white;
  padding: 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  border-left: 4px solid #ddd;
}

.status-box.success {
  border-left-color: #67C23A;
}

.status-box.success i {
  color: #67C23A;
  font-size: 24px;
}

.status-box.warning {
  border-left-color: #E6A23C;
}

.status-box.warning i {
  color: #E6A23C;
  font-size: 24px;
}

.status-box .label {
  display: block;
  font-weight: 700;
  font-size: 14px;
  color: #2c3e50;
}

.status-box .desc {
  font-size: 13px;
  color: #7f8c8d;
}

/* --- Tabs Styling --- */
.custom-tabs :deep(.el-tabs__header) {
  margin: 0;
  padding: 0 20px;
  border-bottom: 1px solid #f0f2f5;
}

.custom-tabs :deep(.el-tabs__item) {
  font-size: 16px;
  height: 60px;
  line-height: 60px;
  color: #606266;
}

.custom-tabs :deep(.el-tabs__item.is-active) {
  color: #1a365d;
  /* Dark blue active state */
  font-weight: 700;
}

.custom-tabs :deep(.el-tabs__active-bar) {
  background-color: #1a365d;
}

.tab-inner {
  padding: 32px;
}

.section-heading {
  font-size: 18px;
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.text-body {
  line-height: 1.8;
  color: #4a5568;
  font-size: 15px;
}

/* Properties List (Description List) */
.property-list {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background: #edf2f7;
  /* borders */
  border: 1px solid #edf2f7;
  border-radius: 8px;
  overflow: hidden;
}

.property-item {
  display: flex;
  background: white;
}

.property-item dt {
  width: 30%;
  background: #f8fafc;
  padding: 16px;
  font-weight: 600;
  color: #4a5568;
  display: flex;
  align-items: center;
}

.property-item dd {
  width: 70%;
  padding: 16px;
  margin: 0;
  color: #2d3748;
}

/* Drug Tags */
.drug-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.drug-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  /* background: var(--bg-tertiary); */
  /* color: var(--primary-color); */
  background: #ffe3f7;
  color: #ff00b8;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: 500;
  transition: all 0.2s;
  border: 1px solid var(--border-default);
}

.drug-item:hover {
  /* border-color: var(--accent-color); */
  border-color: #ff00b8;
  background: var(--bg-primary);
}

/* Reference Card */
.reference-card {
  display: flex;
  background: #f8fafc;
  border: 1px solid #edf2f7;
  border-radius: 8px;
  padding: 20px;
}

.ref-year {
  font-size: 24px;
  font-weight: 700;
  color: #cbd5e0;
  margin-right: 20px;
  line-height: 1;
}

.ref-journal {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #2d3748;
}

.ref-author {
  font-size: 14px;
  color: #718096;
  margin-bottom: 12px;
}

/* --- 5. Sidebar Styling --- */
.widget-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f2f5;
  background: #fcfcfc;
}

.widget-header h4 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1a365d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.widget-body {
  padding: 20px;
}

/* Stats */
.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px dashed #eee;
}

.stat-row:last-child {
  border-bottom: none;
}

.stat-row .label {
  color: #718096;
}

.stat-row .value {
  font-weight: 700;
  color: #2d3748;
}

/* Chart */
.chart-box {
  height: 220px;
  width: 100%;
}

.chart-legend {
  display: flex;
  justify-content: center;
  gap: 15px;
  font-size: 12px;
  color: #718096;
  margin-top: 10px;
}

/* Resources */
.res-link {
  display: flex;
  align-items: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 10px;
  text-decoration: none;
  color: #2d3748;
  transition: all 0.2s;
}

.res-link:hover {
  background: #f7fafc;
  border-color: #cbd5e0;
}

.res-icon,
.res-icon-circle {
  width: 24px;
  margin-right: 12px;
}

.res-icon-circle {
  width: 28px;
  height: 28px;
  background: #edf2f7;
  color: #4a5568;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.res-link i.fa-chevron-right {
  margin-left: auto;
  font-size: 12px;
  color: #cbd5e0;
}

/* Related Grid */
.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.related-card {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: transform 0.2s;
  border: 1px solid transparent;
}

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
  border-color: #e2e8f0;
}

.rc-category {
  font-size: 10px;
  text-transform: uppercase;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  background: #edf2f7;
  color: #718096;
}

.rc-category.protein {
  color: #409EFF;
  background: #ecf5ff;
}

.rc-category.microrna {
  color: #67C23A;
  background: #f0f9eb;
}

.rc-main h4 {
  margin: 10px 0 4px;
  font-size: 15px;
  color: #2d3748;
}

.rc-main p {
  margin: 0;
  font-size: 13px;
  color: #a0aec0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Mobile Adjustments */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.2rem;
  }

  .hero-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
}

.status-grid {
  grid-template-columns: 1fr;
}

.property-item {
  flex-direction: column;
}

.property-item dt,
.property-item dd {
  width: 100%;
}


.mt-6 {
  margin-top: 24px;
}

.mb-4 {
  margin-bottom: 16px;
}

/* Layout and spacing overrides for consistency */
.main-body {
  padding: var(--spacing-2xl) 0;
}

.tab-inner {
  padding: var(--spacing-xl);
}

/* Status cards consistent with other cards */
.status-cards {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
}

.status-item {
  background: var(--bg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  padding: var(--spacing-sm);
}

.status-item :deep(.el-alert) {
  margin: 0;
}

/* Uniform gaps */
.drug-grid {
  gap: var(--spacing-sm);
}

.related-grid {
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

/* Category tag text color overrides (match list page behavior) */
.category-tag.text-black {
  --el-tag-text-color: #5a5a5a !important;
}

.category-tag.text-white {
  --el-tag-text-color: #ffffff !important;
}

.category-tag.text-black :deep(.el-tag__content) {
  color: #5a5a5a !important;
}

.category-tag.text-white :deep(.el-tag__content) {
  color: #ffffff !important;
}
</style>
