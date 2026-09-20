/**
 * 网络可视化配色工具（预设 + 自定义调色板）。
 *
 * 结构：
 * - PALETTES：内置预设（莫兰迪浅色 = 默认、莫兰迪标准、经典明亮）
 * - resolvePalette(key, custom)：把预设 key + 自定义颜色解析为完整调色板
 * - 各预设只控制：节点默认底色、模块 15 色、置信度边渐变、选中/路径强调色；
 *   证据通道（EVIDENCE_CHANNELS）与对比三色（MEMBERSHIP_COLORS）是语义色，
 *   不随预设切换。
 *
 * STRING network 接口每条边返回 7 个证据通道分数（0-1）：
 * nscore 邻接 / fscore 基因融合 / pscore 共有表型 / ascore 共表达 /
 * escore 实验 / dscore 数据库 / tscore 文本挖掘。
 * 本地索引扩展出的边只有 combined score，通道信息缺失时回退 confidence 配色。
 */

const isHex = (v) => /^#[0-9a-fA-F]{6}$/.test(v || '')

// 向白色方向混合 t∈[0,1]，用于整体提亮
export const lighten = (hex, t) => {
  if (!isHex(hex)) return hex
  const n = parseInt(hex.slice(1), 16)
  const mix = (v) => Math.round(v + (255 - v) * t)
  const r = mix((n >> 16) & 255)
  const g = mix((n >> 8) & 255)
  const b = mix(n & 255)
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`
}

// hex ↔ HSL 转换（h∈[0,360)，s/l∈[0,100]）
const hexToRgb = (hex) => {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
const rgbToHexArr = (rgb) => '#' + rgb.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('')
export const hexToHsl = (hex) => {
  const [r0, g0, b0] = hexToRgb(hex).map(v => v / 255)
  const max = Math.max(r0, g0, b0), min = Math.min(r0, g0, b0)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r0) h = ((g0 - b0) / d + (g0 < b0 ? 6 : 0))
  else if (max === g0) h = (b0 - r0) / d + 2
  else h = (r0 - g0) / d + 4
  return [h * 60, s * 100, l * 100]
}
const hslToRgbArr = (h, s, l) => {
  const S = s / 100, L = l / 100
  const k = (n) => (n + h / 30) % 12
  const a = S * Math.min(L, 1 - L)
  const f = (n) => L - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0) * 255, f(8) * 255, f(4) * 255]
}
const hslToHex = (h, s, l) => rgbToHexArr(hslToRgbArr(h, s, l))

/**
 * 由节点色推导边的置信度渐变：保持色相但把饱和度压到近灰（默认灰色），
 * 亮度从浅到深，实现“边适应配色方案”。
 */
const buildEdgeStops = (nodeHex) => {
  const [h, s] = hexToHsl(isHex(nodeHex) ? nodeHex : '#8CA2B4')
  const sat = Math.min(Math.max(s * 0.35, 0), 12)
  return [[0.0, 88], [0.4, 76], [0.7, 62], [1.0, 48]].map(([t, l]) => {
    const rgb = hslToRgbArr(h, sat, l).map(Math.round)
    return [t, rgb]
  })
}

// 莫兰迪基色（标准深度）
const MORANDI_MODULES = [
  '#A29BBD', '#C8A3A0', '#9CB4A6', '#9FB6C4', '#C7B98F',
  '#C2997F', '#84AFA6', '#B8AFC9', '#C99890', '#A9A887',
  '#7D92AC', '#CBBBA4', '#A8B8BE', '#B394A8', '#A8A79F'
]
const CLASSIC_MODULES = [
  '#667eea', '#f28147', '#0d8b43', '#37939a', '#9e4fd0',
  '#e74c3c', '#c9a227', '#4758a2', '#68bd48', '#d05f8c',
  '#5a8fc4', '#b8860b', '#20b2aa', '#cd5c5c', '#8fbc8f'
]
// 莫兰迪浅色 = 标准莫兰迪整体向白提亮一档
const LIFT = 0.22

export const PALETTES = {
  morandiLight: {
    label: 'Morandi · Light',
    node: lighten('#8CA2B4', LIFT),
    modules: MORANDI_MODULES.map((c) => lighten(c, LIFT)),
    edge: null,
    selected: lighten('#BC8F8F', LIFT),
    selectedBorder: lighten('#A97676', LIFT),
    path: lighten('#BFA063', LIFT),
    pathBorder: lighten('#8F7440', LIFT)
  },
  morandi: {
    label: 'Morandi · Classic',
    node: '#8CA2B4',
    modules: MORANDI_MODULES,
    edge: null,
    selected: '#BC8F8F',
    selectedBorder: '#A97676',
    path: '#BFA063',
    pathBorder: '#8F7440'
  },
  classic: {
    label: 'Classic',
    node: '#667eea',
    modules: CLASSIC_MODULES,
    edge: null,
    selected: '#ff6b6b',
    selectedBorder: '#ff5252',
    path: '#f59e0b',
    pathBorder: '#b45309'
  }
}

// 边渐变依赖各预设的节点色，定义后统一推导
Object.values(PALETTES).forEach((p) => { p.edge = buildEdgeStops(p.node) })

export const DEFAULT_PALETTE_KEY = 'morandiLight'
// 自定义模式的模块槽位数（与预设一致；模块数超过槽位时自动生成新色）
export const CUSTOM_MODULE_SLOTS = 15

/**
 * 解析生效调色板。
 * @param {string} key 预设 key 或 'custom'
 * @param {{node?: string, modules?: string[]} | null} custom 自定义颜色（key==='custom' 时生效）
 */
export const resolvePalette = (key, custom = null) => {
  if (key === 'custom' && custom) {
    const base = PALETTES.morandiLight
    const modules = (Array.isArray(custom.modules) ? custom.modules : []).filter(isHex)
    const node = isHex(custom.node) ? custom.node : base.node
    return {
      label: 'Custom',
      node,
      modules: modules.length > 0 ? modules : base.modules,
      edge: buildEdgeStops(node),
      selected: base.selected,
      selectedBorder: base.selectedBorder,
      path: base.path,
      pathBorder: base.pathBorder
    }
  }
  return PALETTES[key] || PALETTES[DEFAULT_PALETTE_KEY]
}

// 模块数超过调色板槽位时的补色生成：黄金比例推进色相（相邻模块不会撞色），
// 饱和度/亮度以调色板第一个模块色为基准，保持同一风格
export const generatedModuleColor = (index, palette) => {
  const mods = palette?.modules
  const first = Array.isArray(mods) && isHex(mods[0]) ? mods[0] : '#A29BBD'
  const [, s0, l0] = hexToHsl(first)
  const h = (index * 137.508) % 360
  const sat = Math.min(Math.max(s0 + 8, 20), 42)
  const lig = Math.min(Math.max(l0 + 4, 58), 78)
  return rgbToHexArr(hslToRgbArr(h, sat, lig))
}

// 取第 index 个模块色：槽位内用定义色，超出后自动生成
export const moduleColorAt = (palette, index) => {
  const mods = palette?.modules
  if (Array.isArray(mods) && index >= 0 && index < mods.length) return mods[index]
  return generatedModuleColor(index, palette)
}

export const EVIDENCE_CHANNELS = [
  { key: 'nscore', label: 'Neighbourhood', color: '#B98B8B' },
  { key: 'fscore', label: 'Gene Fusion', color: '#C08D6C' },
  { key: 'pscore', label: 'Phylogenetic Co-occurrence', color: '#A9A176' },
  { key: 'ascore', label: 'Co-expression', color: '#9C8FB5' },
  { key: 'escore', label: 'Experiments', color: '#7E94A8' },
  { key: 'dscore', label: 'Databases', color: '#8FAE9B' },
  { key: 'tscore', label: 'Text-mining', color: '#A6A8AD' }
]

// 找出一条边的主导证据通道（各通道都为 0 或缺失时返回 null）
export const dominantChannel = (row) => {
  let best = null
  let bestScore = 0
  for (const ch of EVIDENCE_CHANNELS) {
    const v = Number(row?.[ch.key])
    if (Number.isFinite(v) && v > bestScore) {
      bestScore = v
      best = ch
    }
  }
  return best
}

// 边按 combined score 渐变（传入调色板的 edge stops）
export const scoreToColorWith = (stops, score) => {
  const s = Math.max(0, Math.min(1, Number(score) || 0))
  const list = stops && stops.length ? stops : PALETTES[DEFAULT_PALETTE_KEY].edge
  for (let i = 1; i < list.length; i++) {
    if (s <= list[i][0]) {
      const [x0, c0] = list[i - 1]
      const [x1, c1] = list[i]
      const t = x1 === x0 ? 0 : (s - x0) / (x1 - x0)
      const c = c0.map((v, k) => Math.round(v + (c1[k] - v) * t))
      return `rgb(${c[0]},${c[1]},${c[2]})`
    }
  }
  const last = list[list.length - 1][1]
  return `rgb(${last[0]},${last[1]},${last[2]})`
}

// 数值 → 颜色渐变（浅灰紫 → 深灰紫），用于中心性等节点指标映射
export const valueToNodeColor = (t) => {
  const s = Math.max(0, Math.min(1, Number(t) || 0))
  const from = [213, 211, 222]
  const to = [122, 114, 156]
  const c = from.map((v, k) => Math.round(v + (to[k] - v) * s))
  return `rgb(${c[0]},${c[1]},${c[2]})`
}

// 集合对比着色（A only / B only / shared）：陶土 / 蓝灰 / 灰紫（语义色，不随预设切换）
export const MEMBERSHIP_COLORS = {
  A: '#C2917F',
  B: '#7E99AD',
  both: '#9487B5'
}

// 节点标签配色（莫兰迪/浅色底上用深色字 + 白描边保证可读）
export const NODE_LABEL_COLOR = '#39415C'

// GraphML/XML 转义
export const xmlEscape = (str) =>
  String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
