const assert = require('assert')

process.env.ADMIN_USER = process.env.ADMIN_USER || 'admin'
process.env.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change_me'
process.env.JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'
const port = process.env.PORT || 3000
process.env.TEST_BASE_URL = `http://localhost:${port}`
require('../server')

async function run() {
    const base = process.env.TEST_BASE_URL
    await new Promise(r => setTimeout(r, 800))

    const healthRes = await fetch(`${base}/api/health`)
    assert.strictEqual(healthRes.status, 200)
    const health = await healthRes.json()
    assert.strictEqual(health.status, 'OK')

    const loginRes = await fetch(`${base}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: process.env.ADMIN_USER || 'admin', password: process.env.ADMIN_PASSWORD || 'change_me' })
    })
    assert.strictEqual(loginRes.status, 200)
    const login = await loginRes.json()
    assert.ok(login?.data?.token)

    const token = login.data.token
    const histRes = await fetch(`${base}/api/submission/history?page=1&limit=1`, {
        headers: { Authorization: `Bearer ${token}` }
    })
    assert.strictEqual(histRes.status, 200)
    const hist = await histRes.json()
    assert.strictEqual(hist.success, true)

    console.log('OK')
}

run().catch(err => {
    console.error(err)
    process.exit(1)
})
