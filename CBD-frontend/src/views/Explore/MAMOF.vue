<template>
  <div class="mamof">
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Multi-Ancestry Multi-Omics Framework</h1>
            <p class="hero-subtitle">
              A groundbreaking computational approach for biomarker research across diverse ancestry groups
            </p>
          </div>
        </div>
      </div>
    </section>

    <section class="main-content">
      <div class="container">
        <el-card class="intro-card">
          <template #header>
            <div class="card-header">
              <h2 class="section-title">Framework Overview</h2>
            </div>
          </template>
          <div class="card-body">
            <p class="intro-text">
              The Multi-Ancestry Multi-Omics Framework (MAMOF) represents a groundbreaking computational approach
              designed to address critical challenge of molecular heterogeneity across diverse ancestry groups in
              biomarker research. By integrating multiple high-throughput sequencing technologies with advanced network
              medicine principles, MAMOF enables the identification of both universal and population-specific biomarkers
              across genetically diverse populations.
            </p>
          </div>
        </el-card>

        <el-card class="pipeline-card">
          <template #header>
            <div class="card-header">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'sitemap']" />
                MAMOF Pipeline
              </h2>
            </div>
          </template>
          <div class="card-body">
            <div class="pipeline-wrapper">
              <div class="pipeline-left">
                <div class="pipeline-thumbnail-container">
                  <img src="/images/MAMOF.jpg" alt="MAMOF Pipeline" class="pipeline-thumbnail" />
                  <div class="thumbnail-overlay">
                    <el-button type="primary" @click="openImagePreview" class="expand-btn">
                      <font-awesome-icon :icon="['fas', 'expand']" />
                      Click to View Full Pipeline
                    </el-button>
                  </div>
                </div>
                <p class="image-caption">Click image or button to view full pipeline diagram</p>
              </div>
              <div class="pipeline-right">
                <h3 class="pipeline-right-title">Methodology Overview</h3>
                <div class="pipeline-steps-list">
                  <div class="pipeline-step-item" v-for="step in pipelineSummary" :key="step.key">
                    <div class="step-number">{{ step.number }}</div>
                    <div class="step-content">
                      <h4>{{ step.title }}</h4>
                      <p>{{ step.description }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <el-dialog v-model="imagePreviewVisible" title="MAMOF Pipeline - Full View" width="90%"
          class="image-preview-dialog" :before-close="closeImagePreview">
          <div class="image-preview-container">
            <img src="/images/MAMOF.jpg" alt="MAMOF Pipeline Full View" class="preview-image" />
          </div>
        </el-dialog>

        <el-card class="methodology-card">
          <template #header>
            <div class="card-header">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'microscope']" />
                Core Methodology
              </h2>
            </div>
          </template>
          <div class="card-body">
            <div class="method-section">
              <h3 class="subsection-title">
                <font-awesome-icon :icon="['fas', 'dna']" />
                Multi-Omics Data Integration
              </h3>
              <p class="subsection-description">
                MAMOF integrates four complementary omics technologies to capture comprehensive molecular signatures:
              </p>
              <div class="omics-list">
                <div class="omics-item" v-for="omics in omicsData" :key="omics.key">
                  <div class="omics-text">
                    <strong>{{ omics.title }}:</strong> {{ omics.description }}
                  </div>
                </div>
              </div>
            </div>

            <el-divider />

            <div class="method-section">
              <h3 class="subsection-title">
                <font-awesome-icon :icon="['fas', 'project-diagram']" />
                Network Medicine Approach
              </h3>
              <p class="subsection-description">
                The framework leverages biological interaction networks to overcome traditional limitations in
                multi-ancestry studies:
              </p>
              <el-row :gutter="24" class="approach-grid">
                <el-col :xs="24" :md="12" v-for="approach in networkApproaches" :key="approach.key">
                  <div class="approach-card">
                    <div class="approach-icon">
                      <font-awesome-icon :icon="approach.icon" />
                    </div>
                    <h4>{{ approach.title }}</h4>
                    <p>{{ approach.description }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>

            <el-divider />

            <div class="method-section">
              <h3 class="subsection-title">
                <font-awesome-icon :icon="['fas', 'tags']" />
                Biomarker Classification System
              </h3>
              <el-row :gutter="24" class="biomarker-types">
                <el-col :xs="24" :md="12" v-for="biomarker in biomarkerTypes" :key="biomarker.key">
                  <div class="biomarker-card" :class="biomarker.variant">
                    <div class="biomarker-icon">
                      <font-awesome-icon :icon="biomarker.icon" />
                    </div>
                    <h4>{{ biomarker.title }}</h4>
                    <p>{{ biomarker.description }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>

        <el-card class="technical-card">
          <template #header>
            <div class="card-header">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'code']" />
                Technical Implementation
              </h2>
            </div>
          </template>
          <div class="card-body">
            <div class="method-section">
              <h3 class="subsection-title">
                <font-awesome-icon :icon="['fas', 'stream']" />
                Data Processing Pipeline
              </h3>
              <el-row :gutter="24" class="pipeline-steps">
                <el-col :xs="12" :sm="6" v-for="step in pipelineSteps" :key="step.key">
                  <div class="step-card">
                    <div class="step-icon" :style="{ color: step.color }">
                      <font-awesome-icon :icon="step.icon" />
                    </div>
                    <h4>{{ step.title }}</h4>
                    <p>{{ step.description }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>

            <el-divider />

            <div class="method-section">
              <h3 class="subsection-title">
                <font-awesome-icon :icon="['fas', 'clipboard-check']" />
                Validation Framework
              </h3>
              <p class="subsection-description">
                MAMOF incorporates multiple validation strategies:
              </p>
              <el-row :gutter="16" class="validation-steps">
                <el-col :xs="24" :sm="8" v-for="validation in validations" :key="validation.key">
                  <div class="validation-card" :class="validation.variant">
                    <div class="validation-icon">
                      <font-awesome-icon :icon="validation.icon" />
                    </div>
                    <h4>{{ validation.title }}</h4>
                    <p>{{ validation.description }}</p>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-card>

        <el-card class="applications-card">
          <template #header>
            <div class="card-header">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'rocket']" />
                Applications and Impact
              </h2>
            </div>
          </template>
          <div class="card-body">
            <el-row :gutter="24" class="application-grid">
              <el-col :xs="24" :md="12" v-for="app in applications" :key="app.key">
                <div class="application-block">
                  <h3 class="subsection-title">
                    <font-awesome-icon :icon="app.icon" />
                    {{ app.title }}
                  </h3>
                  <ul class="application-list">
                    <li v-for="item in app.items" :key="item.key">
                      <font-awesome-icon :icon="item.icon" :style="{ color: item.color }" />
                      <span v-if="item.title">
                        <strong>{{ item.title }}:</strong> {{ item.description }}
                      </span>
                      <span v-else>{{ item.description }}</span>
                    </li>
                  </ul>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <el-card class="future-card">
          <template #header>
            <div class="card-header">
              <h2 class="section-title">
                <font-awesome-icon :icon="['fas', 'road']" />
                Future Directions
              </h2>
            </div>
          </template>
          <div class="card-body">
            <p class="future-intro">
              The MAMOF framework establishes a foundation for expanding multi-ancestry research by:
            </p>
            <el-row :gutter="20" class="future-grid">
              <el-col :xs="24" :sm="12" :lg="6" v-for="future in futureDirections" :key="future.key">
                <div class="future-card-item" :style="{ background: future.gradient }">
                  <font-awesome-icon :icon="future.icon" :style="{ color: future.iconColor }" class="future-icon" />
                  <h4 :style="{ color: future.textColor }">{{ future.title }}</h4>
                  <p :style="{ color: future.textColor }">{{ future.description }}</p>
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
import { ref } from 'vue'

const imagePreviewVisible = ref(false)

const openImagePreview = () => {
  imagePreviewVisible.value = true
}

const closeImagePreview = () => {
  imagePreviewVisible.value = false
}

const pipelineSummary = ref([
  {
    key: 'step1',
    number: '01',
    title: 'Data Collection and Quality Control',
    description: 'Integrate WGS, WES, Bulk RNA-seq, and scRNA-seq multi-omics data through standardized quality control processes to ensure data reliability'
  },
  {
    key: 'step2',
    number: '02',
    title: 'Multi-Omics Data Integration',
    description: 'Utilize advanced computational methods to integrate data from different omics layers and build unified multi-omics expression profiles'
  },
  {
    key: 'step3',
    number: '03',
    title: 'Network Mapping and Construction',
    description: 'Map multi-omics data onto biological interaction networks, including protein-protein interactions and gene regulatory networks'
  },
  {
    key: 'step4',
    number: '04',
    title: 'Heterogeneity Resolution',
    description: 'Address sample size variations, batch effects, missing data, and population-specific genetic backgrounds through network projection methods'
  },
  {
    key: 'step5',
    number: '05',
    title: 'Biomarker Classification',
    description: 'Identify cross-population universal biomarkers and population-specific biomarkers to build a complete biomarker classification system'
  },
  {
    key: 'step6',
    number: '06',
    title: 'Validation and Clinical Translation',
    description: 'Ensure discovered biomarkers have practical application value through cross-cohort validation, functional validation, and clinical correlation analysis'
  }
])

const omicsData = ref([
  {
    key: 'wgs',
    title: 'Whole-Genome Sequencing (WGS)',
    description: 'Provides complete genomic landscape including structural variations and regulatory regions'
  },
  {
    key: 'wes',
    title: 'Whole-Exome Sequencing (WES)',
    description: 'Focuses on protein-coding regions to identify functional mutations'
  },
  {
    key: 'bulk-rna',
    title: 'Bulk RNA Sequencing',
    description: 'Captures tissue-level gene expression profiles and transcriptomic signatures'
  },
  {
    key: 'scrna',
    title: 'Single-Cell RNA Sequencing',
    description: 'Reveals cell-type-specific expression patterns and cellular heterogeneity'
  }
])

const networkApproaches = ref([
  {
    key: 'mapping',
    title: 'Network Mapping Strategy',
    description: 'Multi-omics data is systematically mapped onto established biological interaction networks, transforming heterogeneous molecular data into interpretable biological contexts.',
    icon: ['fas', 'map']
  },
  {
    key: 'heterogeneity',
    title: 'Heterogeneity Resolution',
    description: 'Addresses sample size variations, technical batch effects, missing data points, and population-specific genetic backgrounds through network projection.',
    icon: ['fas', 'puzzle-piece']
  }
])

const biomarkerTypes = ref([
  {
    key: 'universal',
    title: 'Universal Biomarkers',
    description: 'Molecular signatures consistent across all ancestry groups, representing conserved biological mechanisms fundamental to disease pathogenesis.',
    icon: ['fas', 'globe'],
    variant: 'universal'
  },
  {
    key: 'specific',
    title: 'Population-Specific Biomarkers',
    description: 'Molecular signatures distinct within specific ancestry groups, reflecting genetic, epigenetic, or environmental factors unique to particular populations.',
    icon: ['fas', 'users'],
    variant: 'specific'
  }
])

const pipelineSteps = ref([
  {
    key: 'quality',
    title: 'Quality Control',
    description: 'Standardized preprocessing protocols',
    icon: ['fas', 'check-circle'],
    color: '#2a5298'
  },
  {
    key: 'integration',
    title: 'Multi-Modal Integration',
    description: 'Advanced computational methods',
    icon: ['fas', 'layer-group'],
    color: '#2a5298'
  },
  {
    key: 'network',
    title: 'Network Construction',
    description: 'Biological interaction networks',
    icon: ['fas', 'sitemap'],
    color: '#2a5298'
  },
  {
    key: 'statistical',
    title: 'Statistical Analysis',
    description: 'Robust statistical methods',
    icon: ['fas', 'chart-line'],
    color: '#2a5298'
  }
])

const validations = ref([
  {
    key: 'cross',
    title: 'Cross-Cohort Validation',
    description: 'Biomarkers identified in one population are tested for reproducibility in independent cohorts',
    icon: ['fas', 'exchange-alt'],
    variant: 'warning'
  },
  {
    key: 'functional',
    title: 'Functional Validation',
    description: 'Experimental techniques such as immunohistochemistry confirm biological relevance',
    icon: ['fas', 'flask'],
    variant: 'info'
  },
  {
    key: 'clinical',
    title: 'Clinical Correlation',
    description: 'Biomarker performance evaluated against clinical outcomes and diagnostic criteria',
    icon: ['fas', 'user-md'],
    variant: 'success'
  }
])

const applications = ref([
  {
    key: 'clinical',
    title: 'Clinical Translation',
    icon: ['fas', 'hospital'],
    items: [
      {
        key: 'diagnosis',
        title: 'Early Diagnosis',
        description: 'Universal biomarkers for broad-spectrum diagnostic tools',
        icon: ['fas', 'stethoscope'],
        color: '#4caf50'
      },
      {
        key: 'treatment',
        title: 'Personalized Treatment',
        description: 'Population-specific ancestry-tailored therapeutic strategies',
        icon: ['fas', 'user-check'],
        color: '#2196f3'
      },
      {
        key: 'risk',
        title: 'Risk Stratification',
        description: 'Combined universal and specific signatures for comprehensive profiling',
        icon: ['fas', 'chart-pie'],
        color: '#ff9800'
      }
    ]
  },
  {
    key: 'research',
    title: 'Research Applications',
    icon: ['fas', 'microscope'],
    items: [
      {
        key: 'ancestry',
        description: 'Multi-ancestry studies in other diseases',
        icon: ['fas', 'globe-americas'],
        color: '#f44336'
      },
      {
        key: 'omics',
        description: 'Integration of emerging omics technologies',
        icon: ['fas', 'dna'],
        color: '#667eea'
      },
      {
        key: 'precision',
        description: 'Development of inclusive precision medicine approaches',
        icon: ['fas', 'balance-scale'],
        color: '#ff9800'
      }
    ]
  }
])

const futureDirections = ref([
  {
    key: 'population',
    title: 'Expanding Populations',
    description: 'Incorporating additional ancestry groups and geographical regions',
    icon: ['fas', 'users'],
    gradient: 'linear-gradient(45deg, #ff9a9e 0%, #fecfef 100%)',
    iconColor: '#fff',
    textColor: '#fff'
  },
  {
    key: 'environment',
    title: 'Environmental Integration',
    description: 'Integrating environmental and lifestyle factors',
    icon: ['fas', 'leaf'],
    gradient: 'linear-gradient(45deg, #a8edea 0%, #fed6e3 100%)',
    iconColor: '#4caf50',
    textColor: '#333'
  },
  {
    key: 'clinical',
    title: 'Clinical Systems',
    description: 'Developing real-time clinical decision support systems',
    icon: ['fas', 'laptop-medical'],
    gradient: 'linear-gradient(45deg, #ffecd2 0%, #fcb69f 100%)',
    iconColor: '#2196f3',
    textColor: '#333'
  },
  {
    key: 'therapeutic',
    title: 'Therapeutic Protocols',
    description: 'Creating population-specific therapeutic protocols',
    icon: ['fas', 'pills'],
    gradient: 'linear-gradient(45deg, #d299c2 0%, #fef9d7 100%)',
    iconColor: '#f44336',
    textColor: '#333'
  }
])
</script>

<style scoped>
.mamof {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.hero-section {
  position: relative;
}

.hero-background {
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: white;
  padding: 60px 0 50px;
}

.hero-content {
  text-align: center;
}

.back-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);
  color: white;
  margin-bottom: 24px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateX(-4px);
}

.hero-title {
  font-size: clamp(2rem, 1.8rem + 1.2vw, 2.5rem);
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 16px;
  color: white;
}

.hero-subtitle {
  font-size: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.9);
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.main-content {
  padding: 40px 0 60px;
}

.el-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  margin-bottom: 24px;
  overflow: hidden;
}

.el-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.el-card :deep(.el-card__header) {
  border-bottom: 1px solid #f0f0f0;
  background: #fafbfc;
  padding: 20px;
}

.el-card :deep(.el-card__body) {
  padding: 24px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.subsection-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.subsection-description {
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.method-section {
  margin-bottom: 32px;
}

.intro-text {
  font-size: 1rem;
  line-height: 1.6;
  color: #666;
  margin: 0;
}

.pipeline-wrapper {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.pipeline-left {
  flex: 0 0 470px;
}

.pipeline-thumbnail-container {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.pipeline-thumbnail-container:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.pipeline-thumbnail {
  width: 100%;
  height: auto;
  display: block;
}

.thumbnail-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(30, 60, 114, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.pipeline-thumbnail-container:hover .thumbnail-overlay {
  opacity: 1;
}

.expand-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 20px 32px;
  background: rgba(255, 255, 255, 0.95);
  color: #1e3c72;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
}

.expand-btn .fa-expand {
  font-size: 1.5rem;
}

.pipeline-right {
  flex: 1;
}

.pipeline-right-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.pipeline-right-title::before {
  content: '';
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
}

.pipeline-steps-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pipeline-step-item {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.step-number {
  flex: 0 0 40px;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.step-content {
  flex: 1;
}

.step-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 6px 0;
}

.step-content p {
  font-size: 0.9375rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.image-caption {
  margin: 12px 0 0 0;
  color: #666;
  font-size: 0.875rem;
  font-style: italic;
  text-align: center;
}

.image-preview-dialog {
  display: flex;
  flex-direction: column;
}

.image-preview-dialog :deep(.el-dialog__body) {
  padding: 0;
  overflow: auto;
  max-height: 80vh;
}

.image-preview-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  background: #f5f5f5;
  padding: 20px;
}

.preview-image {
  max-width: 100%;
  height: auto;
  display: block;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
}

.omics-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.omics-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8fbff;
  border-left: 4px solid #2a5298;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.omics-item:hover {
  background: #e3f2fd;
  border-left-color: #667eea;
  transform: translateX(4px);
}

.omics-icon {
  color: #2a5298;
  font-size: 0.5rem;
  margin-top: 4px;
}

.omics-text {
  flex: 1;
  color: #2c3e50;
  line-height: 1.6;
}

.approach-grid {
  margin-top: 20px;
  align-items: stretch;
}

.approach-grid :deep(.el-col) {
  display: flex;
}

.approach-card {
  padding: 24px;
  background: #fafbfc;
  border-radius: 12px;
  text-align: center;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.approach-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.approach-icon {
  font-size: 2.5rem;
  color: #1e3c72;
  margin-bottom: 16px;
}

.approach-card h4 {
  color: #1e3c72;
  margin: 0 0 12px 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.approach-card p {
  margin: 0;
  font-size: 0.9375rem;
  color: #666;
  line-height: 1.6;
}

.biomarker-types {
  margin-top: 20px;
  align-items: stretch;
}

.biomarker-types :deep(.el-col) {
  display: flex;
}

.biomarker-card {
  padding: 32px;
  border-radius: 12px;
  text-align: center;
  color: white;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.biomarker-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.biomarker-card.universal {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.biomarker-card.specific {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.biomarker-icon {
  font-size: 2.5rem;
  margin-bottom: 16px;
}

.biomarker-card h4 {
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.biomarker-card p {
  margin: 0;
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.95;
}

.pipeline-steps {
  margin-top: 20px;
  align-items: stretch;
}

.step-card {
  padding: 20px;
  background: #fafbfc;
  border: 2px solid #f0f0f0;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.step-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.step-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.step-card h4 {
  margin: 0 0 8px 0;
  font-size: 1rem;
  color: #1e3c72;
  font-weight: 600;
}

.step-card p {
  margin: 0;
  font-size: 0.875rem;
  color: #666;
  line-height: 1.5;
}

.validation-steps {
  margin-top: 20px;
  align-items: stretch;
}

.validation-card {
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.validation-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.validation-card.warning {
  background: linear-gradient(135deg, #fff3e0 0%, #ffeaa7 100%);
  border: 1px solid #fdcb6e;
}

.validation-card.info {
  background: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
  border: 1px solid #a8dadc;
}

.validation-card.success {
  background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
  border: 1px solid #95d5b2;
}

.validation-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.validation-card.warning .validation-icon {
  color: #856404;
}

.validation-card.info .validation-icon {
  color: #0c5460;
}

.validation-card.success .validation-icon {
  color: #155724;
}

.validation-card h4 {
  margin: 0 0 12px 0;
  font-size: 1rem;
  font-weight: 600;
}

.validation-card.warning h4 {
  color: #856404;
}

.validation-card.info h4 {
  color: #0c5460;
}

.validation-card.success h4 {
  color: #155724;
}

.validation-card p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
}

.application-grid {
  margin-top: 20px;
  align-items: stretch;
}

.application-block {
  background: #fafbfc;
  padding: 24px;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
  transition: all 0.3s ease;
  height: 100%;
}

.application-block:hover {
  border-color: #667eea;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.application-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.application-list li {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
  color: #2c3e50;
  line-height: 1.6;
  font-size: 0.9375rem;
}

.application-list li span {
  flex: 1;
}

.future-intro {
  font-size: 1rem;
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

.future-grid {
  margin-top: 20px;
  align-items: stretch;
}

.future-card-item {
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 0;
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}

.future-card-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.future-icon {
  font-size: 2rem;
  margin-bottom: 16px;
}

.future-card-item h4 {
  margin: 8px 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.future-card-item p {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.6;
}

.conclusion-section {
  margin-bottom: 24px;
}

.conclusion-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.3);
}

.conclusion-title {
  font-size: 1.875rem;
  font-weight: 600;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.conclusion-text {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-conclusion {
  font-size: 1.125rem;
  margin: 0;
  line-height: 1.7;
}

.sub-conclusion {
  font-size: 1rem;
  margin: 0;
  line-height: 1.6;
  opacity: 0.9;
}

.el-divider {
  margin: 32px 0;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 1024px) {
  .hero-title {
    font-size: clamp(1.75rem, 1.6rem + 0.9vw, 2rem);
  }

  .hero-subtitle {
    font-size: clamp(0.9375rem, 0.9rem + 0.2vw, 1rem);
  }

  .section-title {
    font-size: 1.125rem;
  }

  .pipeline-left {
    flex: 0 0 320px;
  }

  .expand-btn {
    padding: 16px 24px;
    font-size: 0.9375rem;
  }
}

@media (max-width: 768px) {
  .hero-background {
    padding: 40px 0 30px;
  }

  .hero-title {
    font-size: clamp(1.5rem, 1.4rem + 0.6vw, 1.75rem);
  }

  .hero-subtitle {
    font-size: 0.9375rem;
  }

  .main-content {
    padding: 30px 0 40px;
  }

  .pipeline-wrapper {
    flex-direction: column;
    gap: 24px;
  }

  .pipeline-left {
    flex: 0 0 auto;
    width: 100%;
  }

  .expand-btn {
    padding: 16px 24px;
  }

  .step-number {
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    font-size: 0.8125rem;
  }

  .step-content h4 {
    font-size: 0.9375rem;
  }

  .step-content p {
    font-size: 0.875rem;
  }

  .approach-grid,
  .biomarker-types,
  .validation-steps,
  .future-grid {
    flex-direction: column;
  }

  .approach-card,
  .biomarker-card,
  .validation-card,
  .future-card-item {
    margin-bottom: 16px;
  }

  .conclusion-content {
    padding: 24px;
  }

  .conclusion-title {
    font-size: 1.5rem;
    flex-direction: column;
  }

  .main-conclusion {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .hero-background {
    padding: 30px 0 20px;
  }

  .hero-title {
    font-size: clamp(1.25rem, 1.2rem + 0.3vw, 1.5rem);
  }

  .hero-subtitle {
    font-size: 0.875rem;
  }

  .main-content {
    padding: 20px 0 30px;
  }

  .el-card :deep(.el-card__header),
  .el-card :deep(.el-card__body) {
    padding: 16px;
  }

  .section-title {
    font-size: 1rem;
  }

  .subsection-title {
    font-size: 1rem;
  }

  .expand-btn {
    padding: 14px 20px;
    font-size: 0.875rem;
  }

  .expand-btn .fa-expand {
    font-size: 1.25rem;
  }

  .pipeline-step-item {
    gap: 12px;
  }

  .conclusion-content {
    padding: 20px;
  }

  .conclusion-title {
    font-size: 1.25rem;
  }

  .main-conclusion {
    font-size: 0.9375rem;
  }
}
</style>
