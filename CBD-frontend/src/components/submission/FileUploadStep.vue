<template>
    <div class="file-upload-step">
        <div class="step-header">
            <h3>文件上传</h3>
            <p class="step-description">请上传您的数据文件和相关文档</p>
        </div>

        <div class="upload-sections">
            <!-- 数据文件上传 -->
            <div class="upload-section">
                <h4>
                    <font-awesome-icon icon="database" class="section-icon" />
                    数据文件
                </h4>
                <p class="section-description">支持格式：CSV, Excel, TSV, JSON</p>

                <el-upload class="upload-dragger" drag :action="uploadUrl" :on-success="handleDataFileSuccess"
                    :on-error="handleUploadError" :before-upload="beforeDataFileUpload" :file-list="dataFiles" multiple>
                    <font-awesome-icon icon="cloud-upload-alt" class="upload-icon" />
                    <div class="el-upload__text">
                        将文件拖到此处，或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            文件大小不超过100MB，支持批量上传
                        </div>
                    </template>
                </el-upload>
            </div>

            <!-- 文档上传 -->
            <div class="upload-section">
                <h4>
                    <font-awesome-icon icon="file-alt" class="section-icon" />
                    相关文档
                </h4>
                <p class="section-description">研究论文、实验协议、数据说明等</p>

                <el-upload class="upload-dragger" drag :action="uploadUrl" :on-success="handleDocumentSuccess"
                    :on-error="handleUploadError" :before-upload="beforeDocumentUpload" :file-list="documents" multiple>
                    <font-awesome-icon icon="file-upload" class="upload-icon" />
                    <div class="el-upload__text">
                        将文档拖到此处，或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            支持PDF、Word、PowerPoint等格式，单个文件不超过50MB
                        </div>
                    </template>
                </el-upload>
            </div>

            <!-- 图片上传 -->
            <div class="upload-section">
                <h4>
                    <font-awesome-icon icon="image" class="section-icon" />
                    图表图片
                </h4>
                <p class="section-description">实验结果图、流程图、示意图等</p>

                <el-upload class="upload-dragger" drag :action="uploadUrl" :on-success="handleImageSuccess"
                    :on-error="handleUploadError" :before-upload="beforeImageUpload" :file-list="images" multiple
                    list-type="picture">
                    <font-awesome-icon icon="camera" class="upload-icon" />
                    <div class="el-upload__text">
                        将图片拖到此处，或<em>点击上传</em>
                    </div>
                    <template #tip>
                        <div class="el-upload__tip">
                            支持JPG、PNG、GIF格式，单个文件不超过10MB
                        </div>
                    </template>
                </el-upload>
            </div>
        </div>

        <!-- 上传进度 -->
        <div v-if="uploadProgress > 0" class="upload-progress">
            <h4>上传进度</h4>
            <el-progress :percentage="uploadProgress" :status="uploadStatus" :stroke-width="8" />
            <p class="progress-text">{{ progressText }}</p>
        </div>

        <!-- 已上传文件列表 -->
        <div v-if="hasUploadedFiles" class="uploaded-files">
            <h4>已上传文件</h4>
            <div class="file-categories">
                <div v-if="dataFiles.length > 0" class="file-category">
                    <h5>数据文件 ({{ dataFiles.length }})</h5>
                    <div class="file-list">
                        <div v-for="file in dataFiles" :key="file.uid" class="file-item">
                            <font-awesome-icon icon="database" class="file-icon" />
                            <span class="file-name">{{ file.name }}</span>
                            <span class="file-size">{{ formatFileSize(file.size) }}</span>
                            <el-button type="danger" size="small" text @click="removeFile(file, 'data')">
                                <font-awesome-icon icon="trash" />
                            </el-button>
                        </div>
                    </div>
                </div>

                <div v-if="documents.length > 0" class="file-category">
                    <h5>文档 ({{ documents.length }})</h5>
                    <div class="file-list">
                        <div v-for="file in documents" :key="file.uid" class="file-item">
                            <font-awesome-icon icon="file-alt" class="file-icon" />
                            <span class="file-name">{{ file.name }}</span>
                            <span class="file-size">{{ formatFileSize(file.size) }}</span>
                            <el-button type="danger" size="small" text @click="removeFile(file, 'document')">
                                <font-awesome-icon icon="trash" />
                            </el-button>
                        </div>
                    </div>
                </div>

                <div v-if="images.length > 0" class="file-category">
                    <h5>图片 ({{ images.length }})</h5>
                    <div class="file-list">
                        <div v-for="file in images" :key="file.uid" class="file-item">
                            <font-awesome-icon icon="image" class="file-icon" />
                            <span class="file-name">{{ file.name }}</span>
                            <span class="file-size">{{ formatFileSize(file.size) }}</span>
                            <el-button type="danger" size="small" text @click="removeFile(file, 'image')">
                                <font-awesome-icon icon="trash" />
                            </el-button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

// 上传相关数据
const uploadUrl = ref('/api/upload')
const dataFiles = ref([])
const documents = ref([])
const images = ref([])
const uploadProgress = ref(0)
const uploadStatus = ref('')
const progressText = ref('')

// 计算属性
const hasUploadedFiles = computed(() => {
    return dataFiles.value.length > 0 || documents.value.length > 0 || images.value.length > 0
})

// 文件上传前检查
const beforeDataFileUpload = (file) => {
    const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/tab-separated-values',
        'application/json'
    ]

    const isAllowedType = allowedTypes.includes(file.type) ||
        file.name.endsWith('.csv') ||
        file.name.endsWith('.xlsx') ||
        file.name.endsWith('.xls') ||
        file.name.endsWith('.tsv') ||
        file.name.endsWith('.json')

    const isLt100M = file.size / 1024 / 1024 < 100

    if (!isAllowedType) {
        ElMessage.error('数据文件格式不正确！请上传CSV、Excel、TSV或JSON格式的文件')
        return false
    }
    if (!isLt100M) {
        ElMessage.error('数据文件大小不能超过100MB！')
        return false
    }
    return true
}

const beforeDocumentUpload = (file) => {
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]

    const isAllowedType = allowedTypes.includes(file.type) ||
        file.name.endsWith('.pdf') ||
        file.name.endsWith('.doc') ||
        file.name.endsWith('.docx') ||
        file.name.endsWith('.ppt') ||
        file.name.endsWith('.pptx')

    const isLt50M = file.size / 1024 / 1024 < 50

    if (!isAllowedType) {
        ElMessage.error('文档格式不正确！请上传PDF、Word或PowerPoint格式的文件')
        return false
    }
    if (!isLt50M) {
        ElMessage.error('文档大小不能超过50MB！')
        return false
    }
    return true
}

const beforeImageUpload = (file) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    const isAllowedType = allowedTypes.includes(file.type)
    const isLt10M = file.size / 1024 / 1024 < 10

    if (!isAllowedType) {
        ElMessage.error('图片格式不正确！请上传JPG、PNG或GIF格式的图片')
        return false
    }
    if (!isLt10M) {
        ElMessage.error('图片大小不能超过10MB！')
        return false
    }
    return true
}

// 上传成功处理
const handleDataFileSuccess = (response, file) => {
    ElMessage.success('数据文件上传成功！')
    dataFiles.value.push(file)
}

const handleDocumentSuccess = (response, file) => {
    ElMessage.success('文档上传成功！')
    documents.value.push(file)
}

const handleImageSuccess = (response, file) => {
    ElMessage.success('图片上传成功！')
    images.value.push(file)
}

// 上传错误处理
const handleUploadError = (error) => {
    ElMessage.error('文件上传失败，请重试！')
    console.error('Upload error:', error)
}

// 移除文件
const removeFile = (file, type) => {
    switch (type) {
        case 'data':
            const dataIndex = dataFiles.value.findIndex(f => f.uid === file.uid)
            if (dataIndex > -1) {
                dataFiles.value.splice(dataIndex, 1)
            }
            break
        case 'document':
            const docIndex = documents.value.findIndex(f => f.uid === file.uid)
            if (docIndex > -1) {
                documents.value.splice(docIndex, 1)
            }
            break
        case 'image':
            const imgIndex = images.value.findIndex(f => f.uid === file.uid)
            if (imgIndex > -1) {
                images.value.splice(imgIndex, 1)
            }
            break
    }
    ElMessage.success('文件已移除')
}

// 格式化文件大小
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// 暴露给父组件的方法
defineExpose({
    dataFiles,
    documents,
    images,
    hasUploadedFiles
})
</script>

<style scoped>
.file-upload-step {
    max-width: 800px;
    margin: 0 auto;
}

.step-header {
    text-align: center;
    margin-bottom: 2rem;
}

.step-header h3 {
    color: #2c3e50;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
}

.step-description {
    color: #7f8c8d;
    font-size: 1rem;
}

.upload-sections {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.upload-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #e9ecef;
}

.upload-section h4 {
    color: #2c3e50;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-icon {
    color: #3498db;
}

.section-description {
    color: #6c757d;
    font-size: 0.9rem;
    margin-bottom: 1rem;
}

.upload-dragger {
    width: 100%;
}

.upload-icon {
    font-size: 3rem;
    color: #3498db;
    margin-bottom: 1rem;
}

.upload-progress {
    margin: 2rem 0;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.upload-progress h4 {
    color: #2c3e50;
    margin-bottom: 1rem;
}

.progress-text {
    text-align: center;
    color: #6c757d;
    margin-top: 0.5rem;
}

.uploaded-files {
    margin-top: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.uploaded-files h4 {
    color: #2c3e50;
    margin-bottom: 1rem;
}

.file-categories {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.file-category h5 {
    color: #495057;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #dee2e6;
}

.file-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.file-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 6px;
    border: 1px solid #e9ecef;
}

.file-icon {
    color: #3498db;
    font-size: 1.1rem;
}

.file-name {
    flex: 1;
    color: #2c3e50;
    font-weight: 500;
}

.file-size {
    color: #6c757d;
    font-size: 0.9rem;
}

@media (max-width: 768px) {
    .file-upload-step {
        padding: 0 1rem;
    }

    .upload-section {
        padding: 1rem;
    }

    .file-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .file-name {
        word-break: break-all;
    }
}
</style>