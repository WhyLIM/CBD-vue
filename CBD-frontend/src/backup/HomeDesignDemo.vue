<template>
    <div class="design-demo">
        <div class="demo-header">
            <div class="container">
                <h1 class="demo-title">首页设计方案演示</h1>
                <p class="demo-subtitle">三种不同风格的首页设计，请选择您喜欢的方案</p>

                <div class="design-tabs">
                    <button v-for="design in designs" :key="design.id"
                        :class="['tab-button', { active: activeDesign === design.id }]"
                        @click="activeDesign = design.id">
                        <font-awesome-icon :icon="design.icon" />
                        <span>{{ design.name }}</span>
                    </button>
                </div>
            </div>
        </div>

        <div class="demo-content">
            <div class="design-info">
                <div class="container">
                    <div class="info-card">
                        <div class="info-header">
                            <div class="info-icon" :style="{ background: currentDesign.color }">
                                <font-awesome-icon :icon="currentDesign.icon" />
                            </div>
                            <div class="info-text">
                                <h3>{{ currentDesign.name }}</h3>
                                <p>{{ currentDesign.description }}</p>
                            </div>
                        </div>
                        <div class="info-features">
                            <div class="feature-tag" v-for="feature in currentDesign.features" :key="feature">
                                {{ feature }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="demo-preview">
                <div class="preview-container">
                    <div class="preview-header">
                        <div class="browser-controls">
                            <span class="control red"></span>
                            <span class="control yellow"></span>
                            <span class="control green"></span>
                        </div>
                        <div class="url-bar">
                            <font-awesome-icon :icon="['fas', 'lock']" />
                            <span>localhost:5173</span>
                        </div>
                    </div>

                    <div class="preview-content">
                        <component :is="currentComponent" />
                    </div>
                </div>
            </div>
        </div>

        <div class="demo-actions">
            <div class="container">
                <div class="actions-content">
                    <div class="action-text">
                        <h3>选择这个设计方案？</h3>
                        <p>我们将使用您选择的设计方案替换当前的首页</p>
                    </div>
                    <div class="action-buttons">
                        <el-button size="large" @click="$router.push('/home')">
                            <font-awesome-icon :icon="['fas', 'arrow-left']" />
                            返回首页
                        </el-button>
                        <el-button type="primary" size="large" @click="applyDesign">
                            <font-awesome-icon :icon="['fas', 'check']" />
                            应用此设计
                        </el-button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import HomeDemo1 from '@/components/HomeDemo1.vue'
import HomeDemo2 from '@/components/HomeDemo2.vue'
import HomeDemo3 from '@/components/HomeDemo3.vue'

const router = useRouter()
const activeDesign = ref(1)

const designs = ref([
    {
        id: 1,
        name: '现代简约风格',
        description: '简洁明快的设计，注重用户体验和视觉层次，适合现代化的科研平台',
        icon: ['fas', 'palette'],
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        features: ['简洁布局', '渐变背景', '卡片设计', '响应式布局'],
        component: 'HomeDemo1'
    },
    {
        id: 2,
        name: '学术专业风格',
        description: '专业严谨的学术风格，突出数据和研究的权威性，适合科研机构',
        icon: ['fas', 'graduation-cap'],
        color: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        features: ['学术风格', '数据展示', '专业配色', '信息丰富'],
        component: 'HomeDemo2'
    },
    {
        id: 3,
        name: '智能科技风格',
        description: '现代科技感设计，强调AI和智能化特性，适合前沿技术平台',
        icon: ['fas', 'robot'],
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        features: ['科技感', '动态效果', '智能元素', '交互丰富'],
        component: 'HomeDemo3'
    }
])

const currentDesign = computed(() => {
    return designs.value.find(d => d.id === activeDesign.value)
})

const currentComponent = computed(() => {
    const componentMap = {
        1: HomeDemo1,
        2: HomeDemo2,
        3: HomeDemo3
    }
    return componentMap[activeDesign.value]
})

const applyDesign = () => {
    ElMessage({
        type: 'success',
        message: `已选择"${currentDesign.value.name}"设计方案，请联系开发者应用此设计`,
        duration: 3000
    })
}
</script>

<style scoped>
.design-demo {
    min-height: 100vh;
    background: #f8fafc;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.demo-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 60px 20px 40px;
    text-align: center;
}

.demo-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 1rem;
}

.demo-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 2rem;
}

.design-tabs {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
}

.tab-button {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 12px 24px;
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    backdrop-filter: blur(10px);
}

.tab-button:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-2px);
}

.tab-button.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.6);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.demo-content {
    padding: 40px 20px;
}

.design-info {
    margin-bottom: 2rem;
}

.info-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.info-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
}

.info-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.info-text h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.info-text p {
    color: #64748b;
    line-height: 1.6;
}

.info-features {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.feature-tag {
    background: #f1f5f9;
    color: #475569;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: 500;
}

.demo-preview {
    margin-bottom: 2rem;
}

.preview-container {
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.preview-header {
    background: #f8fafc;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 1rem;
    border-bottom: 1px solid #e2e8f0;
}

.browser-controls {
    display: flex;
    gap: 6px;
}

.control {
    width: 12px;
    height: 12px;
    border-radius: 50%;
}

.control.red {
    background: #ff5f57;
}

.control.yellow {
    background: #ffbd2e;
}

.control.green {
    background: #28ca42;
}

.url-bar {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: white;
    padding: 6px 12px;
    border-radius: 6px;
    color: #64748b;
    font-size: 0.9rem;
    border: 1px solid #e2e8f0;
}

.preview-content {
    max-height: 600px;
    overflow-y: auto;
    background: white;
}

.demo-actions {
    background: white;
    padding: 40px 20px;
    border-top: 1px solid #e2e8f0;
}

.actions-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2rem;
}

.action-text h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.action-text p {
    color: #64748b;
}

.action-buttons {
    display: flex;
    gap: 1rem;
}

.action-buttons .el-button {
    padding: 12px 24px;
    font-size: 1rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .demo-title {
        font-size: 2rem;
    }

    .design-tabs {
        flex-direction: column;
        align-items: center;
    }

    .tab-button {
        width: 100%;
        max-width: 300px;
        justify-content: center;
    }

    .info-header {
        flex-direction: column;
        text-align: center;
    }

    .actions-content {
        flex-direction: column;
        text-align: center;
    }

    .action-buttons {
        flex-direction: column;
        width: 100%;
    }

    .action-buttons .el-button {
        width: 100%;
    }
}

@media (max-width: 480px) {
    .demo-header {
        padding: 40px 20px 30px;
    }

    .demo-title {
        font-size: 1.8rem;
    }

    .info-card {
        padding: 1.5rem;
    }

    .preview-content {
        max-height: 400px;
    }
}
</style>