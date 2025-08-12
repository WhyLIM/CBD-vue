<template>
  <section class="about-container">
    <section class="about-content">
      <h2>
        <font-awesome-icon :icon="['fas', 'file-text']" />&nbsp;&nbsp;About Us
      </h2>

      <!-- Help Document Embed Area -->
      <section class="help-frame-container" v-if="helpUrl">
        <iframe :src="helpUrl" class="help-frame" frameborder="0" scrolling="auto"></iframe>
      </section>

      <!-- Default About Content -->
      <section v-else class="default-about">
        <!-- Project Introduction -->
        <el-card class="intro-card">
          <template #header>
            <h3>CBD2: Colorectal Cancer Biomarker Database</h3>
          </template>
          <div class="intro-content">
            <p>
              CBD2 (Colorectal Cancer Biomarker Database) is a professional colorectal cancer biomarker database system
              dedicated to collecting, organizing, and presenting biomarker information related to colorectal cancer,
              providing comprehensive and accurate data support for researchers and clinicians.
            </p>
            <p>
              This database contains a large amount of literature-validated biomarker data, covering various types of
              markers including proteins, RNA, DNA, and provides rich search, analysis, and visualization functions.
            </p>
          </div>
        </el-card>

        <!-- Key Features -->
        <el-card class="features-card">
          <template #header>
            <h3>Key Features</h3>
          </template>
          <el-row :gutter="20">
            <el-col :span="12">
              <div class="feature-item">
                <font-awesome-icon :icon="['fas', 'search']" class="feature-icon" />
                <h4>Smart Search</h4>
                <p>Support keyword search and advanced filtering to quickly locate target biomarkers</p>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="feature-item">
                <font-awesome-icon :icon="['fas', 'list']" class="feature-icon" />
                <h4>Category Browse</h4>
                <p>Organize data by biological classification, application type and other dimensions</p>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="feature-item">
                <font-awesome-icon :icon="['fas', 'flask']" class="feature-icon" />
                <h4>Data Analysis</h4>
                <p>Provide protein-protein interaction network and functional enrichment analysis tools</p>
              </div>
            </el-col>
            <el-col :span="12">
              <div class="feature-item">
                <font-awesome-icon :icon="['fas', 'upload']" class="feature-icon" />
                <h4>Data Submission</h4>
                <p>Support researchers to submit new biomarker data</p>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- Partner Institutions -->
        <el-card class="partners-card">
          <template #header>
            <h3>Partner Institutions</h3>
          </template>
          <div class="partners-content">
            <el-row :gutter="40" align="middle">
              <el-col :span="8" class="partner-item">
                <img src="/images/liu.png" alt="Linköping University" class="partner-logo">
                <h4>Linköping University</h4>
                <p>Bioinformatics Research Center, Linköping University, Sweden</p>
              </el-col>
              <el-col :span="8" class="partner-item">
                <img src="/images/suda.png" alt="Soochow University" class="partner-logo">
                <h4>Soochow University</h4>
                <p>Bioinformatics Laboratory, Medical School, Soochow University</p>
              </el-col>
              <el-col :span="8" class="partner-item">
                <img src="/images/gdph.png" alt="Guangdong Provincial People's Hospital" class="partner-logo">
                <h4>Guangdong Provincial People's Hospital</h4>
                <p>Cancer Center, Guangdong Provincial People's Hospital</p>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- Technical Information -->
        <el-card class="tech-card">
          <template #header>
            <h3>Technical Architecture</h3>
          </template>
          <div class="tech-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="Frontend Framework">Vue 3 + Element Plus</el-descriptions-item>
              <el-descriptions-item label="Backend Technology">Node.js + Express.js</el-descriptions-item>
              <el-descriptions-item label="Database">MySQL</el-descriptions-item>
              <el-descriptions-item label="Build Tool">Vite</el-descriptions-item>
              <el-descriptions-item label="Package Manager">PNPM</el-descriptions-item>
              <el-descriptions-item label="Code Standards">ESLint + Prettier</el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>

        <!-- Version Information -->
        <el-card class="version-card">
          <template #header>
            <h3>Version History</h3>
          </template>
          <div class="version-content">
            <el-timeline>
              <el-timeline-item timestamp="2022-08" placement="top">
                <el-card>
                  <h4>v2.0</h4>
                  <p>Vue3 refactored version with brand new user interface and interaction experience</p>
                </el-card>
              </el-timeline-item>
              <el-timeline-item timestamp="2020-06" placement="top">
                <el-card>
                  <h4>v1.5</h4>
                  <p>Added data exploration features, supporting protein-protein interaction network analysis</p>
                </el-card>
              </el-timeline-item>
              <el-timeline-item timestamp="2019-03" placement="top">
                <el-card>
                  <h4>v1.0</h4>
                  <p>CBD2 officially released, providing basic data browsing and search functions</p>
                </el-card>
              </el-timeline-item>
            </el-timeline>
          </div>
        </el-card>

        <!-- Contact Information -->
        <el-card class="contact-card">
          <template #header>
            <h3>Contact Us</h3>
          </template>
          <div class="contact-content">
            <el-row :gutter="20">
              <el-col :span="12">
                <div class="contact-item">
                  <font-awesome-icon :icon="['fas', 'envelope']" class="contact-icon" />
                  <div>
                    <h4>Email Contact</h4>
                    <p>cbd@example.com</p>
                  </div>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="contact-item">
                  <font-awesome-icon :icon="['fab', 'github']" class="contact-icon" />
                  <div>
                    <h4>Open Source Code</h4>
                    <p>
                      <a href="https://github.com/WhyLIM/CBD" target="_blank">
                        GitHub Repository
                      </a>
                    </p>
                  </div>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-card>

        <!-- Disclaimer -->
        <el-card class="disclaimer-card">
          <template #header>
            <h3>Disclaimer</h3>
          </template>
          <div class="disclaimer-content">
            <p>
              All information provided by this database is for academic research use only and should not be used
              for clinical diagnosis or treatment decisions. Users should independently verify the accuracy and
              applicability of the data.
            </p>
            <p>
              The information in the database comes from published scientific literature. We strive to ensure
              data accuracy, but do not assume any responsibility for the completeness, accuracy, or applicability
              of the data.
            </p>
          </div>
        </el-card>
      </section>
    </section>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const helpUrl = ref('')

onMounted(() => {
  // Check if there's a help document URL parameter
  if (route.query.help) {
    helpUrl.value = route.query.help
  }
})
</script>

<style scoped>
.about-container {
  max-width: 1200px;
  margin: 0 auto;
}

.about-content h2 {
  color: #1B9CFC;
  text-align: center;
  margin-bottom: 30px;
}

.help-frame-container {
  height: 800px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 10px #e1e5ee;
}

.help-frame {
  width: 100%;
  height: 100%;
  border: none;
}

.default-about {
  max-width: 100%;
}

.intro-card,
.features-card,
.partners-card,
.tech-card,
.version-card,
.contact-card,
.disclaimer-card {
  margin-bottom: 30px;
}

.intro-card :deep(.el-card__header),
.features-card :deep(.el-card__header),
.partners-card :deep(.el-card__header),
.tech-card :deep(.el-card__header),
.version-card :deep(.el-card__header),
.contact-card :deep(.el-card__header),
.disclaimer-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.intro-card h3,
.features-card h3,
.partners-card h3,
.tech-card h3,
.version-card h3,
.contact-card h3,
.disclaimer-card h3 {
  margin: 0;
  color: #1B9CFC;
  font-size: 18px;
}

.intro-content p {
  line-height: 1.8;
  color: #333;
  text-align: justify;
  margin-bottom: 15px;
}

.feature-item {
  text-align: center;
  padding: 20px;
  margin-bottom: 20px;
}

.feature-icon {
  font-size: 48px;
  color: #1B9CFC;
  margin-bottom: 15px;
}

.feature-item h4 {
  color: #333;
  margin: 15px 0 10px 0;
  font-size: 16px;
}

.feature-item p {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
}

.partners-content {
  padding: 20px 0;
}

.partner-item {
  text-align: center;
  margin-bottom: 30px;
}

.partner-logo {
  height: 80px;
  margin-bottom: 15px;
  object-fit: contain;
}

.partner-item h4 {
  color: #333;
  margin: 15px 0 10px 0;
  font-size: 16px;
}

.partner-item p {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.tech-content {
  padding: 10px 0;
}

.version-content {
  padding: 20px 0;
}

.version-content :deep(.el-timeline-item__content) {
  padding-left: 20px;
}

.version-content h4 {
  color: #1B9CFC;
  margin: 0 0 10px 0;
}

.version-content p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.contact-content {
  padding: 20px 0;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.contact-icon {
  font-size: 32px;
  color: #1B9CFC;
  margin-right: 20px;
  width: 40px;
}

.contact-item h4 {
  color: #333;
  margin: 0 0 5px 0;
  font-size: 16px;
}

.contact-item p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

.contact-item a {
  color: #1B9CFC;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

.disclaimer-content p {
  line-height: 1.8;
  color: #666;
  text-align: justify;
  margin-bottom: 15px;
}

/* Responsive design */
@media (max-width: 768px) {
  .help-frame-container {
    height: 600px;
  }

  .feature-item,
  .partner-item {
    margin-bottom: 30px;
  }

  .contact-item {
    flex-direction: column;
    text-align: center;
  }

  .contact-icon {
    margin-right: 0;
    margin-bottom: 10px;
  }
}
</style>