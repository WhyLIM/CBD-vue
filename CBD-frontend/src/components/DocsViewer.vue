<template>
    <div class="docs-viewer">
        <iframe ref="docsIframe" :src="docsUrl" frameborder="0" width="100%" :style="{ height: iframeHeight + 'px' }"
            @load="onIframeLoad" class="docs-iframe" />
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const docsIframe = ref(null)
const docsUrl = ref('/docs/index.html')
const iframeHeight = ref(1200) // 增加默认高度

let heightCheckInterval = null

const adjustIframeHeight = () => {
    const iframe = docsIframe.value
    if (!iframe) return

    try {
        // 尝试获取iframe内容高度
        if (iframe.contentDocument) {
            const iframeDoc = iframe.contentDocument
            const body = iframeDoc.body

            if (body) {
                // 简单直接的方法：强制重置高度后测量
                // 临时设置一个很小的高度，强制内容重新布局
                const currentHeight = iframeHeight.value
                iframeHeight.value = 400

                // 等待DOM更新
                setTimeout(() => {
                    // 现在测量实际内容高度
                    const actualHeight = body.scrollHeight
                    const newHeight = Math.max(actualHeight + 10, 500)

                    // 只有当新高度与当前高度差异较大时才更新
                    if (Math.abs(newHeight - currentHeight) > 50) {
                        iframeHeight.value = newHeight
                        console.log('调整iframe高度:', currentHeight, '->', newHeight, '内容高度:', actualHeight)
                    } else {
                        // 恢复原高度
                        iframeHeight.value = currentHeight
                    }
                }, 100)
            }
        }
    } catch (e) {
        // 跨域限制，使用估算高度
        console.log('跨域限制，使用估算高度')

        // 根据URL估算不同页面的高度，但不要频繁更新
        const url = iframe.src
        const currentHeight = iframeHeight.value
        let estimatedHeight = 1200

        if (url.includes('Introduction')) {
            estimatedHeight = 1000
        } else if (url.includes('Use')) {
            estimatedHeight = 1500
        } else if (url.includes('Analysis')) {
            estimatedHeight = 1200
        } else if (url.includes('Statistics')) {
            estimatedHeight = 1300
        } else if (url.includes('FAQ')) {
            estimatedHeight = 1100
        }

        // 只有当估算高度与当前高度差异较大时才更新
        if (Math.abs(estimatedHeight - currentHeight) > 100) {
            iframeHeight.value = estimatedHeight
        }
    }
}

const onIframeLoad = () => {
    console.log('VitePress文档已加载')

    // 延迟调整高度，确保内容完全加载
    setTimeout(() => {
        adjustIframeHeight()
    }, 500)

    // 定期检查高度变化（减少频率）
    if (heightCheckInterval) {
        clearInterval(heightCheckInterval)
    }

    // 移除定期检查，避免干扰用户浏览体验
    // heightCheckInterval = setInterval(() => {
    //     adjustIframeHeight()
    // }, 10000)

    // 监听iframe内的点击事件和URL变化
    try {
        const iframe = docsIframe.value
        if (iframe && iframe.contentDocument) {
            let lastUrl = iframe.src

            // 监听点击事件
            iframe.contentDocument.addEventListener('click', (e) => {
                const target = e.target
                if (target.tagName === 'A' && target.href && !target.href.startsWith('#')) {
                    console.log('检测到页面导航点击:', target.href)
                    // 只在真正的页面导航时调整高度，减少调整次数
                    setTimeout(() => adjustIframeHeight(), 500)
                    // setTimeout(() => adjustIframeHeight(), 2000) // 确保内容完全加载
                }
            })

            // 减少URL检查频率，只检查真正的页面变化
            const urlCheckInterval = setInterval(() => {
                const currentUrl = iframe.contentWindow?.location?.href || iframe.src
                if (currentUrl !== lastUrl && !currentUrl.includes('#')) {
                    console.log('检测到页面URL变化:', lastUrl, '->', currentUrl)
                    lastUrl = currentUrl
                    // 只在页面真正变化时调整高度
                    setTimeout(() => adjustIframeHeight(), 500)
                }
            }, 800) // 减少检查频率到0.8秒

            // 清理定时器
            setTimeout(() => {
                clearInterval(urlCheckInterval)
            }, 300000) // 5分钟后停止检查
        }
    } catch (e) {
        console.log('无法监听iframe内部事件')
    }
}

onMounted(() => {
    // 初始设置
})

onUnmounted(() => {
    if (heightCheckInterval) {
        clearInterval(heightCheckInterval)
    }
})
</script>

<style scoped>
.docs-viewer {
    width: 100%;
    background: white;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.docs-iframe {
    border: none;
    width: 100%;
    min-height: 800px;
    display: block;
}

/* 移除iframe的默认边距 */
.docs-iframe :deep(body) {
    margin: 0;
    padding: 0;
}

@media (max-width: 768px) {
    .docs-iframe {
        min-height: 600px;
    }
}
</style>