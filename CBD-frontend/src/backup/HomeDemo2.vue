<template>
    <div class="home-demo2">
        <!-- 学术风格Hero区域 -->
        <section class="academic-hero">
            <div class="container">
                <div class="hero-content">
                    <div class="hero-badge">
                        <font-awesome-icon :icon="['fas', 'graduation-cap']" />
                        <span>学术研究平台</span>
                    </div>
                    <h1 class="hero-title">
                        结直肠癌生物标记物<br>
                        <span class="title-highlight">综合数据库</span>
                    </h1>
                    <p class="hero-description">
                        基于循证医学的生物标记物数据集成平台，汇聚全球权威期刊研究成果，
                        为临床诊断、预后评估和个性化治疗提供科学依据。
                    </p>
                    <div class="research-metrics">
                        <div class="metric-card">
                            <div class="metric-icon">
                                <font-awesome-icon :icon="['fas', 'flask']" />
                            </div>
                            <div class="metric-info">
                                <div class="metric-value">2,847</div>
                                <div class="metric-label">验证标记物</div>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">
                                <font-awesome-icon :icon="['fas', 'file-alt']" />
                            </div>
                            <div class="metric-info">
                                <div class="metric-value">1,256</div>
                                <div class="metric-label">同行评议文献</div>
                            </div>
                        </div>
                        <div class="metric-card">
                            <div class="metric-icon">
                                <font-awesome-icon :icon="['fas', 'university']" />
                            </div>
                            <div class="metric-info">
                                <div class="metric-value">89</div>
                                <div class="metric-label">研究机构</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 研究工具导航 -->
        <section class="research-tools">
            <div class="container">
                <h2 class="section-title">研究工具</h2>
                <div class="tools-grid">
                    <div class="tool-card primary-tool" @click="$router.push('/biomarkers')">
                        <div class="tool-header">
                            <font-awesome-icon :icon="['fas', 'search']" class="tool-icon" />
                            <h3>标记物检索</h3>
                        </div>
                        <p class="tool-description">
                            快速检索和浏览数据库中的所有生物标记物信息
                        </p>
                        <div class="tool-features">
                            <span class="feature-tag">多维度筛选</span>
                            <span class="feature-tag">实时搜索</span>
                        </div>
                    </div>

                    <div class="tool-card" @click="$router.push('/advanced')">
                        <div class="tool-header">
                            <font-awesome-icon :icon="['fas', 'sliders-h']" class="tool-icon" />
                            <h3>高级分析</h3>
                        </div>
                        <p class="tool-description">
                            使用复杂查询条件进行精准的数据挖掘
                        </p>
                        <div class="tool-features">
                            <span class="feature-tag">组合查询</span>
                            <span class="feature-tag">统计分析</span>
                        </div>
                    </div>

                    <div class="tool-card" @click="$router.push('/explore')">
                        <div class="tool-header">
                            <font-awesome-icon :icon="['fas', 'chart-bar']" class="tool-icon" />
                            <h3>数据可视化</h3>
                        </div>
                        <p class="tool-description">
                            通过交互式图表深入理解数据模式和趋势
                        </p>
                        <div class="tool-features">
                            <span class="feature-tag">交互图表</span>
                            <span class="feature-tag">趋势分析</span>
                        </div>
                    </div>

                    <div class="tool-card" @click="$router.push('/download')">
                        <div class="tool-header">
                            <font-awesome-icon :icon="['fas', 'download']" class="tool-icon" />
                            <h3>数据导出</h3>
                        </div>
                        <p class="tool-description">
                            导出标准格式数据用于后续研究分析
                        </p>
                        <div class="tool-features">
                            <span class="feature-tag">多种格式</span>
                            <span class="feature-tag">批量导出</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 最新研究动态 -->
        <section class="research-updates">
            <div class="container">
                <div class="updates-content">
                    <div class="updates-text">
                        <h2 class="section-title">最新研究动态</h2>
                        <div class="update-list">
                            <div class="update-item" v-for="update in recentUpdates" :key="update.id">
                                <div class="update-date">{{ update.date }}</div>
                                <div class="update-content">
                                    <h4 class="update-title">{{ update.title }}</h4>
                                    <p class="update-description">{{ update.description }}</p>
                                    <div class="update-meta">
                                        <span class="update-journal">{{ update.journal }}</span>
                                        <span class="update-impact">IF: {{ update.impact }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <el-button type="primary" @click="$router.push('/updates')">
                            查看更多动态
                            <font-awesome-icon :icon="['fas', 'arrow-right']" />
                        </el-button>
                    </div>
                    <div class="updates-stats">
                        <div class="stats-card">
                            <h3>数据库统计</h3>
                            <div class="stats-grid">
                                <div class="stat-item">
                                    <div class="stat-label">本月新增</div>
                                    <div class="stat-value">156</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">总访问量</div>
                                    <div class="stat-value">45.2K</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">引用次数</div>
                                    <div class="stat-value">2,847</div>
                                </div>
                                <div class="stat-item">
                                    <div class="stat-label">合作机构</div>
                                    <div class="stat-value">89</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- 学术合作 -->
        <section class="academic-collaboration">
            <div class="container">
                <h2 class="section-title">学术合作</h2>
                <div class="collaboration-content">
                    <div class="collaboration-text">
                        <h3>与全球顶尖研究机构合作</h3>
                        <p>
                            我们与世界各地的知名大学、研究院所和医疗机构建立了广泛的合作关系，
                            共同推进结直肠癌生物标记物研究的发展。
                        </p>
                        <div class="collaboration-benefits">
                            <div class="benefit-item">
                                <font-awesome-icon :icon="['fas', 'handshake']" />
                                <span>数据共享</span>
                            </div>
                            <div class="benefit-item">
                                <font-awesome-icon :icon="['fas', 'users']" />
                                <span>学术交流</span>
                            </div>
                            <div class="benefit-item">
                                <font-awesome-icon :icon="['fas', 'lightbulb']" />
                                <span>创新研究</span>
                            </div>
                        </div>
                    </div>
                    <div class="partner-logos">
                        <div class="logo-grid">
                            <div class="partner-logo" v-for="i in 6" :key="i">
                                <font-awesome-icon :icon="['fas', 'university']" />
                                <span>合作机构 {{ i }}</span>
                            </div>
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

const recentUpdates = ref([
    {
        id: 1,
        date: '2024-01-15',
        title: '新发现的结直肠癌早期诊断标记物',
        description: '研究团队发现了三个新的蛋白质标记物，在早期结直肠癌诊断中显示出优异的敏感性和特异性。',
        journal: 'Nature Medicine',
        impact: '87.241'
    },
    {
        id: 2,
        date: '2024-01-10',
        title: 'microRNA在预后评估中的应用',
        description: '最新研究表明，特定的microRNA组合可以有效预测结直肠癌患者的预后和治疗反应。',
        journal: 'Cell',
        impact: '66.850'
    },
    {
        id: 3,
        date: '2024-01-05',
        title: '液体活检技术的突破性进展',
        description: '新的液体活检技术能够检测循环肿瘤DNA中的微小变化，为无创诊断提供了新的可能。',
        journal: 'Science',
        impact: '56.900'
    }
])
</script>

<style scoped>
.home-demo2 {
    min-height: 100vh;
    background: #fafbfc;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.academic-hero {
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    color: white;
    padding: 100px 20px 80px;
    position: relative;
}

.academic-hero::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
}

.hero-content {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
}

.hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: rgba(255, 255, 255, 0.2);
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.9rem;
    margin-bottom: 2rem;
    backdrop-filter: blur(10px);
}

.hero-title {
    font-size: 3.2rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 1.5rem;
}

.title-highlight {
    color: #64b5f6;
    position: relative;
}

.title-highlight::after {
    content: '';
    position: absolute;
    bottom: -5px;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, #64b5f6, #42a5f5);
    border-radius: 2px;
}

.hero-description {
    font-size: 1.2rem;
    line-height: 1.7;
    opacity: 0.9;
    margin-bottom: 3rem;
}

.research-metrics {
    display: flex;
    justify-content: center;
    gap: 2rem;
    flex-wrap: wrap;
}

.metric-card {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 200px;
}

.metric-icon {
    width: 50px;
    height: 50px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: #64b5f6;
}

.metric-label {
    font-size: 0.9rem;
    opacity: 0.8;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 3rem;
    color: #1e3c72;
    position: relative;
}

.section-title::after {
    content: '';
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 60px;
    height: 3px;
    background: linear-gradient(90deg, #1e3c72, #2a5298);
    border-radius: 2px;
}

.research-tools {
    padding: 80px 20px;
    background: white;
}

.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
}

.tool-card {
    background: white;
    border: 2px solid #e3f2fd;
    border-radius: 12px;
    padding: 2rem;
    cursor: pointer;
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
}

.tool-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #1e3c72, #2a5298);
    transform: scaleX(0);
    transition: transform 0.3s ease;
}

.tool-card:hover::before {
    transform: scaleX(1);
}

.tool-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 35px rgba(30, 60, 114, 0.15);
    border-color: #2a5298;
}

.primary-tool {
    border-color: #2a5298;
    background: linear-gradient(135deg, #f8fbff 0%, #e3f2fd 100%);
}

.tool-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
}

.tool-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #1e3c72, #2a5298);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
}

.tool-header h3 {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e3c72;
    margin: 0;
}

.tool-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.tool-features {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
}

.feature-tag {
    background: #e3f2fd;
    color: #1e3c72;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 500;
}

.research-updates {
    padding: 80px 20px;
    background: #f8fbff;
}

.updates-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 4rem;
    align-items: start;
}

.update-list {
    margin-bottom: 2rem;
}

.update-item {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem 0;
    border-bottom: 1px solid #e0e0e0;
}

.update-item:last-child {
    border-bottom: none;
}

.update-date {
    color: #2a5298;
    font-weight: 600;
    font-size: 0.9rem;
    min-width: 80px;
}

.update-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #1e3c72;
    margin-bottom: 0.5rem;
}

.update-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 0.5rem;
}

.update-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.8rem;
}

.update-journal {
    color: #2a5298;
    font-weight: 600;
}

.update-impact {
    color: #666;
}

.stats-card {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
}

.stats-card h3 {
    color: #1e3c72;
    margin-bottom: 1.5rem;
    text-align: center;
}

.stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.stat-item {
    text-align: center;
}

.stat-label {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.5rem;
}

.stat-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2a5298;
}

.academic-collaboration {
    padding: 80px 20px;
    background: white;
}

.collaboration-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
}

.collaboration-text h3 {
    font-size: 1.8rem;
    color: #1e3c72;
    margin-bottom: 1rem;
}

.collaboration-text p {
    color: #666;
    line-height: 1.7;
    margin-bottom: 2rem;
}

.collaboration-benefits {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.benefit-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #1e3c72;
    font-weight: 500;
}

.benefit-item svg {
    color: #2a5298;
}

.logo-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
}

.partner-logo {
    background: #f8fbff;
    border: 2px solid #e3f2fd;
    border-radius: 8px;
    padding: 1.5rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.3s ease;
}

.partner-logo:hover {
    border-color: #2a5298;
    background: white;
    box-shadow: 0 5px 15px rgba(30, 60, 114, 0.1);
}

.partner-logo svg {
    font-size: 2rem;
    color: #2a5298;
}

.partner-logo span {
    font-size: 0.8rem;
    color: #666;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .hero-title {
        font-size: 2.5rem;
    }

    .research-metrics {
        flex-direction: column;
        align-items: center;
    }

    .metric-card {
        min-width: auto;
        width: 100%;
        max-width: 300px;
    }

    .updates-content,
    .collaboration-content {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .logo-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>