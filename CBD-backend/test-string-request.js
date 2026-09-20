// 诊断脚本：在服务器上用与后端完全相同的方式请求 STRING，定位 403 来源
// 用法: cd CBD-backend && node test-string-request.js
const axios = require('axios')
const dns = require('dns')

const COMMON = {
  'User-Agent': 'curl/8.7.1',
  'Accept': '*/*',
  'Accept-Language': 'en-US,en;q=0.9',
  'Cache-Control': 'no-cache',
  'Accept-Encoding': 'gzip, deflate, br'
}

async function tryReq(label, url, headers) {
  try {
    const r = await axios.get(url, { headers, timeout: 30000, maxRedirects: 3 })
    console.log(`${label}: OK ${r.status}`)
  } catch (e) {
    const status = e.response ? e.response.status : 'NO_RESPONSE'
    const server = e.response?.headers?.server || '-'
    const cfRay = e.response?.headers?.['cf-ray'] || '-'
    console.log(`${label}: FAIL ${status} | server=${server} | cf-ray=${cfRay} | ${e.message}`)
  }
}

;(async () => {
  console.log('node version:', process.version)
  console.log('proxy env:', JSON.stringify({
    http_proxy: process.env.http_proxy || process.env.HTTP_PROXY || null,
    https_proxy: process.env.https_proxy || process.env.HTTPS_PROXY || null,
    no_proxy: process.env.no_proxy || process.env.NO_PROXY || null
  }))
  dns.lookup('string-db.org', { all: true }, (e, addrs) => {
    console.log('dns:', e ? e.message : addrs.map(a => a.family + ':' + a.address).join(', '))
  })
  await new Promise(r => setTimeout(r, 500))
  await tryReq('1.axios+后端同款头+手动Host', 'https://string-db.org/api/json/version', { ...COMMON, Host: 'string-db.org' })
  await tryReq('2.axios+后端同款头         ', 'https://string-db.org/api/json/version', { ...COMMON })
  await tryReq('3.axios+默认头             ', 'https://string-db.org/api/json/version', {})
  await tryReq('4.axios+stable地址         ', 'https://version-12-0.string-db.org/api/json/version', { ...COMMON, Host: 'version-12-0.string-db.org' })
  await tryReq('5.本机后端接口(绕过nginx)  ', 'http://127.0.0.1:3000/api/string/version', {})
})()
