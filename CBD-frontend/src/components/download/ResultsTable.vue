<template>
    <el-card class="summary-card">
        <template #header>
            <div class="summary-header">
                <div class="summary-info">
                    <h3 class="summary-title">Filter Results</h3>
                    <p class="summary-subtitle">
                        Found <span class="highlight">{{ filteredRecords }}</span> matching records
                    </p>
                </div>
                <div class="summary-actions">
                    <el-button @click="$emit('refresh')" :loading="loading">
                        <font-awesome-icon :icon="['fas', 'sync-alt']" />
                        Refresh Data
                    </el-button>
                </div>
            </div>
        </template>

        <!-- Data Preview Table -->
        <div class="preview-section">
            <div class="preview-header">
                <h4 class="preview-title">Data Preview</h4>
                <div class="preview-controls">
                    <el-select :model-value="pageSize" @change="$emit('pageSizeChange', $event)" size="small">
                        <el-option label="10 per page" :value="10" />
                        <el-option label="20 per page" :value="20" />
                        <el-option label="50 per page" :value="50" />
                    </el-select>
                </div>
            </div>

            <div class="table-container">
                <el-table :data="previewData" class="preview-table" v-loading="loading" max-height="400" stripe>
                    <el-table-column prop="Biomarker" label="Biomarker" min-width="120" fixed="left"
                        show-overflow-tooltip />
                    <el-table-column prop="Category" label="Category" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="Application" label="Application" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="Location" label="Location" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="Source" label="Source" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="Reference_first_author" label="First Author" min-width="120"
                        show-overflow-tooltip />
                    <el-table-column prop="Reference_journal" label="Journal" min-width="120" show-overflow-tooltip />
                    <el-table-column prop="Reference_year" label="Year" min-width="80" show-overflow-tooltip />
                    <el-table-column prop="Region" label="Region" min-width="100" show-overflow-tooltip />
                    <el-table-column prop="Stage" label="Stage" min-width="100" show-overflow-tooltip />
                </el-table>
            </div>

            <div class="preview-pagination">
                <el-pagination :current-page="currentPage" :page-size="pageSize" :total="filteredRecords"
                    layout="prev, pager, next, jumper" @current-change="$emit('pageChange', $event)" small />
            </div>
        </div>
    </el-card>
</template>

<script setup>
const props = defineProps({
    filteredRecords: Number,
    previewData: Array,
    loading: Boolean,
    currentPage: Number,
    pageSize: Number
})

const emit = defineEmits(['refresh', 'pageSizeChange', 'pageChange'])
</script>

<style scoped>
.summary-card {
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
}

.summary-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.summary-title {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.summary-subtitle {
    color: #666;
    margin: 5px 0 0 0;
    font-size: 0.9rem;
}

.highlight {
    color: #667eea;
    font-weight: 600;
}

.preview-section {
    margin-top: 20px;
}

.preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.preview-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.preview-table {
    border-radius: 8px;
    overflow: hidden;
}

.preview-pagination {
    display: flex;
    justify-content: center;
    margin-top: 15px;
}

@media (max-width: 768px) {
    .summary-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 15px;
    }
}
</style>