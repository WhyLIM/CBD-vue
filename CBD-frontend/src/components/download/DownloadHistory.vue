<template>
    <el-card v-if="downloadHistory.length > 0" class="history-card">
        <template #header>
            <h3 class="history-title">
                <font-awesome-icon :icon="['fas', 'history']" />
                Download History
            </h3>
        </template>
        <div class="history-list">
            <div v-for="item in downloadHistory" :key="item.id" class="history-item">
                <div class="history-info">
                    <h5 class="history-name">{{ item.fileName }}</h5>
                    <p class="history-details">
                        {{ item.recordCount }} records • {{ formatFileSize(item.fileSize) }} • {{
                            formatDate(item.createdAt) }}
                    </p>
                </div>
                <el-button size="small" @click="$emit('redownload', item)">
                    <font-awesome-icon :icon="['fas', 'redo']" />
                    Re-download
                </el-button>
            </div>
        </div>
    </el-card>
</template>

<script setup>
const props = defineProps({
    downloadHistory: Array
})

const emit = defineEmits(['redownload'])

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatDate = (date) => {
    return new Date(date).toLocaleDateString()
}
</script>

<style scoped>
.history-card {
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
}

.history-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.history-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.history-info {
    flex: 1;
}

.history-name {
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 5px 0;
    font-size: 0.9rem;
}

.history-details {
    color: #666;
    font-size: 0.8rem;
    margin: 0;
}
</style>