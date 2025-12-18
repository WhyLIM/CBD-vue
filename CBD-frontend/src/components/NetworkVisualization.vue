<template>
  <div class="network-visualization">
    <div class="network-header">
      <h3 class="network-title">
        <font-awesome-icon :icon="['fas', 'project-diagram']" />
        Protein Interaction Network
      </h3>
      <div class="network-controls" v-if="networkData && networkData.length > 0">
        <el-button-group size="small">
          <el-button @click="fitNetwork" title="Fit to view">
            <font-awesome-icon :icon="['fas', 'expand']" />
          </el-button>
          <el-button @click="resetZoom" title="Reset zoom">
            <font-awesome-icon :icon="['fas', 'search-minus']" />
          </el-button>
          <el-button @click="exportImage" title="Export image">
            <font-awesome-icon :icon="['fas', 'download']" />
          </el-button>
          <el-button @click="toggleLayout" title="Change layout">
            <font-awesome-icon :icon="['fas', 'random']" />
          </el-button>
        </el-button-group>
      </div>
    </div>

    <div class="network-container">
      <div v-if="!networkData || networkData.length === 0" class="network-placeholder">
        <div class="placeholder-content">
          <font-awesome-icon :icon="['fas', 'project-diagram']" class="placeholder-icon" />
          <h3>Network Visualization</h3>
          <p>Enter protein names and generate network to visualize protein-protein interactions</p>
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

    <!-- Node/Edge Info Dialog -->
    <el-dialog v-model="showInfoDialog" :title="infoDialogTitle" width="500px" :before-close="closeInfoDialog">
      <div class="info-content">
        <div v-if="selectedElement.type === 'node'" class="node-info">
          <div class="info-item">
            <label>Protein:</label>
            <span class="protein-name">{{ selectedElement.data.label }}</span>
          </div>
          <div class="info-item">
            <label>Degree:</label>
            <span>{{ selectedElement.data.degree }}</span>
          </div>
          <div class="info-item" v-if="selectedElement.data.betweenness !== undefined">
            <label>Betweenness Centrality:</label>
            <span>{{ selectedElement.data.betweenness.toFixed(6) }}</span>
          </div>
          <div class="info-item" v-if="selectedElement.data.closeness !== undefined">
            <label>Closeness Centrality:</label>
            <span>{{ selectedElement.data.closeness.toFixed(6) }}</span>
          </div>
          <div class="info-item" v-if="selectedElement.data.clustering !== undefined">
            <label>Clustering Coefficient:</label>
            <span>{{ selectedElement.data.clustering.toFixed(6) }}</span>
          </div>
        </div>

        <div v-else-if="selectedElement.type === 'edge'" class="edge-info">
          <div class="info-item">
            <label>Interaction:</label>
            <span>{{ selectedElement.data.source }} ↔ {{ selectedElement.data.target }}</span>
          </div>
          <div class="info-item">
            <label>Confidence Score:</label>
            <span>{{ selectedElement.data.score }}</span>
          </div>
          <div class="info-item" v-if="selectedElement.data.evidence">
            <label>Evidence:</label>
            <span>{{ selectedElement.data.evidence }}</span>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeInfoDialog">Close</el-button>
        <el-button type="primary" @click="searchProtein" v-if="selectedElement.type === 'node'">
          Search in CBD
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import cytoscape from 'cytoscape'

const props = defineProps({
  networkData: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  topologyData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['node-selected', 'edge-selected', 'search-protein'])

// Refs
const cytoscapeContainer = ref(null)
const showInfoDialog = ref(false)
const infoDialogTitle = ref('')
const selectedElement = ref({})

// Cytoscape instance
let cy = null
let currentLayout = 'cose'

// Available layouts
const layouts = ['cose', 'circle', 'grid', 'breadthfirst', 'concentric']
let layoutIndex = 0

// Watch for network data changes
watch(() => props.networkData, async (newData) => {
  if (newData && newData.length > 0) {
    await nextTick()
    initializeCytoscape()
  }
}, { immediate: true })

// Watch for topology data changes
watch(() => props.topologyData, (newData) => {
  if (cy && newData && newData.length > 0) {
    updateNodeTopology(newData)
  }
})

const initializeCytoscape = async () => {
  if (!cytoscapeContainer.value || !props.networkData.length) return

  try {
    // Destroy existing instance
    if (cy) {
      cy.removeAllListeners()
      cy.destroy()
      cy = null
    }

    // Process network data
    const { nodes, edges } = processNetworkData(props.networkData)

    // Create Cytoscape instance
    cy = cytoscape({
      container: cytoscapeContainer.value,
      elements: [...nodes, ...edges],
      style: getCytoscapeStyle(),
      layout: getLayoutConfig(currentLayout)
    })

    // Add event listeners
    addEventListeners()

    // Update topology if available
    if (props.topologyData && props.topologyData.length > 0) {
      updateNodeTopology(props.topologyData)
    }
  } catch (error) {
    console.error('Error initializing Cytoscape:', error)
    ElMessage.error('Failed to initialize network visualization')
  }
}

const processNetworkData = (networkData) => {
  const nodeSet = new Set()
  const nodes = []
  const edges = []

  // Process edges and collect unique nodes
  networkData.forEach(interaction => {
    const sourceId = interaction.preferredName_A
    const targetId = interaction.preferredName_B
    const score = parseFloat(interaction.score)

    // Add nodes to set
    nodeSet.add(sourceId)
    nodeSet.add(targetId)

    // Create edge
    edges.push({
      data: {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        score: score,
        confidence: score,
        evidence: interaction.evidence || 'Unknown'
      }
    })
  })

  // Create node objects
  nodeSet.forEach(nodeId => {
    nodes.push({
      data: {
        id: nodeId,
        label: nodeId,
        type: 'protein',
        degree: 0 // Will be calculated by Cytoscape
      }
    })
  })

  return { nodes, edges }
}

const getCytoscapeStyle = () => [
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
      'width': 'mapData(degree, 1, 20, 30, 80)',
      'height': 'mapData(degree, 1, 20, 30, 80)',
      'border-width': 2,
      'border-color': '#2a5298',
      'text-outline-width': 2,
      'text-outline-color': '#667eea',
      'overlay-padding': '6px',
      'z-index': 10
    }
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': '#ff6b6b',
      'border-color': '#ff5252',
      'border-width': 3
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
  },

]

const getLayoutConfig = (layoutName) => {
  const configs = {
    cose: {
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
    },
    circle: {
      name: 'circle',
      animate: true,
      animationDuration: 1000,
      radius: 200
    },
    grid: {
      name: 'grid',
      animate: true,
      animationDuration: 1000,
      rows: undefined,
      cols: undefined
    },
    breadthfirst: {
      name: 'breadthfirst',
      animate: true,
      animationDuration: 1000,
      directed: false,
      spacingFactor: 1.75
    },
    concentric: {
      name: 'concentric',
      animate: true,
      animationDuration: 1000,
      concentric: (node) => node.degree(),
      levelWidth: () => 1
    }
  }

  return configs[layoutName] || configs.cose
}

const addEventListeners = () => {
  if (!cy) return

  // Helper function to safely handle events
  const safeEventHandler = (handler) => {
    return (...args) => {
      try {
        return handler(...args)
      } catch (error) {
        console.warn('Event handler error:', error)
      }
    }
  }

  // Node click event
  cy.on('tap', 'node', safeEventHandler((evt) => {
    const node = evt.target
    const nodeData = node.data()

    selectedElement.value = {
      type: 'node',
      data: {
        ...nodeData,
        degree: node.degree(),
        betweenness: nodeData.betweenness,
        closeness: nodeData.closeness,
        clustering: nodeData.clustering
      }
    }

    infoDialogTitle.value = `Protein: ${nodeData.label}`
    showInfoDialog.value = true

    emit('node-selected', nodeData)
  }))

  // Edge click event
  cy.on('tap', 'edge', safeEventHandler((evt) => {
    const edge = evt.target
    const edgeData = edge.data()

    selectedElement.value = {
      type: 'edge',
      data: edgeData
    }

    infoDialogTitle.value = `Interaction: ${edgeData.source} - ${edgeData.target}`
    showInfoDialog.value = true

    emit('edge-selected', edgeData)
  }))

  // Background click to deselect
  cy.on('tap', safeEventHandler((evt) => {
    if (evt.target === cy) {
      cy.$(':selected').unselect()
    }
  }))

  // Node hover events
  cy.on('mouseover', 'node', safeEventHandler((evt) => {
    const node = evt.target
    node.style({
      'background-color': '#5a67d8',
      'border-color': '#4c51bf',
      'cursor': 'pointer'
    })
  }))

  cy.on('mouseout', 'node', safeEventHandler((evt) => {
    const node = evt.target
    if (!node.selected()) {
      node.style({
        'background-color': '#667eea',
        'border-color': '#2a5298'
      })
    }
  }))

  // Edge hover events
  cy.on('mouseover', 'edge', safeEventHandler((evt) => {
    const edge = evt.target
    edge.style({
      'line-color': '#5a67d8',
      'target-arrow-color': '#5a67d8',
      'cursor': 'pointer'
    })
  }))

  cy.on('mouseout', 'edge', safeEventHandler((evt) => {
    const edge = evt.target
    if (!edge.selected()) {
      edge.style({
        'line-color': '#ccc',
        'target-arrow-color': '#ccc'
      })
    }
  }))
}

const updateNodeTopology = (topologyData) => {
  if (!cy) return

  topologyData.forEach(item => {
    const node = cy.getElementById(item.protein)
    if (node.length > 0) {
      node.data({
        ...node.data(),
        betweenness: item.betweenness,
        closeness: item.closeness,
        clustering: item.clustering || 0
      })
    }
  })
}

const fitNetwork = () => {
  if (cy) {
    cy.fit()
    ElMessage.success('Network fitted to view')
  }
}

const resetZoom = () => {
  if (cy) {
    cy.zoom(1)
    cy.center()
    ElMessage.success('Zoom reset')
  }
}

const exportImage = () => {
  if (cy) {
    const png = cy.png({
      scale: 2,
      full: true,
      bg: 'white'
    })

    const link = document.createElement('a')
    link.download = 'protein_network.png'
    link.href = png
    link.click()

    ElMessage.success('Network image exported')
  }
}

const toggleLayout = () => {
  if (!cy) return

  layoutIndex = (layoutIndex + 1) % layouts.length
  currentLayout = layouts[layoutIndex]

  const layout = cy.layout(getLayoutConfig(currentLayout))
  layout.run()

  ElMessage.success(`Layout changed to: ${currentLayout}`)
}

const closeInfoDialog = () => {
  showInfoDialog.value = false
  selectedElement.value = {}
}

const searchProtein = () => {
  if (selectedElement.value.type === 'node') {
    const proteinName = selectedElement.value.data.label
    emit('search-protein', proteinName)
    closeInfoDialog()
  }
}

onMounted(() => {
  // Component mounted
})

onUnmounted(() => {
  try {
    if (cy) {
      cy.removeAllListeners()
      cy.destroy()
      cy = null
    }
  } catch (error) {
    console.warn('Error during cleanup:', error)
  }
})
</script>

<style scoped>
.network-visualization {
  width: 100%;
  height: 100%;
}

.network-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  border-radius: 8px 8px 0 0;
}

.network-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.network-controls {
  display: flex;
  gap: 10px;
}

.network-container {
  height: 500px;
  position: relative;
  background: white;
  border-radius: 0 0 8px 8px;
}

.network-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fbff;
  border-radius: 0 0 8px 8px;
  border: 2px dashed #e3f2fd;
}

.placeholder-content {
  text-align: center;
  color: #666;
  max-width: 400px;
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
  line-height: 1.5;
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
  color: #5a67d8;
}

.feature-item svg {
  font-size: 1.5rem;
  color: #667eea;
}

.cytoscape-container {
  width: 100%;
  height: 100%;
  border-radius: 0 0 8px 8px;
}

/* Dialog Styles */
.info-content {
  padding: 10px 0;
}

.node-info,
.edge-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.info-item label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
}

.info-item span {
  color: #667eea;
  font-weight: 500;
}

.protein-name {
  font-family: 'Consolas', 'Monaco', monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold !important;
}

/* Responsive Design */
@media (max-width: 768px) {
  .network-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }

  .placeholder-features {
    flex-direction: column;
    gap: 15px;
  }

  .feature-item {
    flex-direction: row;
    justify-content: center;
  }
}
</style>
