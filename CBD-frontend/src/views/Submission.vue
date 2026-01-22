<template>
  <section class="submission-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Data Submission</h1>
            <p class="hero-subtitle">Contribute high-quality biomarker data to the CBD database and advance scientific
              research</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Online Form Submission -->
    <section class="form-submission-section">
      <div class="container">
        <el-card class="submission-form-card">
          <template #header>
            <div class="form-header">
              <h3 class="form-title">
                <font-awesome-icon :icon="['fas', 'edit']" />
                Biomarker Information Submission Form
              </h3>
              <div class="form-progress">
                <el-steps :active="currentStep" finish-status="success" simple>
                  <el-step title="Basic Info" />
                  <el-step title="Details" />
                  <el-step title="Literature" />
                  <el-step title="Confirm" />
                </el-steps>
              </div>
            </div>
          </template>

          <el-form ref="submissionForm" :model="formData" :rules="formRules" label-width="140px"
            class="submission-form">
            <!-- Step 1: Basic Information -->
            <div v-show="currentStep === 0" class="form-step">
              <div class="step-header">
                <h4 class="step-title">Basic Information</h4>
                <p class="step-description">Please fill in the basic information of the biomarker</p>
              </div>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Marker Name" prop="name" required>
                    <el-input v-model="formData.name" placeholder="Enter marker name" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Marker Category" prop="category" required>
                    <el-select v-model="formData.category" placeholder="Select category" style="width: 100%">
                      <el-option v-for="category in categories" :key="category.value" :label="category.label"
                        :value="category.value" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Application Type" prop="application" required>
                    <el-select v-model="formData.application" placeholder="Select application type" style="width: 100%">
                      <el-option v-for="app in applications" :key="app" :label="app" :value="app" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Detection Method" prop="detection_method">
                    <el-input v-model="formData.detection_method" placeholder="Enter detection method" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="Marker Description" prop="description">
                <el-input v-model="formData.description" type="textarea" :rows="4"
                  placeholder="Briefly describe the characteristics and functions of this biomarker" />
              </el-form-item>
            </div>

            <!-- Step 2: Detailed Information -->
            <div v-show="currentStep === 1" class="form-step">
              <div class="step-header">
                <h4 class="step-title">Detailed Information</h4>
                <p class="step-description">Please fill in more detailed technical parameters and performance indicators
                </p>
              </div>

              <el-row :gutter="20">
                <el-col :span="8">
                  <el-form-item label="Sensitivity" prop="sensitivity">
                    <el-input v-model="formData.sensitivity" placeholder="e.g., 85.2%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="Specificity" prop="specificity">
                    <el-input v-model="formData.specificity" placeholder="e.g., 92.1%" />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item label="AUC Value" prop="auc">
                    <el-input v-model="formData.auc" placeholder="e.g., 0.876" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Sample Type" prop="sample_type">
                    <el-select v-model="formData.sample_type" placeholder="Select sample type" style="width: 100%">
                      <el-option label="Serum" value="serum" />
                      <el-option label="Plasma" value="plasma" />
                      <el-option label="Tissue" value="tissue" />
                      <el-option label="Urine" value="urine" />
                      <el-option label="Stool" value="stool" />
                      <el-option label="Other" value="other" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Sample Size" prop="sample_size">
                    <el-input v-model="formData.sample_size" placeholder="e.g., 120 cases, 80 controls" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="Clinical Significance" prop="clinical_significance">
                <el-input v-model="formData.clinical_significance" type="textarea" :rows="3"
                  placeholder="Describe the clinical application value and significance of this marker" />
              </el-form-item>

              <el-form-item label="Technical Details" prop="technical_details">
                <el-input v-model="formData.technical_details" type="textarea" :rows="3"
                  placeholder="Describe detection technical details, experimental conditions, etc." />
              </el-form-item>
            </div>

            <!-- Step 3: Literature Information -->
            <div v-show="currentStep === 2" class="form-step">
              <div class="step-header">
                <h4 class="step-title">Literature Information</h4>
                <p class="step-description">Please provide relevant literature citation information</p>
              </div>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="First Author" prop="first_author" required>
                    <el-input v-model="formData.first_author" placeholder="Enter first author name" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Corresponding Author" prop="corresponding_author">
                    <el-input v-model="formData.corresponding_author" placeholder="Enter corresponding author name" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="Journal Name" prop="journal" required>
                    <el-input v-model="formData.journal" placeholder="Enter journal name" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="Publication Year" prop="publication_year" required>
                    <el-date-picker v-model="formData.publication_year" type="year" placeholder="Select year"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="DOI" prop="doi">
                    <el-input v-model="formData.doi" placeholder="e.g., 10.1038/nature12373" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="PMID" prop="pmid">
                    <el-input v-model="formData.pmid" placeholder="e.g., 23842776" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="Article Title" prop="title" required>
                <el-input v-model="formData.title" placeholder="Enter complete article title" />
              </el-form-item>

              <el-form-item label="Abstract" prop="abstract">
                <el-input v-model="formData.abstract" type="textarea" :rows="5"
                  placeholder="Paste article abstract (optional)" />
              </el-form-item>
            </div>

            <!-- Step 4: Confirm Submission -->
            <div v-show="currentStep === 3" class="form-step">
              <div class="step-header">
                <h4 class="step-title">Confirm Submission</h4>
                <p class="step-description">Please confirm that your submitted information is correct</p>
              </div>

              <div class="confirmation-content">
                <el-card class="info-preview">
                  <template #header>
                    <h5>Basic Information Preview</h5>
                  </template>
                  <div class="preview-grid">
                    <div class="preview-item">
                      <label>Marker Name:</label>
                      <span>{{ formData.name || 'Not filled' }}</span>
                    </div>
                    <div class="preview-item">
                      <label>Marker Category:</label>
                      <span>{{ getCategoryLabel(formData.category) || 'Not selected' }}</span>
                    </div>
                    <div class="preview-item">
                      <label>Application Type:</label>
                      <span>{{ formData.application || 'Not selected' }}</span>
                    </div>
                    <div class="preview-item">
                      <label>First Author:</label>
                      <span>{{ formData.first_author || 'Not filled' }}</span>
                    </div>
                    <div class="preview-item">
                      <label>Journal Name:</label>
                      <span>{{ formData.journal || 'Not filled' }}</span>
                    </div>
                    <div class="preview-item">
                      <label>Publication Year:</label>
                      <span>{{ formData.publication_year ? new Date(formData.publication_year).getFullYear() : 'Not selected' }}</span>
                    </div>
                  </div>
                </el-card>

                <div class="submission-agreement">
                  <el-checkbox v-model="agreementAccepted">
                    I have read and agree to the
                    <el-button type="primary" link @click="showAgreement = true">Data Submission Agreement</el-button>
                  </el-checkbox>
                </div>
              </div>
            </div>

            <!-- Form Action Buttons -->
            <div class="form-actions">
              <el-button v-if="currentStep > 0" @click="prevStep">Previous</el-button>
              <el-button v-if="currentStep < 3" type="primary" @click="nextStep">Next</el-button>
              <el-button v-if="currentStep === 3" type="success" @click="submitForm" :loading="submitting"
                :disabled="!agreementAccepted">
                <font-awesome-icon :icon="['fas', 'paper-plane']" />
                Submit Data
              </el-button>
            </div>
          </el-form>
        </el-card>
      </div>
    </section>

    <!-- Data Submission Agreement Dialog -->
    <el-dialog v-model="showAgreement" title="Data Submission Agreement" width="60%" class="agreement-dialog">
      <div class="agreement-content">
        <h4>1. Data Quality Requirements</h4>
        <p>Submitted data must be accurate, complete, and properly validated. We reserve the right to reject or request
          modifications to data that does not meet quality standards.</p>

        <h4>2. Intellectual Property</h4>
        <p>Submitters confirm that they have legal rights to the submitted data and authorize the CBD database to use,
          store, and distribute this data.</p>

        <h4>3. Data Usage</h4>
        <p>Submitted data will be used for scientific research purposes and may be cited and used by other researchers.
          We will appropriately attribute data sources.</p>

        <h4>4. Privacy Protection</h4>
        <p>We are committed to protecting submitters' privacy and will not disclose personal sensitive information.</p>

        <h4>5. Disclaimer</h4>
        <p>The CBD database assumes no legal responsibility for the accuracy and completeness of data. Users should
          verify data reliability themselves.</p>
      </div>

      <template #footer>
        <el-button @click="showAgreement = false">Close</el-button>
      </template>
    </el-dialog>
  </section>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '@/utils/api'

// Reactive data
const currentStep = ref(0)
const submitting = ref(false)
const agreementAccepted = ref(false)
const showAgreement = ref(false)

const formData = reactive({
  name: '',
  category: '',
  application: '',
  detection_method: '',
  description: '',
  sensitivity: '',
  specificity: '',
  auc: '',
  sample_type: '',
  sample_size: '',
  clinical_significance: '',
  technical_details: '',
  first_author: '',
  corresponding_author: '',
  journal: '',
  publication_year: null,
  doi: '',
  pmid: '',
  title: '',
  abstract: ''
})

const formRules = reactive({
  name: [{ required: true, message: 'Please enter marker name', trigger: 'blur' }],
  category: [{ required: true, message: 'Please select marker category', trigger: 'change' }],
  application: [{ required: true, message: 'Please select application type', trigger: 'change' }],
  first_author: [{ required: true, message: 'Please enter first author', trigger: 'blur' }],
  journal: [{ required: true, message: 'Please enter journal name', trigger: 'blur' }],
  publication_year: [{ required: true, message: 'Please select publication year', trigger: 'change' }],
  title: [{ required: true, message: 'Please enter article title', trigger: 'blur' }]
})

const categories = ref([
  { value: 'Protein', label: 'Protein' },
  { value: 'MicroRNA', label: 'MicroRNA' },
  { value: 'Gene', label: 'Gene' },
  { value: 'Metabolite', label: 'Metabolite' },
  { value: 'DNA', label: 'DNA' },
  { value: 'RNA', label: 'RNA' }
])

const applications = ref([
  'Diagnostic Marker', 'Prognostic Marker', 'Therapeutic Target', 'Drug Response', 'Disease Subtyping'
])

// Methods
const nextStep = () => {
  if (currentStep.value < 3) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const submitForm = async () => {
  if (!agreementAccepted.value) {
    ElMessage.warning('Please agree to the data submission agreement first')
    return
  }

  submitting.value = true
  try {
    const response = await api.post('/submissions', formData)
    if (response.success) {
      ElMessage.success('Data submitted successfully, we will review it as soon as possible')
      // Reset form
      Object.keys(formData).forEach(key => {
        if (key === 'publication_year') {
          formData[key] = null
        } else {
          formData[key] = ''
        }
      })
      currentStep.value = 0
      agreementAccepted.value = false
    }
  } catch (error) {
    console.error('Submission failed:', error)
    ElMessage.error('Submission failed, please try again later')
  } finally {
    submitting.value = false
  }
}

const getCategoryLabel = (value) => {
  const category = categories.value.find(cat => cat.value === value)
  return category ? category.label : value
}

onMounted(() => {
  // Initialization logic
})
</script>

<style scoped>
.submission-page {
  min-height: 100vh;
  background: var(--bg-secondary);
}

/* Form Submission Section */
.form-submission-section {
  padding: var(--spacing-2xl) 0;
}

.submission-form-card {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-xl);
}

.form-header {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-lg);
}

.form-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0;
}

.form-progress {
  width: 100%;
}

.form-progress :deep(.el-steps) {
  display: flex;
  justify-content: space-between;
  position: relative;
}

.form-progress :deep(.el-steps--simple) {
  background: transparent;
}

.form-progress :deep(.el-step) {
  flex: 1;
  text-align: center;
  position: relative;
}

.form-progress :deep(.el-step__head) {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.form-progress :deep(.el-step__icon.is-process) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.form-progress :deep(.el-step__icon.is-finish) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.form-progress :deep(.el-step.is-process .el-step__title) {
  color: #667eea;
  font-weight: 600;
}

.form-progress :deep(.el-step.is-finish .el-step__title) {
  color: #667eea;
  font-weight: 600;
}

.form-progress :deep(.el-step__title) {
  color: #666;
  transition: all 0.3s ease;
}

.form-progress :deep(.el-step__line) {
  background-color: #e0e0e0;
  height: 3px;
  top: 24px;
}

.form-progress :deep(.el-step__line-inner) {
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  transition: all 0.3s ease;
}

.submission-form {
  padding: var(--spacing-lg) 0;
}

.form-step {
  min-height: 400px;
}

.step-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--border-light);
}

.step-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--primary-color);
  margin: 0 0 var(--spacing-sm) 0;
}

.step-description {
  font-size: var(--font-size-base);
  color: var(--text-secondary);
  margin: 0;
}

.confirmation-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.info-preview {
  border: 1px solid var(--border-light);
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.preview-item {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-light);
}

.preview-item label {
  font-weight: 600;
  color: var(--text-primary);
}

.preview-item span {
  color: var(--text-secondary);
}

.submission-agreement {
  text-align: center;
  padding: var(--spacing-lg);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.form-actions {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  padding-top: var(--spacing-xl);
  border-top: 1px solid var(--border-light);
  margin-top: var(--spacing-xl);
}

/* Agreement Dialog */
.agreement-dialog .agreement-content {
  line-height: var(--line-height-relaxed);
}

.agreement-dialog .agreement-content h4 {
  color: var(--primary-color);
  margin: var(--spacing-lg) 0 var(--spacing-sm) 0;
}

.agreement-dialog .agreement-content h4:first-child {
  margin-top: 0;
}

.agreement-dialog .agreement-content p {
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md) 0;
}

/* Responsive Design */
@media (max-width: 768px) {
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .submission-form {
    padding: var(--spacing-md) 0;
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

.form-step {
  animation: slideInUp 0.4s ease-out;
}
</style>
