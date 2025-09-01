<template>
    <div class="home-demo1">
        <!-- Hero区域 - 现代简约风格 -->
        <section class="hero-section">
            <div class="hero-content">
                <div class="hero-text">
                    <h1 class="hero-title">
                        <span class="highlight">CBD3</span> 生物标记物数据库
                    </h1>
                    <p class="hero-subtitle">
                        探索结直肠癌生物标记物的综合数据平台，为精准医疗提供科学依据
                    </p>
                    <div class="hero-stats">
                        <div class="stat-item">
                            <div class="stat-number">2,847</div>
                            <div class="stat-label">生物标记物</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">1,256</div>
                            <div class="stat-label">研究文献</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">89</div>
                            <div class="stat-label">数据来源</div>
                        </div>
                    </div>
                    <div class="hero-actions">
                        <el-button type="primary" size="large" @click="$router.push('/biomarkers')">
                            <font-awesome-icon :icon="['fas', 'search']" />
                            开始探索
                        </el-button>
                        <el-button size="large" @click="$router.push('/about')">
                            <font-awesome-icon :icon="['fas', 'info-circle']" />
                            了解更多
                        </el-button>
                    </div>
                </div>
                <div class="hero-visual">
                    <div class="dna-helix">
                        <div class="helix-strand strand-1"></div>
                        <div class="helix-strand strand-2"></div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 快速搜索区域 -->
        <section class="quick-search">
            <div class="container">
                <h2 class="section-title">快速搜索</h2>
                <div class="search-box">
                    <el-input v-model="searchQuery" placeholder="输入生物标记物名称、基因符号或关键词..." size="large"
                        @keyup.enter="handleSearch">
                        <template #prepend>
                            <font-awesome-icon :icon="['fas', 'search']" />
                        </template>
                        <template #append>
                            <el-button type="primary" @click="handleSearch">搜索</el-button>
                        </template>
                    </el-input>
                </div>
                <div class="popular-searches">
                    <span class="popular-label">热门搜索：</span>
                    <el-tag v-for="tag in popularTags" :key="tag" @click="searchQuery = tag; handleSearch()"
                        class="popular-tag">
                        {{ tag }}
                    </el-tag>
                </div>
            </div>
        </section>

        <!-- 核心功能区域 -->
        <section class="features-section">
            <div class="container">
                <h2 class="section-title">核心功能</h2>
                <div class="features-grid">
                    <div class="feature-card" v-for="feature in features" :key="feature.id">
                        <div class="feature-icon">
                            <font-awesome-icon :icon="feature.icon" />
                        </div>
                        <h3 class="feature-title">{{ feature.title }}</h3>
                        <p class="feature-description">{{ feature.description }}</p>
                        <el-button type="text" @click="$router.push(feature.link)">
                            了解更多 <font-awesome-icon :icon="['fas', 'arrow-right']" />
                        </el-button>
                    </div>
                </div>
            </div>
        </section>

        <!-- 数据概览 -->
        <section class="data-overview">
            <div class="container">
                <div class="overview-content">
                    <div class="overview-text">
                        <h2 class="section-title">数据概览</h2>
                        <p class="overview-description">
                            我们的数据库汇集了来自全球顶级期刊的结直肠癌生物标记物研究成果，
                            为研究人员和临床医生提供最全面、最权威的数据支持。
                        </p>
                        <div class="data-categories">
                            <div class="category-item" v-for="category in dataCategories" :key="category.name">
                                <div class="category-icon">
                                    <font-awesome-icon :icon="category.icon" />
                                </div>
                                <div class="category-info">
                                    <div class="category-name">{{ category.name }}</div>
                                    <div class="category-count">{{ category.count }}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="overview-chart">
                        <div class="chart-placeholder">
                            <font-awesome-icon :icon="['fas', 'chart-pie']" />
                            <span>数据分布图表</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const searchQuery = ref('')

const popularTags = ref(['CEA', 'CA19-9', 'p53', 'KRAS', 'PIK3CA', 'APC'])

const features = ref([
    {
        id: 1,
        title: '生物标记物浏览',
        description: '浏览和搜索我们收录的所有结直肠癌生物标记物',
        icon: ['fas', 'microscope'],
        link: '/biomarkers'
    },
    {
        id: 2,
        title: '高级搜索',
        description: '使用多种筛选条件进行精确的数据检索',
        icon: ['fas', 'filter'],
        link: '/advanced'
    },
    {
        id: 3,
        title: '数据探索',
        description: '通过可视化工具深入分析生物标记物数据',
        icon: ['fas', 'chart-line'],
        link: '/explore'
    },
    {
        id: 4,
        title: '数据下载',
        description: '下载符合条件的数据集用于进一步研究',
        icon: ['fas', 'download'],
        link: '/download'
    }
])

const dataCategories = ref([
    { name: '蛋白质', count: '1,245', icon: ['fas', 'atom'] },
    { name: '基因', count: '892', icon: ['fas', 'dna'] },
    { name: 'microRNA', count: '456', icon: ['fas', 'code-branch'] },
    { name: '代谢物', count: '254', icon: ['fas', 'flask'] }
])

const handleSearch = () => {
    if (searchQuery.value.trim()) {
        router.push(`/biomarkers?q=${encodeURIComponent(searchQuery.value)}`)
    }
}
</script>

<style scoped>
.home-demo1 {
    min-height: 100vh;
}

.hero-section {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 80px 20px;
    position: relative;
    overflow: hidden;
}

.hero-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
}

.hero-title {
    font-size: 3.5rem;
    font-weight: 700;
    margin-bottom: 1.5rem;
    line-height: 1.2;
}

.highlight {
    color: #ffd700;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

.hero-subtitle {
    font-size: 1.3rem;
    margin-bottom: 2rem;
    opacity: 0.9;
    line-height: 1.6;
}

.hero-stats {
    display: flex;
    gap: 2rem;
    margin-bottom: 2.5rem;
}

.stat-item {
    text-align: center;
}

.stat-number {
    font-size: 2.5rem;
    font-weight: 700;
    color: #ffd700;
}

.stat-label {
    font-size: 0.9rem;
    opacity: 0.8;
}

.hero-actions {
    display: flex;
    gap: 1rem;
}

.hero-actions .el-button {
    padding: 12px 24px;
    font-size: 1.1rem;
}

.hero-visual {
    display: flex;
    justify-content: center;
    align-items: center;
}

.dna-helix {
    width: 300px;
    height: 400px;
    position: relative;
}

.helix-strand {
    position: absolute;
    width: 100%;
    height: 100%;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    animation: rotate 10s linear infinite;
}

.strand-1 {
    transform: rotateY(0deg);
}

.strand-2 {
    transform: rotateY(60deg);
    animation-delay: -3.33s;
}

@keyframes rotate {
    0% {
        transform: rotateY(0deg) rotateX(0deg);
    }

    100% {
        transform: rotateY(360deg) rotateX(360deg);
    }
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 3rem;
    color: #2c3e50;
}

.quick-search {
    padding: 60px 20px;
    background: #f8f9fa;
}

.search-box {
    max-width: 600px;
    margin: 0 auto 2rem;
}

.search-box :deep(.el-input__inner) {
    height: 60px;
    font-size: 1.1rem;
}

.popular-searches {
    text-align: center;
}

.popular-label {
    color: #666;
    margin-right: 1rem;
}

.popular-tag {
    margin: 0 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.popular-tag:hover {
    background: #667eea;
    color: white;
}

.features-section {
    padding: 80px 20px;
    background: white;
}

.features-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}

.feature-card {
    text-align: center;
    padding: 2.5rem 1.5rem;
    border-radius: 12px;
    background: white;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.feature-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 1.5rem;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 2rem;
}

.feature-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: #2c3e50;
}

.feature-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.data-overview {
    padding: 80px 20px;
    background: #f8f9fa;
}

.overview-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.overview-description {
    font-size: 1.1rem;
    color: #666;
    line-height: 1.8;
    margin-bottom: 2rem;
}

.data-categories {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.category-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.category-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
}

.category-name {
    font-weight: 600;
    color: #2c3e50;
}

.category-count {
    color: #667eea;
    font-weight: 700;
    font-size: 1.1rem;
}

.overview-chart {
    display: flex;
    justify-content: center;
    align-items: center;
}

.chart-placeholder {
    width: 300px;
    height: 300px;
    background: white;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    font-size: 3rem;
    color: #667eea;
}

.chart-placeholder span {
    font-size: 1rem;
    margin-top: 1rem;
    color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .hero-content {
        grid-template-columns: 1fr;
        text-align: center;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .hero-stats {
        justify-content: center;
    }

    .overview-content {
        grid-template-columns: 1fr;
    }

    .data-categories {
        grid-template-columns: 1fr;
    }
}
</style>