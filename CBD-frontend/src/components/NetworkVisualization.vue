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
          <el-button @click="toggleLayout" title="Change layout">
            <font-awesome-icon :icon="['fas', 'random']" />
          </el-button>
        </el-button-group>
        <el-button-group size="small">
          <el-button @click="exportPng" title="Export PNG image">
            <font-awesome-icon :icon="['fas', 'file-image']" />&nbsp;PNG
          </el-button>
          <el-button @click="exportSvg" title="Export SVG vector image">
            <font-awesome-icon :icon="['fas', 'bezier-curve']" />&nbsp;SVG
          </el-button>
          <el-button @click="exportGraphml" title="Export GraphML (importable into Cytoscape desktop)">
            <font-awesome-icon :icon="['fas', 'file-export']" />&nbsp;GraphML
          </el-button>
        </el-button-group>
        <el-button v-if="pathActive" size="small" @click="clearHighlight" title="Clear path highlight">
          <font-awesome-icon :icon="['fas', 'eraser']" />&nbsp;Clear path
        </el-button>
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

      <!-- Evidence channel legend -->
      <div v-if="edgeColorMode === 'evidence' && networkData && networkData.length > 0" class="evidence-legend">
        <div v-for="ch in EVIDENCE_CHANNELS" :key="ch.key" class="legend-item">
          <span class="legend-swatch" :style="{ background: ch.color }"></span>
          <span class="legend-label">{{ ch.label }}</span>
        </div>
        <div class="legend-item">
          <span class="legend-swatch" :style="{ background: edgeBaseColor }"></span>
          <span class="legend-label">No channel data</span>
        </div>
      </div>
    </div>

    <!-- Node/Edge Info Dialog -->
    <el-dialog v-model="showInfoDialog" :title="infoDialogTitle" width="560px" :before-close="closeInfoDialog">
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
          <div class="info-item" v-if="selectedElement.data.moduleIndex !== undefined">
            <label>Module:</label>
            <span>Module {{ selectedElement.data.moduleIndex + 1 }}</span>
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

          <!-- Functional annotations (lazy loaded) -->
          <div class="annotation-section">
            <div class="section-header">
              <label>Functional Annotations</label>
              <el-button size="small" text type="primary" :loading="annotationsLoading"
                @click="loadAnnotations(selectedElement.data.label)" v-if="!annotationsLoaded">
                Load
              </el-button>
            </div>
            <div v-if="annotationsLoading" class="annotation-status">Loading annotations…</div>
            <div v-else-if="annotationGroups.length === 0 && annotationsLoaded" class="annotation-status">
              No annotations available.
            </div>
            <el-collapse v-if="annotationGroups.length > 0" class="annotation-collapse">
              <el-collapse-item v-for="group in annotationGroups" :key="group.category"
                :title="`${group.category} (${group.count})`" :name="group.category">
                <ul class="annotation-list">
                  <li v-for="(item, idx) in group.items" :key="idx">{{ item }}</li>
                </ul>
              </el-collapse-item>
            </el-collapse>
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
          <div class="info-item" v-if="selectedElement.data.channelLabel">
            <label>Dominant Evidence:</label>
            <span>
              <span class="channel-swatch" :style="{ background: selectedElement.data.channelColor }"></span>
              {{ selectedElement.data.channelLabel }}
            </span>
          </div>

          <!-- Supporting publications (lazy loaded) -->
          <div class="annotation-section">
            <div class="section-header">
              <label>Supporting Publications</label>
              <el-button size="small" text type="primary" :loading="publicationsLoading"
                @click="loadPublications" v-if="publications.length === 0 && !publicationsLoaded">
                Load
              </el-button>
            </div>
            <div v-if="publicationsLoading" class="annotation-status">Searching Europe PMC…</div>
            <div v-else-if="publicationsLoaded && publications.length === 0" class="annotation-status">
              No co-occurrence publications found in title/abstract.
            </div>
            <ul v-else class="publication-list">
              <li v-for="pub in publications" :key="pub.pmid">
                <a :href="`https://pubmed.ncbi.nlm.nih.gov/${pub.pmid}/`" target="_blank" rel="noopener">
                  {{ pub.title || 'Untitled' }}
                </a>
                <span class="pub-meta">{{ pub.journal }} {{ pub.year }} · PMID: {{ pub.pmid }}</span>
              </li>
            </ul>
            <div v-if="publicationsHitCount > publications.length" class="annotation-status">
              Showing {{ publications.length }} of {{ publicationsHitCount }} hits.
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <el-button @click="closeInfoDialog">Close</el-button>
        <el-button type="primary" @click="searchProtein" v-if="selectedElement.type === 'node'">
          View in CBD
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted, nextTick, watch } from 'vue'
import { ElMessage } from 'element-plus'
import cytoscape from 'cytoscape'
import coseBilkent from 'cytoscape-cose-bilkent'
import cytoscapeSvg from 'cytoscape-svg'
import stringApi from '@/services/stringApi'
import {
  EVIDENCE_CHANNELS, dominantChannel, scoreToColorWith, valueToNodeColor,
  MEMBERSHIP_COLORS, xmlEscape, NODE_LABEL_COLOR, resolvePalette, DEFAULT_PALETTE_KEY,
  moduleColorAt
} from '@/utils/networkColors'

cytoscape.use(coseBilkent)
cytoscape.use(cytoscapeSvg)

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
  },
  // 'confidence' | 'evidence'
  edgeColorMode: {
    type: String,
    default: 'confidence'
  },
  // null | 'degree' | 'betweenness' | 'closeness' | 'clustering'
  metricMode: {
    type: String,
    default: null
  },
  // 过滤低于该置信度的边（0 表示不过滤）
  scoreThreshold: {
    type: Number,
    default: 0
  },
  hideDisconnected: {
    type: Boolean,
    default: false
  },
  // { gene: moduleIndex }，非空时按模块着色（优先级高于 metricMode）
  moduleAssignments: {
    type: Object,
    default: null
  },
  // { gene: 'A' | 'B' | 'both' }，对比模式着色（最高优先级）
  membership: {
    type: Object,
    default: null
  },
  // 生效调色板（resolvePalette 的返回值）；为空时用默认预设
  palette: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['node-selected', 'edge-selected', 'search-protein'])

// 生效调色板（父组件可传自定义；未传时用默认预设）
const activePalette = computed(() => props.palette || resolvePalette(DEFAULT_PALETTE_KEY))
// 置信度渐变的最低档颜色（图例“无通道数据”色块与边回退色）
const edgeBaseColor = computed(() => {
  const c = activePalette.value.edge[0][1]
  return `rgb(${c[0]},${c[1]},${c[2]})`
})

// Refs
const cytoscapeContainer = ref(null)
const showInfoDialog = ref(false)
const infoDialogTitle = ref('')
const selectedElement = ref({})
const pathActive = ref(false)
// 当前隔离中的模块 id（null 表示未隔离）
const isolatedModule = ref(null)

// 注释与文献的懒加载状态
const annotationsLoading = ref(false)
const annotationsLoaded = ref(false)
const annotationGroups = ref([])
const annotationsCache = new Map()
const publicationsLoading = ref(false)
const publicationsLoaded = ref(false)
const publications = ref([])
const publicationsHitCount = ref(0)

// Cytoscape instance
let cy = null
let currentLayout = 'cose'

// Available layouts
const layouts = ['cose', 'cose-bilkent', 'circle', 'grid', 'breadthfirst', 'concentric']
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
    applyVisualStyle()
  }
})

// 视觉模式相关 props 变化时重新应用配色
watch(() => [props.edgeColorMode, props.metricMode, props.moduleAssignments, props.membership], () => {
  applyVisualStyle()
})

// 过滤相关 props 变化时重新计算可见性
watch(() => [props.scoreThreshold, props.hideDisconnected], () => {
  refreshVisibility()
})

// 调色板变化 → 替换样式表并按新配色重算节点/边颜色
watch(() => props.palette, () => {
  if (!cy) return
  cy.style(getCytoscapeStyle(activePalette.value))
  applyVisualStyle()
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
      style: getCytoscapeStyle(activePalette.value),
      layout: getLayoutConfig(currentLayout)
    })

    // 计算每个节点的度
    cy.batch(() => {
      cy.nodes().forEach(node => node.data('degree', node.degree(true)))
    })

    // Add event listeners
    addEventListeners()

    // 新图重建后视图状态全部归零（旧网络的隔离/高亮不再适用）
    isolatedModule.value = null
    pathActive.value = false

    // Update topology if available
    if (props.topologyData && props.topologyData.length > 0) {
      updateNodeTopology(props.topologyData)
    }

    applyVisualStyle()
    refreshVisibility()
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

    // 主导证据通道
    const channel = dominantChannel(interaction)

    // Create edge
    edges.push({
      data: {
        id: `${sourceId}-${targetId}`,
        source: sourceId,
        target: targetId,
        score: Number.isFinite(score) ? score : 0,
        confidence: Number.isFinite(score) ? score : 0,
        channelKey: channel?.key || null,
        channelLabel: channel?.label || null,
        channelColor: channel?.color || null
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
        degree: 1,
        size: 40,
        baseColor: activePalette.value.node
      }
    })
  })

  return { nodes, edges }
}

const getCytoscapeStyle = (p = activePalette.value) => [
  {
    selector: 'node',
    style: {
      'background-color': 'data(baseColor)',
      'label': 'data(label)',
      'color': NODE_LABEL_COLOR,
      'text-valign': 'center',
      'text-halign': 'center',
      'font-size': '12px',
      'font-weight': 'bold',
      'width': 'data(size)',
      'height': 'data(size)',
      'border-width': 2,
      'border-color': 'rgba(255,255,255,0.85)',
      'text-outline-width': 2,
      'text-outline-color': '#FFFFFF',
      'overlay-padding': '6px',
      'z-index': 10
    }
  },
  {
    selector: 'node:selected',
    style: {
      'background-color': p.selected,
      'border-color': p.selectedBorder,
      'border-width': 3
    }
  },
  {
    selector: 'node.path-highlight',
    style: {
      'background-color': p.path,
      'border-color': p.pathBorder,
      'border-width': 3,
      'z-index': 30
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 'mapData(confidence, 0, 1, 1, 8)',
      'line-color': 'data(baseColor)',
      'curve-style': 'bezier',
      'opacity': 0.7
    }
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#7E99AD',
      'opacity': 1
    }
  },
  {
    selector: 'edge.path-highlight',
    style: {
      'line-color': p.path,
      'width': 5,
      'opacity': 1,
      'z-index': 20
    }
  },
  {
    selector: '.dimmed',
    style: {
      'opacity': 0.12
    }
  }
]

/**
 * 按当前视觉模式给节点/边上色：
 * membership（对比模式） > moduleAssignments（模块模式） > metricMode（中心性映射） > 默认
 */
const applyVisualStyle = () => {
  if (!cy) return
  const p = activePalette.value

  cy.batch(() => {
    // --- nodes ---
    const metricValues = collectMetricValues()
    cy.nodes().forEach(node => {
      const label = node.data('label')
      let color = p.node
      let size

      if (props.membership && props.membership[label]) {
        color = MEMBERSHIP_COLORS[props.membership[label]] || color
      } else if (props.moduleAssignments && props.moduleAssignments[label] !== undefined) {
        color = moduleColorAt(p, props.moduleAssignments[label])
      } else if (props.metricMode && metricValues) {
        const t = metricValues.normalized[label]
        if (t !== undefined) {
          color = valueToNodeColor(t)
          size = 30 + t * 50
        }
      }

      if (size === undefined) {
        const degree = node.data('degree') || 1
        const maxDegree = metricValues?.maxDegree || 20
        size = 30 + Math.min(1, Math.log(1 + degree) / Math.log(1 + maxDegree)) * 45
      }

      node.data('baseColor', color)
      node.data('size', size)
    })

    // --- edges ---
    const evidenceMode = props.edgeColorMode === 'evidence'
    cy.edges().forEach(edge => {
      const channelColor = edge.data('channelColor')
      edge.data('baseColor', evidenceMode && channelColor ? channelColor : scoreToColorWith(p.edge, edge.data('score')))
    })
  })
}

// 收集 metricMode 所需的指标 min/max 与归一化值
const collectMetricValues = () => {
  if (!props.metricMode || !props.topologyData?.length) return null
  const values = {}
  let min = Infinity
  let max = -Infinity
  let maxDegree = 1
  props.topologyData.forEach(item => {
    const v = Number(item[props.metricMode])
    if (!Number.isFinite(v)) return
    values[item.protein] = v
    if (v < min) min = v
    if (v > max) max = v
    const d = Number(item.degree) || 0
    if (d > maxDegree) maxDegree = d
  })
  if (max === min) {
    Object.keys(values).forEach(k => { values[k] = 0.5 })
  } else {
    Object.keys(values).forEach(k => { values[k] = (values[k] - min) / (max - min) })
  }
  return { normalized: values, maxDegree }
}

/**
 * 可见性：置信度过滤 + 隐藏孤立节点 + 模块隔离。
 * 路径高亮的淡出通过 .dimmed class 处理，不影响 display。
 */
const refreshVisibility = () => {
  if (!cy) return
  const threshold = props.scoreThreshold || 0

  cy.batch(() => {
    // 边：低于阈值隐藏
    cy.edges().forEach(edge => {
      const below = threshold > 0 && edge.data('score') < threshold
      edge.style('display', below ? 'none' : 'element')
    })

    // 模块隔离：只保留目标模块的节点
    cy.nodes().forEach(node => {
      let visible = true
      if (isolatedModule.value !== null) {
        visible = props.moduleAssignments?.[node.data('label')] === isolatedModule.value
      }
      if (visible && props.hideDisconnected) {
        const visibleEdges = node.connectedEdges().filter(e => e.style('display') !== 'none')
        visible = visibleEdges.length > 0
      }
      node.style('display', visible ? 'element' : 'none')
    })
  })
}

const updateNodeTopology = (topologyData) => {
  if (!cy) return

  cy.batch(() => {
    topologyData.forEach(item => {
      const node = cy.getElementById(item.protein)
      if (node.length > 0) {
        node.data({
          betweenness: item.betweenness,
          closeness: item.closeness,
          clustering: item.clustering || 0
        })
      }
    })
  })
}

const getLayoutConfig = (layoutName) => {
  const configs = {
    'cose-bilkent': {
      name: 'cose-bilkent',
      animate: false, // 初始布局直接呈现结果；位置动画会表现为从画布左上角原点扩散
      animationDuration: 800,
      nodeRepulsion: 6500,
      idealEdgeLength: 90,
      edgeElasticity: 0.45,
      nestingFactor: 0.1,
      gravity: 0.25,
      numIter: 2500,
      tile: true,
      randomize: true
    },
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

  return configs[layoutName] || configs['cose']
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
        clustering: nodeData.clustering,
        moduleIndex: props.moduleAssignments?.[nodeData.label]
      }
    }

    // 重置懒加载状态
    annotationsLoaded.value = annotationsCache.has(nodeData.label)
    annotationGroups.value = annotationsLoaded.value ? annotationsCache.get(nodeData.label) : []
    annotationsLoading.value = false

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

    // 重置懒加载状态
    publications.value = []
    publicationsLoaded.value = false
    publicationsLoading.value = false
    publicationsHitCount.value = 0

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

  // Node hover events（以 data(baseColor) 为基准做加深，兼容模块/对比等配色）
  // cursor 不是 Cytoscape 合法样式属性，需设置在画布容器 DOM 上
  cy.on('mouseover', 'node', safeEventHandler((evt) => {
    const node = evt.target
    cy.container().style.cursor = 'pointer'
    // 最短路径高亮的节点保持路径配色
    if (!node.hasClass('path-highlight')) {
      node.style('background-color', darkenColor(node.data('baseColor'), 0.8))
    }
  }))

  cy.on('mouseout', 'node', safeEventHandler((evt) => {
    cy.container().style.cursor = 'default'
    // 统一清除内联样式，回落到样式表状态（普通 / dimmed / path-highlight / selected 各自正确）
    evt.target.removeStyle()
  }))

  // Edge hover events
  cy.on('mouseover', 'edge', safeEventHandler((evt) => {
    const edge = evt.target
    cy.container().style.cursor = 'pointer'
    if (edge.hasClass('path-highlight')) return
    if (edge.hasClass('dimmed')) {
      // 暗掉的边 hover 时临时点亮，移出后由 removeStyle 回到 dimmed 透明度
      edge.style({ 'opacity': 1 })
      return
    }
    edge.style('line-color', darkenColor(edge.data('baseColor'), 0.7))
  }))

  cy.on('mouseout', 'edge', safeEventHandler((evt) => {
    cy.container().style.cursor = 'default'
    evt.target.removeStyle()
  }))
}

// 颜色加深：接受 rgb()/hex，按比例乘系数
const darkenColor = (color, factor) => {
  const m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color || '')
  if (m) {
    return `rgb(${Math.round(+m[1] * factor)},${Math.round(+m[2] * factor)},${Math.round(+m[3] * factor)})`
  }
  const hex = /^#([0-9a-f]{6})$/i.exec(color || '')
  if (hex) {
    const n = parseInt(hex[1], 16)
    const r = Math.round(((n >> 16) & 255) * factor)
    const g = Math.round(((n >> 8) & 255) * factor)
    const b = Math.round((n & 255) * factor)
    return `rgb(${r},${g},${b})`
  }
  return activePalette.value.node
}

// ---- 懒加载：注释 / 文献 ----
const loadAnnotations = async (protein) => {
  if (annotationsLoading.value) return
  annotationsLoading.value = true
  try {
    let groups = annotationsCache.get(protein)
    if (!groups) {
      const rows = await stringApi.getAnnotations([protein])
      groups = groupAnnotations(Array.isArray(rows) ? rows : [])
      annotationsCache.set(protein, groups)
    }
    annotationGroups.value = groups
    annotationsLoaded.value = true
  } catch (error) {
    console.warn('Failed to load annotations:', error)
    annotationGroups.value = []
    annotationsLoaded.value = true
    ElMessage.warning('Failed to load annotations')
  } finally {
    annotationsLoading.value = false
  }
}

const groupAnnotations = (rows) => {
  const grouped = new Map()
  rows.forEach(row => {
    const category = row.category || 'Other'
    if (!grouped.has(category)) grouped.set(category, { category, items: [], count: 0 })
    const group = grouped.get(category)
    group.count++
    if (group.items.length < 5 && row.description) {
      group.items.push(row.description)
    }
  })
  return [...grouped.values()].sort((a, b) => b.count - a.count)
}

const loadPublications = async () => {
  const data = selectedElement.value.data
  if (!data?.source || !data?.target || publicationsLoading.value) return
  publicationsLoading.value = true
  try {
    const result = await stringApi.getAbstracts(data.source, data.target)
    publications.value = result?.publications || []
    publicationsHitCount.value = result?.hitCount || 0
    publicationsLoaded.value = true
  } catch (error) {
    console.warn('Failed to load publications:', error)
    publications.value = []
    publicationsLoaded.value = true
    ElMessage.warning('Failed to load publications')
  } finally {
    publicationsLoading.value = false
  }
}

// ---- 对外暴露的方法 ----
const fitNetwork = () => {
  if (cy) {
    cy.fit(undefined, 30)
  }
}

const resetZoom = () => {
  if (cy) {
    cy.zoom(1)
    cy.center()
  }
}

const exportPng = () => {
  if (!cy) return
  const png = cy.png({ scale: 2, full: true, bg: 'white' })
  downloadBlob(png, 'protein_network.png')
  ElMessage.success('Network image exported')
}

const exportSvg = () => {
  if (!cy) return
  try {
    const svgContent = cy.svg({ bg: 'white', full: true })
    downloadBlob('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent), 'protein_network.svg')
    ElMessage.success('SVG exported')
  } catch (error) {
    console.error('SVG export failed:', error)
    ElMessage.error('SVG export failed')
  }
}

const buildGraphml = () => {
  if (!cy) return null
  try {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<graphml xmlns="http://graphml.graphdrawing.org/xmlns" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://graphml.graphdrawing.org/xmlns http://graphml.graphdrawing.org/xmlns/1.0/graphml.xsd">',
      '  <key id="d_label" for="node" attr.name="label" attr.type="string"/>',
      '  <key id="d_degree" for="node" attr.name="degree" attr.type="int"/>',
      '  <key id="d_betweenness" for="node" attr.name="betweenness" attr.type="double"/>',
      '  <key id="d_score" for="edge" attr.name="score" attr.type="double"/>',
      '  <graph id="G" edgedefault="undirected">'
    ]
    cy.nodes().forEach((node, i) => {
      const d = node.data()
      lines.push(`    <node id="${xmlEscape(d.label)}">`)
      lines.push(`      <data key="d_label">${xmlEscape(d.label)}</data>`)
      lines.push(`      <data key="d_degree">${node.degree()}</data>`)
      if (Number.isFinite(d.betweenness)) lines.push(`      <data key="d_betweenness">${d.betweenness}</data>`)
      lines.push('    </node>')
    })
    cy.edges().forEach((edge, i) => {
      const d = edge.data()
      lines.push(`    <edge id="e${i}" source="${xmlEscape(d.source)}" target="${xmlEscape(d.target)}">`)
      lines.push(`      <data key="d_score">${d.score}</data>`)
      lines.push('    </edge>')
    })
    lines.push('  </graph>')
    lines.push('</graphml>')
    return lines.join('\n')
  } catch (error) {
    console.error('GraphML build failed:', error)
    return null
  }
}

const downloadBlob = (href, filename, revoke = false) => {
  const link = document.createElement('a')
  link.download = filename
  link.href = href
  link.click()
  if (revoke) {
    setTimeout(() => URL.revokeObjectURL(href), 1000)
  }
}

const exportGraphml = () => {
  const xml = buildGraphml()
  if (!xml) {
    ElMessage.error('GraphML export failed')
    return
  }
  downloadBlob(URL.createObjectURL(new Blob([xml], { type: 'application/xml' })), 'protein_network.graphml', true)
  ElMessage.success('GraphML exported')
}

const toggleLayout = () => {
  if (!cy) return

  layoutIndex = (layoutIndex + 1) % layouts.length
  currentLayout = layouts[layoutIndex]

  const layout = cy.layout(getLayoutConfig(currentLayout))
  layout.run()

  ElMessage.success(`Layout changed to: ${currentLayout}`)
}

// 最短路径高亮（单位权）
const highlightPath = (from, to) => {
  if (!cy) return null
  const fromNode = cy.getElementById(from)
  const toNode = cy.getElementById(to)
  if (fromNode.length === 0 || toNode.length === 0) {
    ElMessage.warning('Both proteins must exist in the network')
    return null
  }

  clearHighlight()
  const dijkstra = cy.elements().dijkstra({
    root: fromNode,
    weight: () => 1,
    directed: false
  })
  const path = dijkstra.pathTo(toNode)
  if (path.empty()) {
    ElMessage.info(`No connecting path between ${from} and ${to}`)
    return null
  }

  pathActive.value = true
  cy.batch(() => {
    cy.elements().addClass('dimmed')
    path.removeClass('dimmed')
    path.nodes().addClass('path-highlight')
    path.edges().addClass('path-highlight')
  })

  const genes = path.nodes().map(n => n.data('label'))
  ElMessage.success(`Path found via ${genes.length} proteins (distance ${dijkstra.distanceTo(toNode)})`)
  return { genes, distance: dijkstra.distanceTo(toNode) }
}

const clearHighlight = () => {
  if (!cy) return
  pathActive.value = false
  cy.batch(() => {
    cy.elements().removeClass('dimmed path-highlight')
  })
}

// 模块隔离
const isolateModule = (moduleId) => {
  isolatedModule.value = moduleId
  refreshVisibility()
  fitNetwork()
}

const clearIsolation = () => {
  isolatedModule.value = null
  refreshVisibility()
}

defineExpose({
  fitNetwork,
  resetZoom,
  exportPng,
  exportSvg,
  exportGraphml,
  buildGraphml,
  highlightPath,
  clearHighlight,
  isolateModule,
  clearIsolation
})

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
  flex-wrap: wrap;
  gap: 10px;
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
  align-items: center;
}

.network-container {
  height: 500px;
  position: relative;
  background: white;
  border-radius: 0 0 8px 8px;
}

.evidence-legend {
  position: absolute;
  right: 10px;
  top: 10px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #e3e8ef;
  border-radius: 8px;
  padding: 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.72rem;
  color: #4a5568;
  pointer-events: none;
  max-width: 200px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.legend-swatch {
  display: inline-block;
  width: 14px;
  height: 4px;
  border-radius: 2px;
  flex-shrink: 0;
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
  color: #8CA2B4;
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
  color: #7E94A8;
}

.feature-item svg {
  font-size: 1.5rem;
  color: #8CA2B4;
}

.cytoscape-container {
  width: 100%;
  height: 100%;
  border-radius: 0 0 8px 8px;
}

.graph-appear-enter-active {
  transition: opacity 0.45s ease-out, transform 0.45s ease-out;
}

.graph-appear-enter-from {
  opacity: 0;
  transform: scale(0.975);
}

/* Dialog Styles */
.info-content {
  padding: 10px 0;
}

.node-info,
.edge-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item label {
  font-weight: 600;
  color: #2c3e50;
  min-width: 120px;
}

.info-item span {
  color: #64748B;
  font-weight: 500;
}

.protein-name {
  font-family: 'Consolas', 'Monaco', monospace;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: bold !important;
}

.channel-swatch {
  display: inline-block;
  width: 16px;
  height: 6px;
  border-radius: 3px;
  margin-right: 6px;
  vertical-align: middle;
}

.annotation-section {
  border-top: 1px solid #ebeef5;
  padding-top: 10px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-header label {
  font-weight: 600;
  color: #2c3e50;
}

.annotation-status {
  color: #909399;
  font-size: 0.85rem;
  padding: 8px 0;
}

.annotation-collapse :deep(.el-collapse-item__header) {
  font-size: 0.85rem;
  height: 36px;
}

.annotation-list {
  margin: 0;
  padding-left: 18px;
  font-size: 0.82rem;
  color: #555;
}

.annotation-list li {
  margin-bottom: 6px;
  line-height: 1.45;
}

.publication-list {
  margin: 0;
  padding-left: 0;
  list-style: none;
  font-size: 0.82rem;
}

.publication-list li {
  margin-bottom: 10px;
  line-height: 1.45;
}

.publication-list a {
  color: #4758a2;
  font-weight: 500;
  text-decoration: none;
}

.publication-list a:hover {
  text-decoration: underline;
}

.pub-meta {
  display: block;
  color: #909399;
  font-size: 0.75rem;
  margin-top: 2px;
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
