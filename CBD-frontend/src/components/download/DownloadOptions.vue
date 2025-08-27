<template>
    <el-card class="download-card">
        <template #header>
            <div class="download-header">
                <h3 class="download-title">
                    <font-awesome-icon :icon="['fas', 'cloud-download-alt']" />
                    Download Options
                </h3>
                <p class="download-subtitle">Select file format and field configuration</p>
            </div>
        </template>

        <div class="download-content">
            <!-- Format Selection -->
            <div class="format-section">
                <h4 class="section-title">File Format</h4>
                <div class="format-options">
                    <div v-for="format in downloadFormats" :key="format.key" class="format-option"
                        :class="{ active: selectedFormat === format.key }" @click="$emit('formatChange', format.key)">
                        <div class="format-icon">
                            <font-awesome-icon :icon="format.icon" />
                        </div>
                        <div class="format-info">
                            <h5 class="format-name">{{ format.name }}</h5>
                            <p class="format-desc">{{ format.description }}</p>
                        </div>
                        <div class="format-check">
                            <font-awesome-icon :icon="['fas', 'check-circle']" v-if="selectedFormat === format.key" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Field Selection -->
            <div class="fields-section">
                <div class="fields-header">
                    <h4 class="section-title">Field Selection</h4>
                    <div class="field-actions">
                        <el-button size="small" @click="$emit('selectAllFields')">Select All</el-button>
                        <el-button size="small" @click="$emit('selectNoneFields')">Select None</el-button>
                        <el-button size="small" @click="$emit('selectEssentialFields')">Essential Only</el-button>
                    </div>
                </div>

                <div class="fields-grid">
                    <el-checkbox v-for="field in availableFields" :key="field.key"
                        :model-value="selectedFields.includes(field.key)" :label="field.key" class="field-checkbox"
                        @change="handleFieldChange(field.key, $event)">
                        <div class="field-info">
                            <span class="field-name">{{ field.name }}</span>
                            <span class="field-desc">{{ field.description }}</span>
                        </div>
                    </el-checkbox>
                </div>
            </div>

            <!-- Download Actions -->
            <div class="download-actions">
                <div class="download-info-text">
                    <font-awesome-icon :icon="['fas', 'info-circle']" />
                    Will download {{ filteredRecords }} records with {{ selectedFields.length }} fields
                </div>
                <div class="download-buttons">
                    <el-button type="primary" size="large" @click="$emit('download')" :loading="downloading"
                        :disabled="selectedFields.length === 0" class="download-btn">
                        <font-awesome-icon :icon="['fas', 'download']" />
                        Download Now ({{ formatFileSize(estimatedSize) }})
                    </el-button>
                </div>
            </div>
        </div>
    </el-card>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    selectedFormat: String,
    selectedFields: Array,
    availableFields: Array,
    downloadFormats: Array,
    filteredRecords: Number,
    downloading: Boolean
})

const emit = defineEmits(['formatChange', 'fieldsChange', 'selectAllFields', 'selectNoneFields', 'selectEssentialFields', 'download'])

const estimatedSize = computed(() => {
    const avgRowSize = 200 // bytes per row
    return props.filteredRecords * avgRowSize * props.selectedFields.length / props.availableFields.length
})

const handleFieldChange = (fieldKey, checked) => {
    let newFields = [...props.selectedFields]
    if (checked) {
        if (!newFields.includes(fieldKey)) {
            newFields.push(fieldKey)
        }
    } else {
        newFields = newFields.filter(field => field !== fieldKey)
    }
    emit('fieldsChange', newFields)
}

const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.download-card {
    border: none;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border-radius: 12px;
}

.download-header {
    margin-bottom: 20px;
}

.download-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 5px 0;
}

.download-subtitle {
    color: #666;
    margin: 0;
    font-size: 0.9rem;
}

.section-title {
    font-size: 1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 15px 0;
}

.format-section {
    margin-bottom: 30px;
}

.format-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 15px;
}

.format-option {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 15px;
    border: 2px solid #e9ecef;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.format-option:hover {
    border-color: #667eea;
    background: #f8fbff;
}

.format-option.active {
    border-color: #667eea;
    background: linear-gradient(135deg, #f8fbff 0%, #e3f2fd 100%);
}

.format-icon {
    font-size: 1.5rem;
    color: #667eea;
}

.format-info {
    flex: 1;
}

.format-name {
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 5px 0;
}

.format-desc {
    color: #666;
    font-size: 0.8rem;
    margin: 0;
}

.format-check {
    color: #667eea;
    font-size: 1.2rem;
}

.fields-section {
    margin-bottom: 30px;
}

.fields-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.field-actions {
    display: flex;
    gap: 8px;
}

.fields-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    max-height: 300px;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    background: #fafafa;
}

.field-checkbox {
    margin: 0;
}

.field-info {
    display: flex;
    flex-direction: column;
    margin-left: 8px;
}

.field-name {
    font-weight: 500;
    color: #2c3e50;
    font-size: 0.9rem;
}

.field-desc {
    color: #666;
    font-size: 0.8rem;
}

.download-actions {
    display: flex;
    flex-direction: column;
    gap: 15px;
    align-items: center;
}

.download-info-text {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #666;
    font-size: 0.9rem;
}

.download-buttons {
    width: 100%;
    display: flex;
    justify-content: center;
}

.download-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    color: white;
    padding: 12px 30px;
    font-size: 1rem;
    font-weight: 600;
}

.download-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
}

@media (max-width: 768px) {
    .format-options {
        grid-template-columns: 1fr;
    }

    .fields-grid {
        grid-template-columns: 1fr;
    }

    .fields-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }

    .field-actions {
        width: 100%;
        justify-content: space-between;
    }
}
</style>