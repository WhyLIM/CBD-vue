<template>
  <div class="explore">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">Network Exploration</h1>
            <p class="hero-subtitle">Visualize and analyze protein-protein interaction networks using STRING database
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="main-content">
      <div class="container">
        <div class="content-grid">
          <!-- Control Panel -->
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
                      <el-select v-model="selectedProteins" multiple filterable placeholder="Search and select proteins"
                        class="protein-select" :loading="loadingProteins">
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

                <div class="form-group">
                  <label class="form-label">Network Type</label>
                  <el-radio-group v-model="networkParams.networkType" class="network-type-group">
                    <el-radio label="functional">Functional</el-radio>
                    <el-radio label="physical">Physical</el-radio>
                  </el-radio-group>
                </div>

                <div class="form-group">
                  <label class="form-label">Network Flavor</label>
                  <el-select v-model="networkParams.networkFlavor" class="param-select">
                    <el-option label="Confidence" value="confidence" />
                    <el-option label="Evidence" value="evidence" />
                    <el-option label="Actions" value="actions" />
                  </el-select>
                </div>

                <div class="form-group">
                  <el-checkbox v-model="networkParams.hideDisconnected">
                    Hide disconnected nodes
                  </el-checkbox>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <el-button type="primary" @click="generateNetwork" :loading="loading" class="generate-btn">
                  <font-awesome-icon :icon="['fas', 'play']" />&nbsp;Generate Network
                </el-button>
                <el-button @click="clearInput" class="clear-btn">
                  <font-awesome-icon :icon="['fas', 'trash']" />&nbsp;Clear
                </el-button>
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
                <div class="stat-item" v-for="(value, key) in networkStats" :key="key">
                  <span class="stat-label">{{ formatStatLabel(key) }}:</span>
                  <span class="stat-value">{{ formatStatValue(key, value) }}</span>
                </div>
              </div>
            </el-card>
          </div>

          <!-- Network Visualization -->
          <div class="visualization-panel">
            <el-card class="network-card">
              <template #header>
                <div class="network-header">
                  <h3 class="panel-title">
                    <font-awesome-icon :icon="['fas', 'project-diagram']" />
                    Protein Interaction Network
                  </h3>
                  <div class="network-controls" v-if="networkGenerated">
                    <el-button-group size="small">
                      <el-button @click="fitNetwork">
                        <font-awesome-icon :icon="['fas', 'expand']" />
                        Fit
                      </el-button>
                      <el-button @click="resetZoom">
                        <font-awesome-icon :icon="['fas', 'search-minus']" />
                        Reset
                      </el-button>
                      <el-button @click="exportNetwork">
                        <font-awesome-icon :icon="['fas', 'download']" />
                        Export
                      </el-button>
                    </el-button-group>
                  </div>
                </div>
              </template>

              <!-- Network Container -->
              <div class="network-container">
                <div v-if="!networkGenerated" class="network-placeholder">
                  <div class="placeholder-content">
                    <font-awesome-icon :icon="['fas', 'project-diagram']" class="placeholder-icon" />
                    <h3>Network Visualization</h3>
                    <p>Enter protein names and click "Generate Network" to visualize protein-protein interactions</p>
                    <div class="placeholder-features">
                      <div class="feature-item">
                        <font-awesome-icon :icon="['fas', 'search']" />
                        <span>Interactive exploration</span>
                      </div>
                      <div class="feature-item">
                        <font-awesome-icon :icon="['fas', 'mouse-pointer']" />
                        <span>Click nodes for details</span>
                      </div>
                      <div class="feature-item">
                        <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" />
                        <span>Zoom and pan</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else ref="cytoscapeContainer" class="cytoscape-container" v-loading="loading" />
              </div>
            </el-card>
          </div>
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
                <el-table :data="enrichmentData" class="enrichment-table" max-height="300">
                  <el-table-column prop="category" label="Category" width="120" />
                  <el-table-column prop="term" label="Term" min-width="200" />
                  <el-table-column prop="pvalue" label="P-value" width="100" sortable />
                </el-table>
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
                <p>Download comprehensive analysis results including network data, statistics, and visualizations.</p>
                <el-button type="primary" @click="downloadResults" :loading="downloading">
                  <font-awesome-icon :icon="['fas', 'file-archive']" />
                  Download All Results
                </el-button>
              </div>
            </el-card>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import cytoscape from 'cytoscape'
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

const networkStats = ref(null)
const topologyData = ref([])
const enrichmentData = ref([])

// Cytoscape instance
const cytoscapeContainer = ref(null)
let cy = null

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
  networkStats.value = null
  topologyData.value = []
  enrichmentData.value = []
  networkGenerated.value = false
  if (cy) {
    cy.destroy()
    cy = null
  }
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
    // Simulate API call to STRING database
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Generate mock network data
    const networkData = generateMockNetworkData(proteins)

    // Initialize Cytoscape
    await initializeCytoscape(networkData)

    // Generate mock statistics
    generateMockStatistics(proteins)

    networkGenerated.value = true
    ElMessage.success('Network generated successfully')

  } catch (error) {
    console.error('Error generating network:', error)
    ElMessage.error('Failed to generate network')
  } finally {
    loading.value = false
  }
}

const generateMockNetworkData = (proteins) => {
  const nodes = proteins.map((protein, index) => ({
    data: {
      id: protein,
      label: protein,
      type: 'protein',
      score: Math.random() * 1000
    }
  }))

  const edges = []
  for (let i = 0; i < proteins.length; i++) {
    for (let j = i + 1; j < proteins.length; j++) {
      if (Math.random() > 0.3) { // 70% chance of connection
        edges.push({
          data: {
            id: `${proteins[i]}-${proteins[j]}`,
            source: proteins[i],
            target: proteins[j],
            confidence: Math.random() * 1000,
            type: 'interaction'
          }
        })
      }
    }
  }

  return { nodes, edges }
}

const initializeCytoscape = async (networkData) => {
  await nextTick()

  if (!cytoscapeContainer.value) return

  // Destroy existing instance
  if (cy) {
    cy.destroy()
  }

  // Create new Cytoscape instance
  cy = cytoscape({
    container: cytoscapeContainer.value,
    elements: [...networkData.nodes, ...networkData.edges],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#667eea',
          'label': 'data(label)',
          'color': '#fff',
          'text-valign': 'center',
          'text-halign': 'center',
          'font-size': '12px',
          'font-weight': 'bold',
          'width': 'mapData(score, 0, 1000, 20, 60)',
          'height': 'mapData(score, 0, 1000, 20, 60)',
          'border-width': 2,
          'border-color': '#2a5298',
          'text-outline-width': 2,
          'text-outline-color': '#667eea'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'background-color': '#ff6b6b',
          'border-color': '#ff5252'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': 'mapData(confidence, 0, 1000, 1, 8)',
          'line-color': '#ccc',
          'target-arrow-color': '#ccc',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'opacity': 0.7
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': '#667eea',
          'target-arrow-color': '#667eea',
          'opacity': 1
        }
      }
    ],
    layout: {
      name: 'cose',
      animate: true,
      animationDuration: 1000,
      nodeRepulsion: 400000,
      nodeOverlap: 10,
      idealEdgeLength: 100,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    }
  })

  // Add event listeners
  cy.on('tap', 'node', (evt) => {
    const node = evt.target
    const nodeData = node.data()

    ElMessageBox.alert(
      `Protein: ${nodeData.label}\nScore: ${nodeData.score.toFixed(2)}\nDegree: ${node.degree()}`,
      'Node Information',
      { confirmButtonText: 'OK' }
    )
  })

  cy.on('tap', 'edge', (evt) => {
    const edge = evt.target
    const edgeData = edge.data()

    ElMessageBox.alert(
      `Interaction: ${edgeData.source} - ${edgeData.target}\nConfidence: ${edgeData.confidence.toFixed(2)}`,
      'Edge Information',
      { confirmButtonText: 'OK' }
    )
  })
}

const generateMockStatistics = (proteins) => {
  // Network statistics
  networkStats.value = {
    number_of_nodes: proteins.length,
    number_of_edges: Math.floor(proteins.length * 1.5),
    average_node_degree: (proteins.length * 3 / proteins.length).toFixed(2),
    local_clustering_coefficient: (Math.random() * 0.5 + 0.3).toFixed(3),
    expected_number_of_edges: Math.floor(proteins.length * 1.2),
    ppi_enrichment_p_value: (Math.random() * 0.01).toExponential(2)
  }

  // Topology data
  topologyData.value = proteins.map(protein => ({
    protein,
    degree: Math.floor(Math.random() * 10) + 1,
    betweenness: (Math.random() * 100).toFixed(3),
    closeness: (Math.random() * 0.5 + 0.3).toFixed(3)
  }))

  // Enrichment data
  const categories = ['GO:Process', 'GO:Function', 'GO:Component', 'KEGG', 'Reactome']
  const terms = [
    'Cell cycle regulation', 'Apoptotic process', 'DNA repair',
    'Protein binding', 'Kinase activity', 'Transcription factor',
    'Nucleus', 'Cytoplasm', 'Membrane',
    'Cancer pathways', 'Cell cycle', 'Apoptosis',
    'DNA damage response', 'Cell division'
  ]

  enrichmentData.value = Array.from({ length: 10 }, (_, i) => ({
    category: categories[Math.floor(Math.random() * categories.length)],
    term: terms[Math.floor(Math.random() * terms.length)],
    pvalue: (Math.random() * 0.05).toExponential(2)
  }))
}

const fitNetwork = () => {
  if (cy) {
    cy.fit()
  }
}

const resetZoom = () => {
  if (cy) {
    cy.zoom(1)
    cy.center()
  }
}

const exportNetwork = () => {
  if (cy) {
    const png = cy.png({ scale: 2, full: true })
    const link = document.createElement('a')
    link.download = 'protein_network.png'
    link.href = png
    link.click()
    ElMessage.success('Network image exported')
  }
}

const downloadResults = async () => {
  downloading.value = true
  try {
    // Simulate download preparation
    await new Promise(resolve => setTimeout(resolve, 2000))
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
  return labels[key] || key
}

const formatStatValue = (key, value) => {
  if (key === 'ppi_enrichment_p_value') {
    return value
  }
  return typeof value === 'number' ? value.toString() : value
}

const fetchAvailableProteins = async () => {
  loadingProteins.value = true
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 500))
    availableProteins.value = [
      { label: 'TP53: Tumor protein p53', value: 'TP53' },
      { label: 'BRCA1: Breast cancer 1', value: 'BRCA1' },
      { label: 'EGFR: Epidermal growth factor receptor', value: 'EGFR' },
      { label: 'MYC: MYC proto-oncogene', value: 'MYC' },
      { label: 'RB1: Retinoblastoma 1', value: 'RB1' }
    ]
  } catch (error) {
    console.error('Failed to fetch proteins:', error)
  } finally {
    loadingProteins.value = false
  }
}

onMounted(() => {
  fetchAvailableProteins()
})

onUnmounted(() => {
  if (cy) {
    cy.destroy()
  }
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

.content-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 30px;
  align-items: start;
}

/* Control Panel Styles */
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
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
  margin-bottom: 20px;
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
  gap: 10px;
  margin-top: 25px;
}

.generate-btn {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  height: 100%;
}

.network-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.network-controls {
  display: flex;
  gap: 10px;
}

.network-container {
  height: 500px;
  position: relative;
}

.network-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fbff;
  border-radius: 8px;
  border: 2px dashed #e3f2fd;
}

.placeholder-content {
  text-align: center;
  color: #666;
}

.placeholder-icon {
  font-size: 4rem;
  color: #667eea;
  margin-bottom: 20px;
}

.placeholder-content h3 {
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 10px;
}

.placeholder-content p {
  font-size: 1rem;
  margin-bottom: 30px;
  max-width: 400px;
}

.placeholder-features {
  display: flex;
  justify-content: center;
  gap: 30px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #5a6c7d;
}

.feature-item svg {
  font-size: 1.5rem;
  color: #667eea;
}

.cytoscape-container {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  background: white;
}

/* Analysis Section */
.analysis-section {
  margin-top: 40px;
}

.analysis-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.topology-table,
.enrichment-table {
  border-radius: 8px;
}

.topology-table :deep(.el-table__row:hover),
.enrichment-table :deep(.el-table__row:hover) {
  background-color: #f8f9ff;
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
  color: #666;
  margin-bottom: 20px;
  line-height: 1.6;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .content-grid {
    grid-template-columns: 320px 1fr;
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .control-panel {
    order: 2;
  }

  .visualization-panel {
    order: 1;
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  .main-content {
    padding: 20px 0;
  }

  .network-container {
    height: 400px;
  }

  .placeholder-features {
    flex-direction: column;
    gap: 15px;
  }

  .feature-item {
    flex-direction: row;
    justify-content: center;
  }

  .action-buttons {
    flex-direction: column;
  }

  .generate-btn,
  .clear-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .network-container {
    height: 300px;
  }

  .placeholder-content h3 {
    font-size: 1.2rem;
  }

  .placeholder-content p {
    font-size: 0.9rem;
  }

  .analysis-section {
    margin-top: 20px;
  }
}

/* Element Plus 组件样式覆盖 */
.el-tabs__nav-wrap::after {
  display: none;
}

.el-tabs__active-bar {
  background-color: #667eea;
}

.el-tabs__item.is-active {
  color: #667eea;
}

.el-tabs__item:hover {
  color: #667eea;
}

.el-slider__runway {
  background-color: #e3f2fd;
}

.el-slider__bar {
  background-color: #667eea;
}

.el-slider__button {
  border-color: #667eea;
}

.el-radio__input.is-checked .el-radio__inner {
  background-color: #667eea;
  border-color: #667eea;
}

.el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #667eea;
  border-color: #667eea;
}

.el-upload-dragger:hover {
  border-color: #667eea;
}

.el-upload-dragger.is-dragover {
  background-color: rgba(102, 126, 234, 0.1);
  border-color: #667eea;
}

/* 加载状态样式 */
.el-loading-mask {
  background-color: rgba(255, 255, 255, 0.8);
}

.el-loading-spinner .circular {
  stroke: #667eea;
}

/* 表格样式增强 */
.topology-table :deep(.el-table__header),
.enrichment-table :deep(.el-table__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.topology-table :deep(.el-table__header th),
.enrichment-table :deep(.el-table__header th) {
  color: white;
  font-weight: 600;
}

/* 按钮组样式 */
.el-button-group .el-button {
  border-color: #e3f2fd;
}

.el-button-group .el-button:hover {
  background-color: #e3f2fd;
  border-color: #667eea;
  color: #667eea;
}

.el-button-group .el-button--primary {
  background-color: #667eea;
  border-color: #667eea;
}

.el-button-group .el-button--primary:hover {
  background-color: #5a6fd8;
  border-color: #5a6fd8;
}
</style>
