import api from '@/utils/api'
import axios from 'axios'

// 浏览器直连 STRING：访客网络出网正常时首选。
// STRING API 返回 Access-Control-Allow-Origin: *，支持跨域；
// 直连使用原始 axios（简单 GET、无自定义头），不会触发 CORS 预检。
// 后端代理作为回落通道：部分部署环境（如某些云主机）出网会被
// string-db.org 的 Cloudflare 拦截，此时代理同样不可用，但访客直连不受影响。
const STRING_DIRECT_BASE = 'https://string-db.org/api'

class StringApiService {
  constructor() {
    // 后端代理基础路径（直连失败时的回落通道），动态适配基础路径
    const apiBase = import.meta.env.VITE_API_BASE_URL || ''
    this.baseUrl = apiBase.endsWith('/api') ? '/string' : '/api/string'
    this.stableAddress = null
  }

  // identifiers 数组 → 分隔形式。注意必须用真实回车符 \r：
  // axios 会对参数值做 URL 编码（\r → %0D，正是 STRING 文档要求的分隔符）；
  // 若直接拼 '%0d' 字符串会被二次编码成 %250d，导致 STRING 返回 404
  joinIdentifiers(identifiers) {
    return identifiers
      .map(v => String(v).trim())
      .filter(v => v.length > 0)
      .join('\r')
  }

  // 直连请求。返回 { success, data } 形状，与 api 实例响应拦截器的解包结果一致，
  // 保证直连与代理回落两条路径的返回结构完全相同
  async directGet(path, params) {
    const response = await axios.get(`${STRING_DIRECT_BASE}${path}`, { params, timeout: 30000 })
    return { success: true, data: response.data }
  }

  // 直连优先、后端代理兜底
  async stringGet(path, params) {
    try {
      return await this.directGet(path, params)
    } catch (directError) {
      console.warn(`STRING direct access failed, falling back to server proxy: ${directError?.message}`)
      return api.get(`${this.baseUrl}${path}`, { params })
    }
  }

  // 获取STRING版本信息（失败时降级为默认地址，不阻塞网络分析流程）
  async getStringVersion() {
    try {
      const response = await this.stringGet('/json/version')
      if (response.data && response.data.length > 0) {
        this.stableAddress = response.data[0].stable_address
        return this.stableAddress
      }
      return 'https://string-db.org'
    } catch (error) {
      console.warn('STRING version unavailable, using default address:', error?.message)
      this.stableAddress = 'https://string-db.org'
      return this.stableAddress
    }
  }

  // 输入蛋白 ID 解析/映射报告（返回 matched 映射与 unmatched 清单）
  async resolveNs(identifiers, species = '9606') {
    try {
      const response = await this.directGet('/json/get_string_ids', {
        identifiers: this.joinIdentifiers(identifiers),
        species,
        limit: 1
      })
      const rows = Array.isArray(response.data) ? response.data : []
      const mappings = rows.map(r => ({
        queryIndex: r.queryIndex,
        query: r.queryItem,
        stringId: r.stringId,
        preferredName: r.preferredName,
        annotation: r.annotation || ''
      }))
      const matchedQueries = new Set(mappings.map(m => String(m.query).trim().toUpperCase()))
      const unmatched = identifiers
        .map(v => String(v).trim())
        .filter((v, i, arr) => v && arr.indexOf(v) === i)
        .filter(v => !matchedQueries.has(v.toUpperCase()))
      return { success: true, mappings, unmatched, requested: identifiers.length, matched: mappings.length }
    } catch (directError) {
      console.warn('STRING resolve direct failed, falling back to server proxy:', directError?.message)
      const response = await api.post(`${this.baseUrl}/resolve`, { identifiers, species })
      return { success: true, ...(response.data || {}) }
    }
  }

  // 一阶邻居扩展（人源走本地索引，其他物种走 STRING API）
  async expandNetwork(identifiers, { species = '9606', addPartners = 10, requiredScore = 400, networkType = 'functional' } = {}) {
    const response = await api.post(`${this.baseUrl}/expand`, {
      identifiers,
      species,
      add_partners: addPartners,
      required_score: requiredScore,
      network_type: networkType
    })
    return response.data
  }

  // 蛋白功能注释（STRING functional_annotation）
  async getAnnotations(identifiers, species = '9606') {
    try {
      const response = await this.directGet('/json/functional_annotation', {
        identifiers: this.joinIdentifiers(identifiers),
        species
      })
      return Array.isArray(response.data) ? response.data : []
    } catch (directError) {
      console.warn('STRING annotations direct failed, falling back to server proxy:', directError?.message)
      const response = await api.post(`${this.baseUrl}/annotations`, { identifiers, species })
      return response.data || []
    }
  }

  // 相互作用对的支撑文献（Europe PMC 标题/摘要共现检索，走后端、不经过 STRING）
  async getAbstracts(proteinA, proteinB) {
    const response = await api.post(`${this.baseUrl}/abstracts`, { identifiers: [proteinA, proteinB] })
    return response.data
  }

  // STRING 支持的物种列表 { source, count, species: [{id, name, domain}] }
  async getSpecies() {
    const response = await api.get(`${this.baseUrl}/species`)
    return response.data
  }

  // 标志物集网络邻近性/凝聚度检验（本地人源索引，度匹配随机化）
  async getProximity(seeds, permutations = 500) {
    const response = await api.post(`${this.baseUrl}/proximity`, { seeds, permutations })
    return response.data
  }

  // 获取蛋白质网络数据
  async getProteinNetwork(identifiers, species = '9606', requiredScore = 400, networkType = 'functional') {
    const params = {
      identifiers: this.joinIdentifiers(identifiers),
      species,
      required_score: requiredScore,
      network_type: networkType
    }
    try {
      const response = await this.directGet('/json/network', params)
      return response.data
    } catch (directError) {
      console.warn('STRING network direct failed, falling back to server proxy:', directError?.message)
      const response = await api.post(`${this.baseUrl}/network`, {
        identifiers,
        species,
        required_score: requiredScore,
        network_type: networkType
      })
      return response.data
    }
  }

  // 获取网络统计信息
  async getNetworkStats(identifiers, species = '9606') {
    const params = { identifiers: this.joinIdentifiers(identifiers), species }
    try {
      const response = await this.directGet('/json/stats', params)
      return response.data
    } catch (directError) {
      console.warn('STRING stats direct failed, falling back to server proxy:', directError?.message)
      const response = await api.post(`${this.baseUrl}/stats`, { identifiers, species })
      return response.data
    }
  }

  // 获取功能富集分析
  async getEnrichmentAnalysis(identifiers, species = '9606') {
    const params = { identifiers: this.joinIdentifiers(identifiers), species }
    try {
      const response = await this.directGet('/json/enrichment', params)
      return response.data
    } catch (directError) {
      console.warn('STRING enrichment direct failed, falling back to server proxy:', directError?.message)
      const response = await api.post(`${this.baseUrl}/enrichment`, { identifiers, species })
      return response.data
    }
  }

  // 获取网络图像URL
  getNetworkImageUrl(identifiers, species = '9606', requiredScore = 400) {
    const identifierString = identifiers.join('%0d')
    return `https://string-db.org/api/svg/network?identifiers=${identifierString}&species=${species}&required_score=${requiredScore}`
  }

  // 获取网络TSV数据URL
  getNetworkTsvUrl(identifiers, species = '9606', requiredScore = 400, networkType = 'functional') {
    const identifierString = identifiers.join('%0d')
    return `https://string-db.org/api/tsv/network?identifiers=${identifierString}&species=${species}&required_score=${requiredScore}&network_type=${networkType}`
  }

  // 获取富集分析TSV数据URL
  getEnrichmentTsvUrl(identifiers, species = '9606') {
    const identifierString = identifiers.join('%0d')
    return `https://string-db.org/api/tsv/enrichment?identifiers=${identifierString}&species=${species}`
  }

  // 解析TSV数据
  parseTsvData(tsvString) {
    const lines = tsvString.trim().split('\n')
    if (lines.length === 0) return []

    const headers = lines[0].split('\t')
    const data = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split('\t')
      const row = {}
      headers.forEach((header, index) => {
        row[header] = values[index] || ''
      })
      data.push(row)
    }

    return data
  }

  // 生成嵌入式网络HTML
  generateEmbeddedNetworkHtml(identifiers, options = {}) {
    const {
      species = '9606',
      requiredScore = 400,
      networkFlavor = 'confidence',
      networkType = 'functional',
      hideDisconnected = false
    } = options

    const identifierArray = JSON.stringify(identifiers)
    const stableAddress = this.stableAddress || 'https://string-db.org'

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <script type="text/javascript" src="${stableAddress}/javascript/combined_embedded_network_v2.0.4.js"></script>
          <script>
            function send_request() {
              getSTRING("${stableAddress}", {
                "species": "${species}",
                "identifiers": ${identifierArray},
                "required_score": "${requiredScore}",
                "network_flavor": "${networkFlavor}",
                "network_type": "${networkType}",
                "hide_disconnected_nodes": "${hideDisconnected ? '1' : '0'}",
                "caller_identity": "CBD-frontend"
              })
            }
          </script>
          <style>
            body {
              margin: 0;
              padding: 10px;
              font-family: Arial, sans-serif;
            }
            #stringEmbedded svg {
              display: block;
              margin: auto;
              max-width: 100%;
              height: auto;
            }
            .network-info {
              text-align: center;
              margin-bottom: 10px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body onload="send_request();">
          <div class="network-info">
            <strong>Protein Interaction Network</strong> - ${identifiers.length} proteins
          </div>
          <div id="stringEmbedded"></div>
        </body>
      </html>
    `
  }

  // 创建下载包
  async createDownloadPackage(identifiers, options = {}) {
    const {
      species = '9606',
      requiredScore = 400,
      networkType = 'functional'
    } = options

    try {
      // 获取各种数据的URL
      const urls = {
        networkImage: this.getNetworkImageUrl(identifiers, species, requiredScore),
        networkData: this.getNetworkTsvUrl(identifiers, species, requiredScore, networkType),
        enrichmentData: this.getEnrichmentTsvUrl(identifiers, species)
      }

      // 获取统计数据和拓扑数据
      const [statsData, enrichmentData] = await Promise.all([
        this.getNetworkStats(identifiers, species),
        this.getEnrichmentAnalysis(identifiers, species)
      ])

      return {
        urls,
        statsData,
        enrichmentData
      }
    } catch (error) {
      console.error('Failed to create download package:', error)
      throw error
    }
  }
}

export default new StringApiService()
