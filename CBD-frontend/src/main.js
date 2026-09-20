import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

import App from './App.vue'
import router from './router'
import './assets/css/main.css'

// 屏蔽 ResizeObserver 的良性循环告警：Element Plus / ECharts / Cytoscape 的
// 观察回调在同帧内又触发布局变化时，浏览器会推迟通知并抛出该消息，
// 不影响任何功能（参见 https://github.com/WICG/resize-observer/issues/38）。
// 仅过滤这两条特定消息，其它错误正常上报。
const RO_LOOP_MESSAGES = [
  'ResizeObserver loop completed with undelivered notifications.',
  'ResizeObserver loop limit exceeded'
]
window.addEventListener('error', (e) => {
  if (RO_LOOP_MESSAGES.includes(e.message)) {
    e.stopImmediatePropagation()
    e.preventDefault()
  }
})

// 添加FontAwesome图标
library.add(fas, far, fab)

const app = createApp(App)

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册FontAwesome组件
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

// WebMCP（W3C WebML CG 提案）：向支持该规范的 AI Agent 暴露结构化查询工具。
// 不支持的浏览器静默跳过，详见 src/utils/webmcp.js
import('./utils/webmcp')
  .then(m => m.registerWebMcpTools())
  .catch(err => console.warn('[WebMCP] registration skipped:', err?.message))

app.mount('#app')