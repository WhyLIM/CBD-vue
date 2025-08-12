<template>
    <div class="guidelines-section">
        <div class="container">
            <div class="section-header">
                <h2 class="section-title">
                    <font-awesome-icon :icon="['fas', 'book']" class="title-icon" />
                    提交指南
                </h2>
                <p class="section-subtitle">请仔细阅读以下指南，确保您的数据符合提交要求</p>
            </div>

            <div class="guidelines-grid">
                <div v-for="guideline in guidelines" :key="guideline.id" class="guideline-card">
                    <div class="guideline-icon">
                        <font-awesome-icon :icon="guideline.icon" />
                    </div>
                    <div class="guideline-content">
                        <h3 class="guideline-title">{{ guideline.title }}</h3>
                        <p class="guideline-description">{{ guideline.description }}</p>
                        <ul class="guideline-points">
                            <li v-for="point in guideline.points" :key="point">{{ point }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const guidelines = ref([
    {
        id: 1,
        title: '数据质量要求',
        icon: ['fas', 'star'],
        description: '确保提交的数据具有高质量和可靠性',
        points: [
            '数据来源可靠，有明确的实验设计',
            '样本量充足，统计学意义显著',
            '检测方法标准化，结果可重现',
            '包含必要的统计学指标'
        ]
    },
    {
        id: 2,
        title: '文件格式规范',
        icon: ['fas', 'file-alt'],
        description: '按照标准格式整理和提交数据文件',
        points: [
            '数据文件使用Excel或CSV格式',
            '包含完整的变量说明和单位',
            '文件命名清晰，便于识别',
            '如有图表，请使用高分辨率格式'
        ]
    },
    {
        id: 3,
        title: '伦理合规要求',
        icon: ['fas', 'shield-alt'],
        description: '确保研究符合伦理规范和法律要求',
        points: [
            '获得伦理委员会批准',
            '患者知情同意',
            '数据去标识化处理',
            '遵守相关法律法规'
        ]
    },
    {
        id: 4,
        title: '文献引用标准',
        icon: ['fas', 'quote-right'],
        description: '提供准确的文献引用和数据来源',
        points: [
            '提供DOI或PMID',
            '引用格式规范',
            '数据来源明确',
            '版权信息完整'
        ]
    }
])
</script>

<style scoped>
.guidelines-section {
    padding: 80px 0;
    background: white;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.section-header {
    text-align: center;
    margin-bottom: 60px;
}

.section-title {
    font-size: 2.5rem;
    font-weight: 700;
    color: #1e3c72;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.title-icon {
    color: #2a5298;
}

.section-subtitle {
    font-size: 1.1rem;
    color: #666;
    max-width: 600px;
    margin: 0 auto;
}

.guidelines-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
}

.guideline-card {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border: 1px solid #e8ecf4;
    transition: all 0.3s ease;
}

.guideline-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
}

.guideline-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
    color: white;
    font-size: 24px;
}

.guideline-title {
    font-size: 1.3rem;
    font-weight: 600;
    color: #1e3c72;
    margin-bottom: 15px;
}

.guideline-description {
    color: #666;
    margin-bottom: 20px;
    line-height: 1.6;
}

.guideline-points {
    list-style: none;
    padding: 0;
}

.guideline-points li {
    padding: 8px 0;
    color: #555;
    position: relative;
    padding-left: 25px;
}

.guideline-points li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: #2a5298;
    font-weight: bold;
}
</style>