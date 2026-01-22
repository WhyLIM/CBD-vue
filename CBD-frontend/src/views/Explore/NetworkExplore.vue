<template>
  <div class="explore">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Network Exploration</h1>
            <p class="hero-subtitle">
              Visualize and analyze protein-protein interaction networks using STRING database
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <!-- Main Layout Container -->
        <el-row :gutter="24" class="main-container">
          <!-- Left Sidebar - Control Panel -->
          <el-col :xs="24" :lg="7" class="control-aside">
            <div class="control-panel">
              <el-card class="control-card">
                <template #header>
                  <h3 class="panel-title">
                    <font-awesome-icon :icon="['fas', 'cogs']" />
                    Network Parameters
                  </h3>
                </template>

                <!-- Protein Input Methods -->
                <div class="input-section">
                  <el-tabs v-model="inputMethod" @tab-change="handleInputMethodChange">
                    <el-tab-pane label="Manual Input" name="manual">
                      <div class="form-group">
                        <label class="form-label">Protein Names</label>
                        <el-input v-model="proteinInput" type="textarea" :rows="6"
                          placeholder="Enter protein names (one per line)&#10;Example:&#10;TP53&#10;BRCA1&#10;EGFR"
                          class="protein-textarea" />
                        <div class="input-hint">
                          <font-awesome-icon :icon="['fas', 'info-circle']" />
                          Gene symbols or protein names are accepted.
                        </div>
                      </div>
                    </el-tab-pane>

                    <el-tab-pane label="From Database" name="database">
                      <div class="form-group">
                        <label class="form-label">Select Proteins from CBD</label>
                        <el-select v-model="selectedProteins" multiple filterable
                          placeholder="Search and select proteins" class="protein-select" :loading="loadingProteins">
                          <el-option v-for="protein in availableProteins" :key="protein.value" :label="protein.label"
                            :value="protein.value" />
                        </el-select>
                      </div>
                    </el-tab-pane>

                    <el-tab-pane label="File Upload" name="file">
                      <div class="form-group">
                        <label class="form-label">Upload Protein List</label>
                        <el-upload class="upload-demo" drag :auto-upload="false" :on-change="handleFileUpload"
                          accept=".txt,.csv" :limit="1">
                          <font-awesome-icon :icon="['fas', 'upload']" class="upload-icon" />
                          <div class="el-upload__text">
                            Drop file here or <em>click to upload</em>
                          </div>
                          <template #tip>
                            <div class="el-upload__tip">
                              txt/csv files with one protein per line
                            </div>
                          </template>
                        </el-upload>
                      </div>
                    </el-tab-pane>
                  </el-tabs>
                </div>

                <!-- Network Parameters -->
                <div class="parameters-section">
                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">
                          Species
                          <el-tooltip content="Select the organism species" placement="top">
                            <font-awesome-icon :icon="['fas', 'question-circle']" class="help-icon" />
                          </el-tooltip>
                        </label>
                        <el-select v-model="networkParams.species" class="param-select">
                          <el-option label="Human (Homo sapiens)" value="9606" />
                          <el-option label="Mouse (Mus musculus)" value="10090" />
                          <el-option label="Rat (Rattus norvegicus)" value="10116" />
                        </el-select>
                      </div>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">
                          Confidence Score
                          <el-tooltip content="Minimum interaction confidence score (0-1000)" placement="top">
                            <font-awesome-icon :icon="['fas', 'question-circle']" class="help-icon" />
                          </el-tooltip>
                        </label>
                        <el-slider v-model="networkParams.requiredScore" :min="0" :max="1000" :step="50" show-input
                          class="score-slider" />
                      </div>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">Network Type</label>
                        <el-radio-group v-model="networkParams.networkType" class="network-type-group">
                          <el-radio label="functional">Functional</el-radio>
                          <el-radio label="physical">Physical</el-radio>
                        </el-radio-group>
                      </div>
                    </el-col>
                  </el-row>

                  <el-row :gutter="16">
                    <el-col :span="24">
                      <div class="form-group">
                        <label class="form-label">Network Flavor</label>
                        <el-select v-model="networkParams.networkFlavor" class="param-select">
                          <el-option label="Confidence" value="confidence" />
                          <el-option label="Evidence" value="evidence" />
                          <el-option label="Actions" value="actions" />
                        </el-select>
                      </div>
                    </el-col>
                  </el-row>

                  <el-row>
                    <el-col :span="24">
                      <div class="form-group">
                        <el-checkbox v-model="networkParams.hideDisconnected">
                          Hide disconnected nodes
                        </el-checkbox>
                      </div>
                    </el-col>
                  </el-row>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                  <el-row :gutter="12">
                    <el-col :span="16">
                      <el-button type="primary" @click="generateNetwork" :loading="loading" class="generate-btn" block>
                        <font-awesome-icon :icon="['fas', 'play']" />&nbsp;Generate Network
                      </el-button>
                    </el-col>
                    <el-col :span="8">
                      <el-button @click="clearInput" class="clear-btn" block>
                        <font-awesome-icon :icon="['fas', 'trash']" />&nbsp;Clear
                      </el-button>
                    </el-col>
                  </el-row>
                </div>

                <!-- Example Buttons -->
                <div class="example-section" v-if="!networkGenerated">
                  <label class="form-label">Try Examples:</label>
                  <div class="example-buttons">
                    <el-button v-for="example in examples" :key="example.key" size="small" @click="loadExample(example)"
                      class="example-btn">
                      {{ example.label }}
                    </el-button>
                  </div>
                </div>
              </el-card>

              <!-- Network Statistics -->
              <el-card v-if="networkStats" class="stats-card">
                <template #header>
                  <h3 class="panel-title">
                    <font-awesome-icon :icon="['fas', 'chart-bar']" />
                    Network Statistics
                  </h3>
                </template>
                <div class="stats-content">
                  <el-row :gutter="8" v-for="(value, key) in networkStats" :key="key" class="stat-row">
                    <el-col :span="14">
                      <span class="stat-label">{{ formatStatLabel(key) }}:</span>
                    </el-col>
                    <el-col :span="10">
                      <span class="stat-value">{{ formatStatValue(key, value) }}</span>
                    </el-col>
                  </el-row>
                </div>
              </el-card>
            </div>
          </el-col>

          <!-- Main Content Area -->
          <el-col :xs="24" :lg="17" class="main-area">
            <!-- Network Visualization -->
            <el-card class="network-card">
              <NetworkVisualization :network-data="networkData" :loading="loading" :topology-data="topologyData"
                @node-selected="handleNodeSelected" @edge-selected="handleEdgeSelected"
                @search-protein="handleSearchProtein" />
            </el-card>

            <!-- Help Section -->
            <div class="help-section">
              <el-card class="help-card">
                <template #header>
                  <h3 class="panel-title">
                    <font-awesome-icon :icon="['fas', 'question-circle']" />
                    Parameter Interpretation
                  </h3>
                </template>
                <el-collapse v-model="activeHelp">
                  <el-collapse-item title="Network Statistics" name="stats">
                    <div class="help-content">
                      <ul>
                        <li><strong>Number of nodes:</strong> The total count of proteins (or nodes) present in the
                          interaction
                          network.</li>
                        <li><strong>Number of edges:</strong> The total count of interactions (or edges) between
                          proteins in
                          the
                          network.</li>
                        <li><strong>Average node degree:</strong> The average number of interactions per protein.</li>
                        <li><strong>Local clustering coefficient:</strong> A measure of how interconnected the neighbors
                          of
                          a
                          protein are.</li>
                        <li><strong>PPI enrichment p-value:</strong> Statistical measure indicating if observed
                          interactions
                          are
                          significantly more than expected by chance.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Topological Parameters" name="topology">
                    <div class="help-content">
                      <ul>
                        <li><strong>Degree:</strong> The number of connections a node has to other nodes in the network.
                        </li>
                        <li><strong>Betweenness:</strong> A measure of a node's centrality representing the number of
                          shortest paths
                          passing through the node.</li>
                        <li><strong>Closeness:</strong> A measure of how close a node is to all other nodes in the
                          network.
                        </li>
                      </ul>
                    </div>
                  </el-collapse-item>
                  <el-collapse-item title="Query Parameters" name="query">
                    <div class="help-content">
                      <ul>
                        <li><strong>Species:</strong> Currently supports Human (9606), Mouse (10090), and Rat (10116).
                        </li>
                        <li><strong>Score Threshold:</strong> Confidence score (0-1000) to filter protein-protein
                          interactions.</li>
                        <li><strong>Network Type:</strong> Functional (default) vs Physical interactions.</li>
                        <li><strong>Network Flavor:</strong> Evidence, Confidence, or Actions visualization style.</li>
                      </ul>
                    </div>
                  </el-collapse-item>
                </el-collapse>
              </el-card>
            </div>

            <!-- Analysis Results -->
            <div v-if="networkGenerated" class="analysis-section">
              <el-row :gutter="24">
                <!-- Topological Parameters -->
                <el-col :span="12">
                  <el-card class="analysis-card">
                    <template #header>
                      <h3 class="panel-title">
                        <font-awesome-icon :icon="['fas', 'sitemap']" />
                        Topological Parameters
                      </h3>
                    </template>
                    <el-table :data="topologyData" class="topology-table" max-height="300">
                      <el-table-column prop="protein" label="Protein" width="100" />
                      <el-table-column prop="degree" label="Degree" width="80" sortable />
                      <el-table-column prop="betweenness" label="Betweenness" width="120" sortable />
                      <el-table-column prop="closeness" label="Closeness" width="100" sortable />
                    </el-table>
                  </el-card>
                </el-col>

                <!-- Functional Enrichment -->
                <el-col :span="12">
                  <el-card class="analysis-card">
                    <template #header>
                      <h3 class="panel-title">
                        <font-awesome-icon :icon="['fas', 'dna']" />
                        Functional Enrichment
                      </h3>
                    </template>
                    <el-tabs v-model="enrichmentActiveTab" type="card" class="enrichment-tabs">
                      <el-tab-pane v-for="(items, cat) in groupedEnrichment" :key="cat" :label="cat" :name="cat">
                        <el-table :data="items" class="enrichment-table" max-height="245">
                          <el-table-column prop="term" label="Term" min-width="200">
                            <template #default="{ row }">
                              <span v-html="row.termHtml || row.term"></span>
                            </template>
                          </el-table-column>
                          <el-table-column prop="pvalue" label="P-value" width="100" sortable>
                            <template #default="{ row }">
                              {{ parseFloat(row.pvalue || row.p_value || 0).toExponential(2) }}
                            </template>
                          </el-table-column>
                        </el-table>
                      </el-tab-pane>
                    </el-tabs>
                  </el-card>
                </el-col>
              </el-row>

              <!-- Download Section -->
              <div class="download-section">
                <el-card class="download-card">
                  <template #header>
                    <h3 class="panel-title">
                      <font-awesome-icon :icon="['fas', 'download']" />
                      Download Analysis Results
                    </h3>
                  </template>
                  <div class="download-content">
                    <el-row :gutter="24" align="middle">
                      <el-col :span="16">
                        <p>Download comprehensive analysis results including network data, statistics, and
                          visualizations.</p>
                      </el-col>
                      <el-col :span="8">
                        <el-button type="primary" @click="downloadResults" :loading="downloading" block class="download-btn">
                          <font-awesome-icon :icon="['fas', 'file-archive']" />
                          Download All Results
                        </el-button>
                      </el-col>
                    </el-row>
                  </div>
                </el-card>
              </div>
            </div>

          </el-col>
        </el-row>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import NetworkVisualization from '@/components/NetworkVisualization.vue'
import stringApi from '@/services/stringApi'
import { NetworkAnalyzer, EnrichmentProcessor } from '@/utils/networkAnalysis'
import api from '@/utils/api'

// Reactive data
const loading = ref(false)
const downloading = ref(false)
const loadingProteins = ref(false)
const networkGenerated = ref(false)

const inputMethod = ref('manual')
const proteinInput = ref('')
const selectedProteins = ref([])
const availableProteins = ref([])

const networkParams = ref({
  species: '9606',
  requiredScore: 400,
  networkType: 'functional',
  networkFlavor: 'confidence',
  hideDisconnected: false
})

const networkData = ref([])
const networkStats = ref(null)
const topologyData = ref([])
const enrichmentData = ref([])
const enrichmentActiveTab = ref('')
const groupedEnrichment = computed(() => {
  const processor = new EnrichmentProcessor()
  const grouped = processor.groupByCategory(enrichmentData.value || [])
  const keys = Object.keys(grouped)
  if (!enrichmentActiveTab.value && keys.length) {
    enrichmentActiveTab.value = keys[0]
  }
  return grouped
})
const activeHelp = ref([])

// Example data
const examples = ref([
  { key: 'cancer', label: 'Cancer Biomarkers', proteins: ['TP53', 'BRCA1', 'EGFR', 'MYC', 'RB1'] },
  { key: 'apoptosis', label: 'Apoptosis Pathway', proteins: ['TP53', 'BCL2', 'BAX', 'CASP3', 'CASP9'] },
  { key: 'cell_cycle', label: 'Cell Cycle', proteins: ['CDK1', 'CDK2', 'CCNA2', 'CCNB1', 'RB1'] }
])

// Methods
const handleInputMethodChange = () => {
  clearInput()
}

const handleFileUpload = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target.result
    const proteins = content.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
    proteinInput.value = proteins.join('\n')
  }
  reader.readAsText(file.raw)
}

const loadExample = (example) => {
  proteinInput.value = example.proteins.join('\n')
  inputMethod.value = 'manual'
  ElMessage.success(`Loaded ${example.label} example`)
}

const clearInput = () => {
  proteinInput.value = ''
  selectedProteins.value = []
  networkData.value = []
  networkStats.value = null
  topologyData.value = []
  enrichmentData.value = []
  networkGenerated.value = false
}

const getProteinList = () => {
  let proteins = []

  if (inputMethod.value === 'manual') {
    proteins = proteinInput.value.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
  } else if (inputMethod.value === 'database') {
    proteins = selectedProteins.value
  }

  return proteins
}

const generateNetwork = async () => {
  const proteins = getProteinList()

  if (proteins.length === 0) {
    ElMessage.warning('Please enter at least one protein name')
    return
  }

  loading.value = true

  try {
    // Initialize STRING API
    await stringApi.getStringVersion()

    // Get network data from STRING API
    const rawNetworkData = await stringApi.getProteinNetwork(
      proteins,
      networkParams.value.species,
      networkParams.value.requiredScore,
      networkParams.value.networkType
    )

    if (!rawNetworkData || rawNetworkData.length === 0) {
      ElMessage.warning('No interactions found for the given proteins')
      return
    }

    networkData.value = rawNetworkData

    // Get network statistics
    const statsData = await stringApi.getNetworkStats(proteins, networkParams.value.species)
    if (statsData && statsData.length > 0) {
      const statsObj = {}
      statsData.forEach(item => {
        Object.keys(item).forEach(key => {
          if (key !== 'term' && key !== 'category') {
            statsObj[key] = item[key]
          }
        })
      })
      networkStats.value = statsObj
    }

    // Calculate topology analysis
    const analyzer = new NetworkAnalyzer(rawNetworkData)
    topologyData.value = analyzer.getTopologyAnalysis()

    // Get enrichment analysis
    const enrichmentRawData = await stringApi.getEnrichmentAnalysis(proteins, networkParams.value.species)
    if (enrichmentRawData && enrichmentRawData.length > 0) {
      const processor = new EnrichmentProcessor()
      enrichmentData.value = processor.processEnrichmentData(enrichmentRawData, networkParams.value.species)
    }

    networkGenerated.value = true
    ElMessage.success('Network generated successfully')

  } catch (error) {
    ElMessage.error('Failed to generate network. Please check your input and try again.')
  } finally {
    loading.value = false
  }
}

const handleNodeSelected = (nodeData) => {
  // Handle node selection
}

const handleEdgeSelected = (edgeData) => {
  // Handle edge selection
}

const handleSearchProtein = (proteinName) => {
  // Navigate to biomarker search or detail page
  ElMessage.info(`Searching for protein: ${proteinName}`)
}

const downloadResults = async () => {
  downloading.value = true

  try {
    const proteins = getProteinList()
    const downloadPackage = await stringApi.createDownloadPackage(proteins, {
      species: networkParams.value.species,
      requiredScore: networkParams.value.requiredScore,
      networkType: networkParams.value.networkType
    })

    // Create download links for each file
    const downloads = [
      { name: 'Network Image', url: downloadPackage.urls.networkImage },
      { name: 'Network Data', url: downloadPackage.urls.networkData },
      { name: 'Enrichment Data', url: downloadPackage.urls.enrichmentData }
    ]

    // Download each file
    downloads.forEach(download => {
      const link = document.createElement('a')
      link.href = download.url
      link.download = download.name.toLowerCase().replace(' ', '_') + '.tsv'
      link.click()
    })

    // Also download topology and stats as JSON
    const analysisData = {
      networkStats: networkStats.value,
      topologyData: topologyData.value,
      enrichmentData: enrichmentData.value
    }

    const blob = new Blob([JSON.stringify(analysisData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'analysis_results.json'
    link.click()
    URL.revokeObjectURL(url)

    ElMessage.success('Analysis results downloaded')

  } catch (error) {
    ElMessage.error('Download failed')
  } finally {
    downloading.value = false
  }
}

const formatStatLabel = (key) => {
  const labels = {
    number_of_nodes: 'Nodes',
    number_of_edges: 'Edges',
    average_node_degree: 'Avg Degree',
    local_clustering_coefficient: 'Clustering Coeff',
    expected_number_of_edges: 'Expected Edges',
    ppi_enrichment_p_value: 'P-value'
  }
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

const formatStatValue = (key, value) => {
  if (key.includes('p_value') || key.includes('pvalue')) {
    return parseFloat(value).toExponential(2)
  }
  return typeof value === 'number' ? value.toString() : value
}

const fetchAvailableProteins = async () => {
  loadingProteins.value = true
  try {
    // Helper function to extract data from different response structures
    const extractData = (response) => {
      const dataPaths = ['data', 'results', 'biomarkers']
      for (const path of dataPaths) {
        if (response.data?.[path] && Array.isArray(response.data[path])) {
          return response.data[path]
        }
      }
      return Array.isArray(response.data) ? response.data : null
    }

    // Helper function to get protein name from item
    const getProteinName = (item) =>
      item.biomarker || item.Biomarker || item.name || item.Name ||
      item.gene_symbol || item.protein_name || ''

    // Helper function to get protein description
    const getProteinDescription = (item, fallbackName) => {
      const desc = item.description || item.Description ||
                   item.Function || item.function || item.annotation || fallbackName
      return desc && desc.length > 50 ? desc.substring(0, 50) + '...' : desc || fallbackName
    }

    // Try API calls with fallback
    let response
    try {
      response = await api.get('/biomarkers', { params: { category: 'Protein', limit: 100 } })
    } catch {
      response = await api.get('/biomarkers', { params: { limit: 100 } })
    }

    const biomarkerData = extractData(response)
    if (!biomarkerData?.length) {
      throw new Error('No biomarker data returned from API')
    }

    // Filter and process protein data
    const proteinData = biomarkerData.filter(item => {
      const biomarker = getProteinName(item)
      if (!biomarker || typeof biomarker !== 'string') return false

      return biomarker.match(/^[A-Z][A-Z0-9]*[0-9]*$/) ||
             biomarker.toLowerCase().includes('protein') ||
             biomarker.toLowerCase().includes('gene') ||
             (biomarker.length <= 15 && biomarker.match(/^[A-Z]/))
    })

    if (proteinData.length === 0) {
      throw new Error('No protein data found after filtering')
    }

    availableProteins.value = proteinData.slice(0, 50).map(protein => {
      const name = getProteinName(protein)
      return {
        label: `${name}: ${getProteinDescription(protein, name)}`,
        value: name
      }
    })

  } catch (error) {
    // Fallback to default protein list
    availableProteins.value = [
      { label: 'TP53: Tumor protein p53', value: 'TP53' },
      { label: 'BRCA1: Breast cancer 1, early onset', value: 'BRCA1' },
      { label: 'BRCA2: Breast cancer 2, early onset', value: 'BRCA2' },
      { label: 'EGFR: Epidermal growth factor receptor', value: 'EGFR' },
      { label: 'MYC: MYC proto-oncogene', value: 'MYC' },
      { label: 'RB1: Retinoblastoma 1', value: 'RB1' },
      { label: 'APC: Adenomatous polyposis coli', value: 'APC' },
      { label: 'PTEN: Phosphatase and tensin homolog', value: 'PTEN' },
      { label: 'ATM: ATM serine/threonine kinase', value: 'ATM' },
      { label: 'CHEK2: Checkpoint kinase 2', value: 'CHEK2' }
    ]
    ElMessage.info('Using default protein list (database connection issue)')
  } finally {
    loadingProteins.value = false
  }
}

onMounted(() => {
  fetchAvailableProteins()
})
</script>

<style scoped>
.explore {
  min-height: 100vh;
  background: #f8f9fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  padding: 40px 0;
}

.main-container {
  min-height: 600px;
  background: transparent;
}

.control-aside {
  background: transparent;
  padding-right: 20px;
  overflow: visible;
}

.main-area {
  padding: 0;
  background: transparent;
  overflow: visible;
}

/* Control Panel Styles */
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.control-card,
.stats-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 10px;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.help-icon {
  color: #999;
  cursor: help;
  font-size: 0.8rem;
}

.protein-textarea {
  font-family: 'Consolas', 'Monaco', monospace;
}

.protein-select {
  width: 100%;
}

.input-hint {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

.upload-demo {
  width: 100%;
}

.upload-icon {
  font-size: 2rem;
  color: #667eea;
  margin-bottom: 10px;
}

.parameters-section {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.param-select {
  width: 100%;
}

.score-slider {
  margin: 10px 0;
}

.network-type-group {
  display: flex;
  gap: 8px;
}

.action-buttons {
  display: flex;
}

.generate-btn {
  flex: 1;
  background: var(--accent-gradient);
  border: none;
  color: white;
}

.clear-btn {
  background: #f5f5f5;
  border: 1px solid #ddd;
}

.example-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.example-buttons {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.example-btn {
  width: 100%;
  text-align: left;
  background: #f8fbff;
  border: 1px solid #e3f2fd;
  color: #1e3c72;
  margin-left: 0;
}

.example-btn:hover {
  background: #e3f2fd;
}

/* Statistics Card */
.stats-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 0.9rem;
}

.stat-value {
  font-weight: 600;
  color: #667eea;
  font-size: 0.9rem;
}

/* Visualization Panel */
.visualization-panel {
  min-height: 600px;
}

.network-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

/* Analysis Section */
.analysis-section {
  margin-top: 40px;
}

.analysis-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  overflow: hidden;
}

.topology-table,
.enrichment-table {
  border-radius: 8px;
}

/* Download Section */
.download-section {
  margin-top: 30px;
}

.download-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.download-content {
  text-align: center;
  padding: 20px 0;
}

.download-content p {
  margin-bottom: 20px;
  color: #666;
}

.enrichment-tabs :deep(.el-tabs__nav-wrap) {
  overflow: hidden;
}

/* Help Section */
.help-section {
  margin-top: 30px;
}

.help-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.help-content ul {
  margin: 0;
  padding-left: 20px;
}

.help-content li {
  margin-bottom: 8px;
  line-height: 1.5;
}

.download-btn {
  background: var(--accent-gradient);
  border: none;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .control-aside {
    width: 320px !important;
    padding-right: 15px;
  }
}

@media (max-width: 768px) {
  .main-container {
    flex-direction: column;
  }

  .control-aside {
    width: 100% !important;
    padding-right: 0;
    padding-bottom: 20px;
    order: 2;
  }

  .main-area {
    order: 1;
    padding: 0;
  }

  .network-card {
    margin-bottom: 20px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 0 15px;
  }

  .main-content {
    padding: 20px 0;
  }

  .action-buttons .el-row {
    flex-direction: column;
  }

  .action-buttons .el-col {
    width: 100% !important;
    margin-bottom: 10px;
  }
}
</style>