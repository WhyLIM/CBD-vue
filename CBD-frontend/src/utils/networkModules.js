/**
 * 基于 graphology + Louvain 的网络模块检测。
 *
 * 输入为 STRING network 行（preferredName_A / preferredName_B / score），
 * 输出节点归属与按规模排序的模块列表。
 */
import Graph from 'graphology'
import louvain from 'graphology-communities-louvain'

/**
 * @param {Array<{preferredName_A: string, preferredName_B: string, score?: number|string}>} networkData
 * @returns {{ assignments: Object<string, number>, modules: Array<{id: number, genes: string[], size: number, density: number, internalEdges: number}> }}
 */
export const detectModules = (networkData) => {
  const graph = new Graph({ type: 'undirected', multi: false })

  for (const row of networkData || []) {
    const a = String(row.preferredName_A || '').trim()
    const b = String(row.preferredName_B || '').trim()
    if (!a || !b) continue
    if (!graph.hasNode(a)) graph.addNode(a)
    if (!graph.hasNode(b)) graph.addNode(b)
    if (!graph.hasEdge(a, b)) {
      graph.addEdge(a, b, { weight: Math.max(0.001, Number(row.score) || 0.5) })
    }
  }

  if (graph.order === 0) {
    return { assignments: {}, modules: [] }
  }

  const details = louvain(graph, { resolution: 1, getEdgeWeight: 'weight' })

  // details: node -> community number
  const grouped = new Map()
  graph.forEachNode((node) => {
    const community = details[node] ?? 0
    if (!grouped.has(community)) grouped.set(community, [])
    grouped.get(community).push(node)
  })

  const modulesRaw = [...grouped.entries()]
    .map(([community, genes]) => {
      let internalEdges = 0
      genes.forEach((gene, i) => {
        genes.slice(i + 1).forEach((other) => {
          if (graph.hasEdge(gene, other)) internalEdges++
        })
      })
      const possible = (genes.length * (genes.length - 1)) / 2
      return {
        id: community,
        genes,
        size: genes.length,
        internalEdges,
        density: possible > 0 ? internalEdges / possible : 0
      }
    })
    .filter((m) => m.size >= 2)
    .sort((a, b) => b.size - a.size || b.internalEdges - a.internalEdges)

  // 重新编号为 0..n-1，保证与配色板顺序一致
  const assignments = {}
  const modules = modulesRaw.map((m, index) => {
    m.genes.forEach((gene) => { assignments[gene] = index })
    return { ...m, id: index }
  })

  return { assignments, modules }
}
