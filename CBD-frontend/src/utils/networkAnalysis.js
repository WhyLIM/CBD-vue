// 网络拓扑分析工具
export class NetworkAnalyzer {
    constructor(networkData) {
        this.nodes = new Map()
        this.edges = []
        this.adjacencyList = new Map()

        this.buildNetwork(networkData)
    }

    // 构建网络结构
    buildNetwork(networkData) {
        // 构建节点和邻接表
        networkData.forEach(interaction => {
            const nodeA = interaction.preferredName_A
            const nodeB = interaction.preferredName_B
            const score = parseFloat(interaction.score)

            // 添加节点
            if (!this.nodes.has(nodeA)) {
                this.nodes.set(nodeA, { id: nodeA, degree: 0 })
                this.adjacencyList.set(nodeA, [])
            }
            if (!this.nodes.has(nodeB)) {
                this.nodes.set(nodeB, { id: nodeB, degree: 0 })
                this.adjacencyList.set(nodeB, [])
            }

            // 添加边
            this.edges.push({
                source: nodeA,
                target: nodeB,
                score: score,
                confidence: score
            })

            // 更新邻接表和度数
            this.adjacencyList.get(nodeA).push({ node: nodeB, weight: score })
            this.adjacencyList.get(nodeB).push({ node: nodeA, weight: score })
            this.nodes.get(nodeA).degree++
            this.nodes.get(nodeB).degree++
        })
    }

    // 计算介数中心性
    calculateBetweennessCentrality() {
        const betweenness = new Map()
        const nodes = Array.from(this.nodes.keys())

        // 初始化
        nodes.forEach(node => betweenness.set(node, 0))

        // 对每个节点计算最短路径
        nodes.forEach(source => {
            const stack = []
            const paths = new Map()
            const distances = new Map()
            const predecessors = new Map()

            // 初始化
            nodes.forEach(node => {
                paths.set(node, 0)
                distances.set(node, -1)
                predecessors.set(node, [])
            })

            paths.set(source, 1)
            distances.set(source, 0)

            const queue = [source]

            // BFS
            while (queue.length > 0) {
                const current = queue.shift()
                stack.push(current)

                const neighbors = this.adjacencyList.get(current) || []
                neighbors.forEach(({ node: neighbor }) => {
                    // 首次访问
                    if (distances.get(neighbor) < 0) {
                        queue.push(neighbor)
                        distances.set(neighbor, distances.get(current) + 1)
                    }

                    // 最短路径
                    if (distances.get(neighbor) === distances.get(current) + 1) {
                        paths.set(neighbor, paths.get(neighbor) + paths.get(current))
                        predecessors.get(neighbor).push(current)
                    }
                })
            }

            // 累积依赖
            const dependency = new Map()
            nodes.forEach(node => dependency.set(node, 0))

            while (stack.length > 0) {
                const current = stack.pop()
                const preds = predecessors.get(current)

                preds.forEach(pred => {
                    const contrib = (paths.get(pred) / paths.get(current)) * (1 + dependency.get(current))
                    dependency.set(pred, dependency.get(pred) + contrib)
                })

                if (current !== source) {
                    betweenness.set(current, betweenness.get(current) + dependency.get(current))
                }
            }
        })

        return betweenness
    }

    // 计算接近中心性
    calculateClosenessCentrality() {
        const closeness = new Map()
        const nodes = Array.from(this.nodes.keys())

        nodes.forEach(source => {
            const distances = this.dijkstra(source)
            const totalDistance = Array.from(distances.values())
                .filter(d => d !== Infinity && d > 0)
                .reduce((sum, d) => sum + d, 0)

            const reachableNodes = Array.from(distances.values())
                .filter(d => d !== Infinity && d >= 0).length - 1

            if (reachableNodes > 0 && totalDistance > 0) {
                closeness.set(source, reachableNodes / totalDistance)
            } else {
                closeness.set(source, 0)
            }
        })

        return closeness
    }

    // Dijkstra算法计算最短路径
    dijkstra(source) {
        const distances = new Map()
        const visited = new Set()
        const nodes = Array.from(this.nodes.keys())

        // 初始化距离
        nodes.forEach(node => {
            distances.set(node, node === source ? 0 : Infinity)
        })

        while (visited.size < nodes.length) {
            // 找到未访问的最小距离节点
            let current = null
            let minDistance = Infinity

            nodes.forEach(node => {
                if (!visited.has(node) && distances.get(node) < minDistance) {
                    current = node
                    minDistance = distances.get(node)
                }
            })

            if (current === null || minDistance === Infinity) break

            visited.add(current)

            // 更新邻居距离
            const neighbors = this.adjacencyList.get(current) || []
            neighbors.forEach(({ node: neighbor }) => {
                if (!visited.has(neighbor)) {
                    const newDistance = distances.get(current) + 1 // 无权图，距离为1
                    if (newDistance < distances.get(neighbor)) {
                        distances.set(neighbor, newDistance)
                    }
                }
            })
        }

        return distances
    }

    // 计算聚类系数
    calculateClusteringCoefficient() {
        const clustering = new Map()

        this.nodes.forEach((nodeData, nodeId) => {
            const neighbors = this.adjacencyList.get(nodeId) || []
            const degree = neighbors.length

            if (degree < 2) {
                clustering.set(nodeId, 0)
                return
            }

            let triangles = 0
            const neighborIds = neighbors.map(n => n.node)

            // 计算邻居之间的连接数
            for (let i = 0; i < neighborIds.length; i++) {
                for (let j = i + 1; j < neighborIds.length; j++) {
                    const neighbor1 = neighborIds[i]
                    const neighbor2 = neighborIds[j]

                    const neighbor1Connections = this.adjacencyList.get(neighbor1) || []
                    if (neighbor1Connections.some(n => n.node === neighbor2)) {
                        triangles++
                    }
                }
            }

            const possibleTriangles = (degree * (degree - 1)) / 2
            clustering.set(nodeId, triangles / possibleTriangles)
        })

        return clustering
    }

    // 获取完整的拓扑分析结果
    getTopologyAnalysis() {
        const betweenness = this.calculateBetweennessCentrality()
        const closeness = this.calculateClosenessCentrality()
        const clustering = this.calculateClusteringCoefficient()

        const results = []

        this.nodes.forEach((nodeData, nodeId) => {
            results.push({
                protein: nodeId,
                degree: nodeData.degree,
                betweenness: Number(betweenness.get(nodeId).toFixed(6)),
                closeness: Number(closeness.get(nodeId).toFixed(6)),
                clustering: Number(clustering.get(nodeId).toFixed(6))
            })
        })

        // 按度数排序
        results.sort((a, b) => b.degree - a.degree)

        return results
    }

    // 获取网络基本统计信息
    getNetworkStatistics() {
        const nodeCount = this.nodes.size
        const edgeCount = this.edges.length
        const avgDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0

        // 计算全局聚类系数
        const clustering = this.calculateClusteringCoefficient()
        const avgClustering = Array.from(clustering.values())
            .reduce((sum, c) => sum + c, 0) / clustering.size

        return {
            number_of_nodes: nodeCount,
            number_of_edges: edgeCount,
            average_node_degree: Number(avgDegree.toFixed(2)),
            local_clustering_coefficient: Number(avgClustering.toFixed(3)),
            density: nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0
        }
    }
}

// 富集分析结果处理
export class EnrichmentProcessor {
    constructor() {
        this.urlTemplates = {
            'COMPARTMENTS': 'https://compartments.jensenlab.org/Entity?order=textmining,knowledge,predictions&knowledge=10&textmining=10&predictions=10&type1=-22&type2={species}&id1=GO:',
            'TISSUES': 'https://tissues.jensenlab.org/Entity?order=textmining,knowledge,experiments&knowledge=10&experiments=10&textmining=10&type1=-25&type2={species}&id1=',
            'DISEASES': 'https://diseases.jensenlab.org/Entity?order=textmining,knowledge,experiments&textmining=10&knowledge=10&experiments=10&type1=-26&type2={species}&id1=',
            'Process': 'http://amigo.geneontology.org/amigo/term/',
            'Component': 'http://amigo.geneontology.org/amigo/term/',
            'Function': 'http://amigo.geneontology.org/amigo/term/',
            'Keyword': 'https://www.uniprot.org/keywords/',
            'KEGG': 'https://www.kegg.jp/kegg-bin/show_pathway?',
            'SMART': 'http://smart.embl-heidelberg.de/smart/do_annotation.pl?DOMAIN=',
            'InterPro': 'https://www.ebi.ac.uk/interpro/entry/',
            'Pfam': 'https://pfam.xfam.org/family/',
            'PMID': 'https://pubmed.ncbi.nlm.nih.gov/',
            'RCTM': 'https://reactome.org/content/detail/R-',
            'WikiPathways': 'https://www.wikipathways.org/index.php/Pathway:',
            'HPO': 'https://monarchinitiative.org/phenotype/'
        }

        this.categoryColors = {
            'COMPARTMENTS': '#ffb142',
            'TISSUES': '#B33771',
            'DISEASES': '#eb2f06',
            'Process': '#33d9b2',
            'Component': '#ff5252',
            'Function': '#34ace0',
            'Keyword': 'black',
            'KEGG': '#f78fb3',
            'SMART': '#BDC581',
            'InterPro': '#2daec1',
            'Pfam': '#8854d0',
            'PMID': '#20558a',
            'RCTM': '#778beb',
            'WikiPathways': '#a5b1c2',
            'HPO': '#4b6584'
        }
    }

    // 处理富集分析数据
    processEnrichmentData(rawData, species = '9606') {
        return rawData.map(item => {
            const category = item.category
            const term = item.term
            const color = this.categoryColors[category] || '#666'

            // 生成链接
            let url = this.urlTemplates[category]
            if (url) {
                url = url.replace('{species}', species)
                let termId = term

                // 特殊处理某些类别的term ID
                if (category === 'COMPARTMENTS' || category === 'PMID') {
                    termId = term.split(':')[1] || term
                }

                const fullUrl = url + termId
                const termHtml = `<a href="${fullUrl}" target="_blank" style="color: ${color}; font-weight: bold; text-decoration: none;">${term}</a>`

                return {
                    ...item,
                    termHtml,
                    color,
                    url: fullUrl
                }
            }

            return {
                ...item,
                termHtml: term,
                color,
                url: null
            }
        })
    }

    // 按类别分组富集结果
    groupByCategory(enrichmentData) {
        const grouped = {}

        enrichmentData.forEach(item => {
            const category = item.category
            if (!grouped[category]) {
                grouped[category] = []
            }
            grouped[category].push(item)
        })

        return grouped
    }

    // 获取顶级富集结果
    getTopEnrichments(enrichmentData, limit = 10) {
        return enrichmentData
            .sort((a, b) => parseFloat(a.pvalue || a.p_value || 1) - parseFloat(b.pvalue || b.p_value || 1))
            .slice(0, limit)
    }
}