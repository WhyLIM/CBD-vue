<template>
    <section class="quick-search-section">
        <div class="container">
            <h2 v-if="props.showTitle" class="section-title">{{ props.title }}</h2>
            <div class="search-box">
                <el-input v-model="searchQuery" :placeholder="props.placeholder" size="large"
                    @keyup.enter="handleQuickSearch" :loading="searchLoading">
                    <template #prepend>
                        <font-awesome-icon :icon="['fas', 'search']" />
                    </template>
                    <template #append>
                        <el-button type="primary" @click="handleQuickSearch" :loading="searchLoading"
                            class="search-btn">
                            Search
                        </el-button>
                    </template>
                </el-input>
            </div>
            <div class="example-searches">
                <span class="example-label">Examples:</span>
                <el-tag v-for="tag in exampleTags" :key="tag" @click="searchQuery = tag; handleQuickSearch()"
                    class="example-tag">
                    {{ tag }}
                </el-tag>
            </div>
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBiomarkerStore } from '@/stores/biomarker'
import { ElMessage } from 'element-plus'

const router = useRouter()
const biomarkerStore = useBiomarkerStore()

// Props
const props = defineProps({
    title: {
        type: String,
        default: 'Quick Search'
    },
    placeholder: {
        type: String,
        default: 'Enter biomarker name, gene symbol or keywords...'
    },
    showTitle: {
        type: Boolean,
        default: true
    }
})

// 响应式数据
const searchLoading = ref(false)
const searchQuery = ref('')

// 热门搜索标签
const exampleTags = ref(['CEA', 'CA19-9', 'p53', 'KRAS', 'PIK3CA', 'APC'])

// 快速搜索
const handleQuickSearch = async () => {
    if (!searchQuery.value.trim()) {
        ElMessage.warning('Please enter search keywords')
        return
    }

    searchLoading.value = true
    try {
        // 如果有父组件监听search事件，则触发事件
        if (emit) {
            emit('search', searchQuery.value.trim())
        } else {
            // 否则执行默认的搜索逻辑
            await biomarkerStore.searchBiomarkers(searchQuery.value.trim())
            router.push({
                path: '/biomarkers',
                query: { q: searchQuery.value.trim() }
            })
        }
    } catch (error) {
        ElMessage.error('Search failed')
    } finally {
        searchLoading.value = false
    }
}

// 定义emit事件
const emit = defineEmits(['search'])

// 暴露方法给父组件
defineExpose({
    handleQuickSearch,
    searchQuery
})
</script>

<style scoped>
.quick-search-section {
    padding: 60px 20px;
    background: #f8f9fa;
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

.search-box {
    max-width: 600px;
    margin: 0 auto 2rem;
}

.search-box :deep(.el-input__inner) {
    height: 60px;
    font-size: 1.1rem;
}

.search-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: white !important;
    background: var(--primary-light) !important;
    height: -webkit-fill-available;
}

.search-btn:hover {
    background: var(--primary-color) !important;
}

.example-searches {
    text-align: center;
}

.example-label {
    color: #666;
    margin-right: 1rem;
    font-weight: 500;
}

.example-tag {
    margin: 0 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
}

.example-tag:hover {
    background: #1e3c72;
    color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .quick-search-section {
        padding: 40px 15px;
    }

    .section-title {
        font-size: 2rem;
        margin-bottom: 2rem;
    }

    .search-box {
        margin-bottom: 1.5rem;
    }

    .search-box :deep(.el-input__inner) {
        height: 50px;
        font-size: 1rem;
    }

    .example-searches {
        flex-direction: column;
        gap: 1rem;
    }

    .example-tag {
        margin: 0.25rem;
    }
}

@media (max-width: 480px) {
    .section-title {
        font-size: 1.8rem;
    }

    .search-box :deep(.el-input__inner) {
        height: 45px;
    }
}
</style>