<template>
    <div class="home-demo3">
        <!-- 现代简洁Hero区域 -->
        <section class="modern-hero">
            <div class="hero-background">
                <div class="floating-elements">
                    <div class="float-element" v-for="i in 8" :key="i" :style="getFloatStyle(i)">
                        <font-awesome-icon :icon="getRandomIcon(i)" />
                    </div>
                </div>
            </div>
            <div class="container">
                <div class="hero-content">
                    <div class="hero-text">
                        <div class="hero-tag">
                            <font-awesome-icon :icon="['fas', 'dna']" />
                            <span>生物医学数据平台</span>
                        </div>
                        <h1 class="hero-title">
                            智能化生物标记物
                            <span class="gradient-text">发现平台</span>
                        </h1>
                        <p class="hero-subtitle">
                            利用人工智能和大数据技术，为结直肠癌研究提供精准的生物标记物分析和预测服务
                        </p>
                        <div class="hero-buttons">
                            <el-button type="primary" size="large" round @click="$router.push('/biomarkers')">
                                <font-awesome-icon :icon="['fas', 'rocket']" />
                                立即开始
                            </el-button>
                            <el-button size="large" round @click="scrollToFeatures">
                                <font-awesome-icon :icon="['fas', 'play']" />
                                观看演示
                            </el-button>
                        </div>
                    </div>
                    <div class="hero-visual">
                        <div class="data-visualization">
                            <div class="viz-container">
                                <div class="data-node" v-for="node in dataNodes" :key="node.id" :style="node.style"
                                    :class="node.type">
                                    <font-awesome-icon :icon="node.icon" />
                                </div>
                                <svg class="connection-lines" viewBox="0 0 400 300">
                                    <path v-for="line in connectionLines" :key="line.id" :d="line.path"
                                        :class="line.class" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 实时数据展示 -->
        <section class="live-stats">
            <div class="container">
                <div class="stats-grid">
                    <div class="stat-card" v-for="stat in liveStats" :key="stat.id">
                        <div class="stat-icon" :style="{ background: stat.color }">
                            <font-awesome-icon :icon="stat.icon" />
                        </div>
                        <div class="stat-content">
                            <div class="stat-number" :style="{ color: stat.color }">
                                {{ stat.value }}
                            </div>
                            <div class="stat-label">{{ stat.label }}</div>
                            <div class="stat-trend" :class="stat.trend">
                                <font-awesome-icon :icon="stat.trendIcon" />
                                <span>{{ stat.change }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 智能功能卡片 -->
        <section class="smart-features" ref="featuresSection">
            <div class="container">
                <div class="section-header">
                    <h2 class="section-title">智能分析工具</h2>
                    <p class="section-subtitle">基于机器学习的生物标记物分析平台</p>
                </div>
                <div class="features-container">
                    <div class="feature-card-large">
                        <div class="card-content">
                            <div class="card-header">
                                <div class="card-icon primary">
                                    <font-awesome-icon :icon="['fas', 'brain']" />
                                </div>
                                <div class="card-title">
                                    <h3>AI智能搜索</h3>
                                    <p>自然语言处理，智能理解查询意图</p>
                                </div>
                            </div>
                            <div class="card-features">
                                <div class="feature-item">
                                    <font-awesome-icon :icon="['fas', 'magic']" />
                                    <span>语义搜索</span>
                                </div>
                                <div class="feature-item">
                                    <font-awesome-icon :icon="['fas', 'lightbulb']" />
                                    <span>智能推荐</span>
                                </div>
                                <div class="feature-item">
                                    <font-awesome-icon :icon="['fas', 'chart-line']" />
                                    <span>趋势预测</span>
                                </div>
                            </div>
                            <el-button type="primary" @click="$router.push('/biomarkers')" class="card-button">
                                体验AI搜索
                            </el-button>
                        </div>
                    </div>

                    <div class="feature-cards-grid">
                        <div class="feature-card" v-for="feature in smartFeatures" :key="feature.id"
                            @click="$router.push(feature.link)">
                            <div class="card-icon" :style="{ background: feature.color }">
                                <font-awesome-icon :icon="feature.icon" />
                            </div>
                            <h4 class="card-title">{{ feature.title }}</h4>
                            <p class="card-description">{{ feature.description }}</p>
                            <div class="card-tags">
                                <span class="tag" v-for="tag in feature.tags" :key="tag">{{ tag }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 数据洞察 -->
        <section class="data-insights">
            <div class="container">
                <div class="insights-content">
                    <div class="insights-text">
                        <h2 class="section-title">数据驱动的洞察</h2>
                        <p class="insights-description">
                            通过深度学习算法分析海量生物医学数据，发现隐藏的模式和关联，
                            为精准医疗和个性化治疗提供科学依据。
                        </p>
                        <div class="insight-highlights">
                            <div class="highlight-item" v-for="highlight in dataHighlights" :key="highlight.id">
                                <div class="highlight-icon">
                                    <font-awesome-icon :icon="highlight.icon" />
                                </div>
                                <div class="highlight-content">
                                    <h4>{{ highlight.title }}</h4>
                                    <p>{{ highlight.description }}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="insights-visual">
                        <div class="chart-container">
                            <div class="chart-header">
                                <h4>生物标记物分布</h4>
                                <div class="chart-controls">
                                    <el-button size="small" type="primary">蛋白质</el-button>
                                    <el-button size="small">基因</el-button>
                                    <el-button size="small">RNA</el-button>
                                </div>
                            </div>
                            <div class="chart-content">
                                <div class="chart-bars">
                                    <div class="bar-item" v-for="bar in chartData" :key="bar.label">
                                        <div class="bar-label">{{ bar.label }}</div>
                                        <div class="bar-container">
                                            <div class="bar-fill" :style="{
                                                width: bar.percentage + '%',
                                                background: bar.color
                                            }"></div>
                                        </div>
                                        <div class="bar-value">{{ bar.value }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 快速入门 -->
        <section class="quick-start">
            <div class="container">
                <div class="quick-start-content">
                    <h2 class="section-title">快速入门</h2>
                    <div class="steps-container">
                        <div class="step-card" v-for="(step, index) in quickStartSteps" :key="step.id">
                            <div class="step-number">{{ index + 1 }}</div>
                            <div class="step-content">
                                <div class="step-icon">
                                    <font-awesome-icon :icon="step.icon" />
                                </div>
                                <h4 class="step-title">{{ step.title }}</h4>
                                <p class="step-description">{{ step.description }}</p>
                                <el-button type="text" @click="$router.push(step.link)">
                                    {{ step.action }}
                                    <font-awesome-icon :icon="['fas', 'arrow-right']" />
                                </el-button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const featuresSection = ref(null)

const liveStats = ref([
    {
        id: 1,
        icon: ['fas', 'database'],
        value: '2,847',
        label: '生物标记物',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        trend: 'up',
        trendIcon: ['fas', 'arrow-up'],
        change: '+12%'
    },
    {
        id: 2,
        icon: ['fas', 'file-medical'],
        value: '1,256',
        label: '研究文献',
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        trend: 'up',
        trendIcon: ['fas', 'arrow-up'],
        change: '+8%'
    },
    {
        id: 3,
        icon: ['fas', 'users'],
        value: '45.2K',
        label: '活跃用户',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        trend: 'up',
        trendIcon: ['fas', 'arrow-up'],
        change: '+25%'
    },
    {
        id: 4,
        icon: ['fas', 'download'],
        value: '892K',
        label: '数据下载',
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        trend: 'up',
        trendIcon: ['fas', 'arrow-up'],
        change: '+18%'
    }
])

const smartFeatures = ref([
    {
        id: 1,
        title: '高级筛选',
        description: '多维度条件组合，精准定位目标数据',
        icon: ['fas', 'filter'],
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        tags: ['多条件', '实时筛选'],
        link: '/advanced'
    },
    {
        id: 2,
        title: '可视化分析',
        description: '交互式图表，直观展示数据关系',
        icon: ['fas', 'chart-pie'],
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        tags: ['交互图表', '数据可视化'],
        link: '/explore'
    },
    {
        id: 3,
        title: '批量导出',
        description: '支持多种格式，满足不同研究需求',
        icon: ['fas', 'file-export'],
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        tags: ['多格式', '批量处理'],
        link: '/download'
    },
    {
        id: 4,
        title: '数据提交',
        description: '便捷的数据上传和标准化处理',
        icon: ['fas', 'cloud-upload-alt'],
        color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        tags: ['标准化', '质量控制'],
        link: '/submission'
    }
])

const dataHighlights = ref([
    {
        id: 1,
        icon: ['fas', 'microscope'],
        title: '精准识别',
        description: '99.2%的标记物识别准确率'
    },
    {
        id: 2,
        icon: ['fas', 'clock'],
        title: '实时更新',
        description: '每日自动同步最新研究数据'
    },
    {
        id: 3,
        icon: ['fas', 'shield-alt'],
        title: '数据安全',
        description: '企业级安全保障和隐私保护'
    }
])

const chartData = ref([
    { label: '蛋白质', value: 1245, percentage: 85, color: '#667eea' },
    { label: '基因', value: 892, percentage: 65, color: '#f093fb' },
    { label: 'microRNA', value: 456, percentage: 45, color: '#4facfe' },
    { label: '代谢物', value: 254, percentage: 25, color: '#43e97b' }
])

const quickStartSteps = ref([
    {
        id: 1,
        title: '浏览数据库',
        description: '探索我们收录的所有生物标记物',
        icon: ['fas', 'search'],
        action: '开始浏览',
        link: '/biomarkers'
    },
    {
        id: 2,
        title: '高级搜索',
        description: '使用多种条件精确查找所需数据',
        icon: ['fas', 'sliders-h'],
        action: '高级搜索',
        link: '/advanced'
    },
    {
        id: 3,
        title: '数据分析',
        description: '利用可视化工具深入分析数据',
        icon: ['fas', 'chart-bar'],
        action: '开始分析',
        link: '/explore'
    },
    {
        id: 4,
        title: '导出结果',
        description: '下载分析结果用于进一步研究',
        icon: ['fas', 'download'],
        action: '导出数据',
        link: '/download'
    }
])

const dataNodes = ref([
    { id: 1, icon: ['fas', 'dna'], type: 'primary', style: { top: '20%', left: '15%' } },
    { id: 2, icon: ['fas', 'atom'], type: 'secondary', style: { top: '40%', left: '35%' } },
    { id: 3, icon: ['fas', 'flask'], type: 'accent', style: { top: '60%', left: '20%' } },
    { id: 4, icon: ['fas', 'microscope'], type: 'primary', style: { top: '30%', left: '70%' } },
    { id: 5, icon: ['fas', 'code-branch'], type: 'secondary', style: { top: '70%', left: '60%' } }
])

const connectionLines = ref([
    { id: 1, path: 'M60 60 Q200 100 280 120', class: 'connection-1' },
    { id: 2, path: 'M140 120 Q200 150 240 180', class: 'connection-2' },
    { id: 3, path: 'M80 180 Q150 200 280 120', class: 'connection-3' }
])

const getFloatStyle = (index) => {
    const positions = [
        { top: '10%', left: '10%' },
        { top: '20%', right: '15%' },
        { top: '60%', left: '5%' },
        { top: '70%', right: '10%' },
        { top: '30%', left: '50%' },
        { top: '80%', left: '30%' },
        { top: '15%', left: '70%' },
        { top: '50%', right: '5%' }
    ]
    return {
        ...positions[index - 1],
        animationDelay: `${index * 0.5}s`
    }
}

const getRandomIcon = (index) => {
    const icons = [
        ['fas', 'dna'],
        ['fas', 'atom'],
        ['fas', 'flask'],
        ['fas', 'microscope'],
        ['fas', 'code-branch'],
        ['fas', 'chart-line'],
        ['fas', 'database'],
        ['fas', 'brain']
    ]
    return icons[index - 1]
}

const scrollToFeatures = () => {
    featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}

onMounted(() => {
    // 添加一些动画效果
})
</script>

<style scoped>
.home-demo3 {
    min-height: 100vh;
    background: #fafbfc;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.modern-hero {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 120px 20px 80px;
    position: relative;
    overflow: hidden;
}

.hero-background {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0.1;
}

.floating-elements {
    position: relative;
    width: 100%;
    height: 100%;
}

.float-element {
    position: absolute;
    width: 60px;
    height: 60px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    animation: float 6s ease-in-out infinite;
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px) rotate(0deg);
    }

    50% {
        transform: translateY(-20px) rotate(180deg);
    }
}

.hero-content {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    margin-bottom: 1.5rem;
    backdrop-filter: blur(10px);
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1.5rem;
}

.gradient-text {
    background: linear-gradient(45deg, #ffd700, #ffed4e);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}

.hero-subtitle {
    font-size: 1.2rem;
    line-height: 1.7;
    opacity: 0.9;
    margin-bottom: 2.5rem;
}

.hero-buttons {
    display: flex;
    gap: 1rem;
}

.hero-buttons .el-button {
    padding: 12px 24px;
    font-size: 1.1rem;
}

.data-visualization {
    display: flex;
    justify-content: center;
    align-items: center;
}

.viz-container {
    position: relative;
    width: 400px;
    height: 300px;
}

.data-node {
    position: absolute;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2rem;
    animation: pulse 2s ease-in-out infinite;
}

.data-node.primary {
    background: rgba(255, 215, 0, 0.3);
    color: #ffd700;
    border: 2px solid #ffd700;
}

.data-node.secondary {
    background: rgba(255, 255, 255, 0.2);
    color: white;
    border: 2px solid rgba(255, 255, 255, 0.5);
}

.data-node.accent {
    background: rgba(100, 181, 246, 0.3);
    color: #64b5f6;
    border: 2px solid #64b5f6;
}

@keyframes pulse {

    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.1);
    }
}

.connection-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
}

.connection-lines path {
    fill: none;
    stroke: rgba(255, 255, 255, 0.3);
    stroke-width: 2;
    stroke-dasharray: 5, 5;
    animation: dash 3s linear infinite;
}

@keyframes dash {
    to {
        stroke-dashoffset: -10;
    }
}

.live-stats {
    padding: 40px 20px;
    background: white;
    margin-top: -40px;
    position: relative;
    z-index: 2;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
}

.stat-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1.5rem;
    transition: all 0.3s ease;
}

.stat-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.stat-icon {
    width: 60px;
    height: 60px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
}

.stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
}

.stat-label {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
}

.stat-trend {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.8rem;
    font-weight: 600;
}

.stat-trend.up {
    color: #10b981;
}

.smart-features {
    padding: 80px 20px;
    background: #f8fafc;
}

.section-header {
    text-align: center;
    margin-bottom: 4rem;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 1rem;
}

.section-subtitle {
    font-size: 1.1rem;
    color: #64748b;
}

.features-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
}

.feature-card-large {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px;
    padding: 3rem;
    color: white;
    position: relative;
    overflow: hidden;
}

.feature-card-large::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
    animation: rotate 10s linear infinite;
}

@keyframes rotate {
    0% {
        transform: rotate(0deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.card-content {
    position: relative;
    z-index: 1;
}

.card-header {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 2rem;
}

.card-icon.primary {
    width: 70px;
    height: 70px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
}

.card-title h3 {
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
}

.card-title p {
    opacity: 0.9;
}

.card-features {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
}

.feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    font-size: 1.1rem;
}

.card-button {
    background: rgba(255, 255, 255, 0.2);
    border: 2px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 12px 24px;
    border-radius: 12px;
    font-size: 1.1rem;
    transition: all 0.3s ease;
}

.card-button:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
}

.feature-cards-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.feature-card {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    border-color: #667eea;
}

.feature-card .card-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    margin-bottom: 1.5rem;
}

.feature-card .card-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
}

.card-description {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.card-tags {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.tag {
    background: #f1f5f9;
    color: #475569;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.data-insights {
    padding: 80px 20px;
    background: white;
}

.insights-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.insights-description {
    font-size: 1.1rem;
    color: #64748b;
    line-height: 1.8;
    margin-bottom: 2rem;
}

.insight-highlights {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.highlight-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.highlight-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.highlight-content h4 {
    color: #1e293b;
    margin-bottom: 0.5rem;
}

.highlight-content p {
    color: #64748b;
    font-size: 0.9rem;
}

.chart-container {
    background: white;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.chart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.chart-header h4 {
    color: #1e293b;
    font-size: 1.2rem;
}

.chart-controls .el-button {
    margin-left: 0.5rem;
}

.chart-bars {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.bar-item {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.bar-label {
    min-width: 80px;
    font-size: 0.9rem;
    color: #64748b;
}

.bar-container {
    flex: 1;
    height: 8px;
    background: #f1f5f9;
    border-radius: 4px;
    overflow: hidden;
}

.bar-fill {
    height: 100%;
    border-radius: 4px;
    transition: width 0.8s ease;
}

.bar-value {
    min-width: 60px;
    text-align: right;
    font-weight: 600;
    color: #1e293b;
}

.quick-start {
    padding: 80px 20px;
    background: #f8fafc;
}

.quick-start-content {
    text-align: center;
}

.steps-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
}

.step-card {
    background: white;
    border-radius: 16px;
    padding: 2.5rem 2rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    position: relative;
    transition: all 0.3s ease;
}

.step-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
}

.step-number {
    position: absolute;
    top: -15px;
    left: 50%;
    transform: translateX(-50%);
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.9rem;
}

.step-content {
    text-align: center;
}

.step-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    margin: 0 auto 1.5rem;
}

.step-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 1rem;
}

.step-description {
    color: #64748b;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
        gap: 2rem;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .features-container {
        grid-template-columns: 1fr;
    }

    .feature-cards-grid {
        grid-template-columns: 1fr;
    }

    .insights-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .steps-container {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 480px) {
    .hero-title {
        font-size: 2rem;
    }

    .hero-buttons {
        flex-direction: column;
        align-items: center;
    }

    .stat-card {
        flex-direction: column;
        text-align: center;
    }
}
</style>
