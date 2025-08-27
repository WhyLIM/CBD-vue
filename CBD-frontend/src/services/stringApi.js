import axios from 'axios'

class StringApiService {
    constructor() {
        this.baseUrl = 'https://string-db.org/api'
        this.stableAddress = null
    }

    // 获取STRING版本信息
    async getStringVersion() {
        try {
            const response = await axios.get(`${this.baseUrl}/json/version`)
            this.stableAddress = response.data[0].stable_address
            return this.stableAddress
        } catch (error) {
            console.error('Failed to get STRING version:', error)
            throw error
        }
    }

    // 获取蛋白质网络数据
    async getProteinNetwork(identifiers, species = '9606', requiredScore = 400, networkType = 'functional') {
        try {
            const identifierString = identifiers.join('%0d')
            const url = `${this.baseUrl}/json/network`
            const params = {
                identifiers: identifierString,
                species,
                required_score: requiredScore,
                network_type: networkType
            }

            const response = await axios.get(url, { params })
            return response.data
        } catch (error) {
            console.error('Failed to get protein network:', error)
            throw error
        }
    }

    // 获取网络统计信息
    async getNetworkStats(identifiers, species = '9606') {
        try {
            const identifierString = identifiers.join('%0d')
            const url = `${this.baseUrl}/tsv/ppi_enrichment`
            const params = {
                identifiers: identifierString,
                species
            }

            const response = await axios.get(url, { params })
            return this.parseTsvData(response.data)
        } catch (error) {
            console.error('Failed to get network stats:', error)
            throw error
        }
    }

    // 获取功能富集分析
    async getEnrichmentAnalysis(identifiers, species = '9606') {
        try {
            const identifierString = identifiers.join('%0d')
            const url = `${this.baseUrl}/tsv/enrichment`
            const params = {
                identifiers: identifierString,
                species
            }

            const response = await axios.get(url, { params })
            return this.parseTsvData(response.data)
        } catch (error) {
            console.error('Failed to get enrichment analysis:', error)
            throw error
        }
    }

    // 获取网络图像URL
    getNetworkImageUrl(identifiers, species = '9606', requiredScore = 400) {
        const identifierString = identifiers.join('%0d')
        return `${this.baseUrl}/svg/network?identifiers=${identifierString}&species=${species}&required_score=${requiredScore}`
    }

    // 获取网络TSV数据URL
    getNetworkTsvUrl(identifiers, species = '9606', requiredScore = 400, networkType = 'functional') {
        const identifierString = identifiers.join('%0d')
        return `${this.baseUrl}/tsv/network?identifiers=${identifierString}&species=${species}&required_score=${requiredScore}&network_type=${networkType}`
    }

    // 获取富集分析TSV数据URL
    getEnrichmentTsvUrl(identifiers, species = '9606') {
        const identifierString = identifiers.join('%0d')
        return `${this.baseUrl}/tsv/enrichment?identifiers=${identifierString}&species=${species}`
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