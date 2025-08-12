<template>
    <div class="confirmation-step">
        <div class="step-header">
            <h3>确认提交</h3>
            <p class="step-description">请仔细检查您的提交信息，确认无误后点击提交</p>
        </div>

        <div class="confirmation-content">
            <!-- 基本信息确认 -->
            <div class="confirmation-section">
                <h4>
                    <font-awesome-icon icon="user" class="section-icon" />
                    基本信息
                </h4>
                <div class="info-grid">
                    <div class="info-item">
                        <label>研究标题：</label>
                        <span>{{ basicInfo.title || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                        <label>研究类型：</label>
                        <span>{{ basicInfo.type || '未选择' }}</span>
                    </div>
                    <div class="info-item">
                        <label>研究领域：</label>
                        <span>{{ basicInfo.field || '未选择' }}</span>
                    </div>
                    <div class="info-item">
                        <label>主要研究者：</label>
                        <span>{{ basicInfo.researcher || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                        <label>所属机构：</label>
                        <span>{{ basicInfo.institution || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                        <label>联系邮箱：</label>
                        <span>{{ basicInfo.email || '未填写' }}</span>
                    </div>
                </div>
            </div>

            <!-- 数据详情确认 -->
            <div class="confirmation-section">
                <h4>
                    <font-awesome-icon icon="database" class="section-icon" />
                    数据详情
                </h4>
                <div class="info-grid">
                    <div class="info-item">
                        <label>生物标记物类型：</label>
                        <span>{{ dataDetails.biomarkerType || '未选择' }}</span>
                    </div>
                    <div class="info-item">
                        <label>样本类型：</label>
                        <span>{{ dataDetails.sampleType || '未选择' }}</span>
                    </div>
                    <div class="info-item">
                        <label>样本数量：</label>
                        <span>{{ dataDetails.sampleSize || '未填写' }}</span>
                    </div>
                    <div class="info-item">
                        <label>检测方法：</label>
                        <span>{{ dataDetails.method || '未选择' }}</span>
                    </div>
                    <div class="info-item">
                        <label>数据格式：</label>
                        <span>{{ dataDetails.format || '未选择' }}</span>
                    </div>
                    <div class="info-item full-width">
                        <label>研究描述：</label>
                        <span>{{ dataDetails.description || '未填写' }}</span>
                    </div>
                </div>
            </div>

            <!-- 文件上传确认 -->
            <div class="confirmation-section">
                <h4>
                    <font-awesome-icon icon="cloud-upload-alt" class="section-icon" />
                    上传文件
                </h4>
                <div class="file-summary">
                    <div class="file-type-summary">
                        <div class="file-type">
                            <font-awesome-icon icon="database" class="file-icon" />
                            <span class="file-label">数据文件：</span>
                            <span class="file-count">{{ fileInfo.dataFiles?.length || 0 }} 个</span>
                        </div>
                        <div class="file-type">
                            <font-awesome-icon icon="file-alt" class="file-icon" />
                            <span class="file-label">相关文档：</span>
                            <span class="file-count">{{ fileInfo.documents?.length || 0 }} 个</span>
                        </div>
                        <div class="file-type">
                            <font-awesome-icon icon="image" class="file-icon" />
                            <span class="file-label">图表图片：</span>
                            <span class="file-count">{{ fileInfo.images?.length || 0 }} 个</span>
                        </div>
                    </div>

                    <div v-if="hasFiles" class="file-details">
                        <el-collapse>
                            <el-collapse-item v-if="fileInfo.dataFiles?.length > 0" title="数据文件详情" name="data">
                                <div class="file-list">
                                    <div v-for="file in fileInfo.dataFiles" :key="file.uid" class="file-item">
                                        <font-awesome-icon icon="database" class="file-icon" />
                                        <span class="file-name">{{ file.name }}</span>
                                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                    </div>
                                </div>
                            </el-collapse-item>

                            <el-collapse-item v-if="fileInfo.documents?.length > 0" title="文档详情" name="docs">
                                <div class="file-list">
                                    <div v-for="file in fileInfo.documents" :key="file.uid" class="file-item">
                                        <font-awesome-icon icon="file-alt" class="file-icon" />
                                        <span class="file-name">{{ file.name }}</span>
                                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                    </div>
                                </div>
                            </el-collapse-item>

                            <el-collapse-item v-if="fileInfo.images?.length > 0" title="图片详情" name="images">
                                <div class="file-list">
                                    <div v-for="file in fileInfo.images" :key="file.uid" class="file-item">
                                        <font-awesome-icon icon="image" class="file-icon" />
                                        <span class="file-name">{{ file.name }}</span>
                                        <span class="file-size">{{ formatFileSize(file.size) }}</span>
                                    </div>
                                </div>
                            </el-collapse-item>
                        </el-collapse>
                    </div>
                </div>
            </div>

            <!-- 提交协议 -->
            <div class="agreement-section">
                <h4>
                    <font-awesome-icon icon="file-contract" class="section-icon" />
                    提交协议
                </h4>
                <div class="agreement-content">
                    <el-checkbox v-model="agreements.dataAccuracy" size="large">
                        我确认所提交的数据真实、准确、完整
                    </el-checkbox>
                    <el-checkbox v-model="agreements.intellectualProperty" size="large">
                        我确认拥有所提交数据的知识产权或已获得相应授权
                    </el-checkbox>
                    <el-checkbox v-model="agreements.publicSharing" size="large">
                        我同意将数据用于科学研究和公共数据库建设
                    </el-checkbox>
                    <el-checkbox v-model="agreements.termsOfService" size="large">
                        我已阅读并同意
                        <el-link type="primary" @click="showTermsDialog = true">服务条款</el-link>
                        和
                        <el-link type="primary" @click="showPrivacyDialog = true">隐私政策</el-link>
                    </el-checkbox>
                </div>
            </div>

            <!-- 提交状态 -->
            <div v-if="submissionStatus" class="submission-status">
                <el-alert :title="submissionStatus.title" :type="submissionStatus.type"
                    :description="submissionStatus.description" show-icon :closable="false" />
            </div>

            <!-- 提交按钮 -->
            <div class="submit-actions">
                <el-button type="primary" size="large" :loading="isSubmitting" :disabled="!canSubmit"
                    @click="handleSubmit">
                    <font-awesome-icon v-if="!isSubmitting" icon="paper-plane" />
                    {{ isSubmitting ? '提交中...' : '确认提交' }}
                </el-button>
                <p class="submit-note">
                    提交后，您的数据将进入审核流程，我们会在3-5个工作日内处理您的提交
                </p>
            </div>
        </div>

        <!-- 服务条款对话框 -->
        <el-dialog v-model="showTermsDialog" title="服务条款" width="60%" :before-close="handleDialogClose">
            <div class="terms-content">
                <h4>1. 数据提交条款</h4>
                <p>用户提交的数据应当真实、准确、完整，不得包含虚假信息或误导性内容。</p>

                <h4>2. 知识产权</h4>
                <p>用户应确保对所提交的数据拥有合法的知识产权或已获得相应的使用授权。</p>

                <h4>3. 数据使用</h4>
                <p>提交的数据将用于科学研究、数据库建设和学术交流，平台有权对数据进行必要的处理和分析。</p>

                <h4>4. 隐私保护</h4>
                <p>我们承诺保护用户的隐私信息，不会泄露用户的个人敏感信息。</p>

                <h4>5. 免责声明</h4>
                <p>平台对用户提交数据的准确性不承担责任，用户应对其提交的数据负责。</p>
            </div>
            <template #footer>
                <el-button @click="showTermsDialog = false">关闭</el-button>
            </template>
        </el-dialog>

        <!-- 隐私政策对话框 -->
        <el-dialog v-model="showPrivacyDialog" title="隐私政策" width="60%" :before-close="handleDialogClose">
            <div class="privacy-content">
                <h4>1. 信息收集</h4>
                <p>我们收集您主动提供的信息，包括研究数据、联系信息等。</p>

                <h4>2. 信息使用</h4>
                <p>收集的信息用于数据库建设、学术研究和与您的沟通联系。</p>

                <h4>3. 信息保护</h4>
                <p>我们采用适当的技术和管理措施保护您的个人信息安全。</p>

                <h4>4. 信息共享</h4>
                <p>除法律要求外，我们不会向第三方泄露您的个人信息。</p>

                <h4>5. 权利保障</h4>
                <p>您有权查询、更正或删除您的个人信息。</p>
            </div>
            <template #footer>
                <el-button @click="showPrivacyDialog = false">关闭</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// Props
const props = defineProps({
    basicInfo: {
        type: Object,
        default: () => ({})
    },
    dataDetails: {
        type: Object,
        default: () => ({})
    },
    fileInfo: {
        type: Object,
        default: () => ({})
    }
})

// 响应式数据
const agreements = ref({
    dataAccuracy: false,
    intellectualProperty: false,
    publicSharing: false,
    termsOfService: false
})

const isSubmitting = ref(false)
const submissionStatus = ref(null)
const showTermsDialog = ref(false)
const showPrivacyDialog = ref(false)

// 计算属性
const hasFiles = computed(() => {
    return (props.fileInfo.dataFiles?.length > 0) ||
        (props.fileInfo.documents?.length > 0) ||
        (props.fileInfo.images?.length > 0)
})

const canSubmit = computed(() => {
    return agreements.value.dataAccuracy &&
        agreements.value.intellectualProperty &&
        agreements.value.publicSharing &&
        agreements.value.termsOfService &&
        !isSubmitting.value
})

// 方法
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const handleDialogClose = (done) => {
    done()
}

const handleSubmit = async () => {
    try {
        // 最终确认
        await ElMessageBox.confirm(
            '确认提交您的研究数据？提交后将无法修改。',
            '确认提交',
            {
                confirmButtonText: '确认提交',
                cancelButtonText: '取消',
                type: 'warning'
            }
        )

        isSubmitting.value = true
        submissionStatus.value = {
            title: '正在提交...',
            type: 'info',
            description: '请稍候，正在处理您的提交'
        }

        // 模拟提交过程
        await new Promise(resolve => setTimeout(resolve, 2000))

        // 构建提交数据
        const submissionData = {
            basicInfo: props.basicInfo,
            dataDetails: props.dataDetails,
            files: {
                dataFiles: props.fileInfo.dataFiles || [],
                documents: props.fileInfo.documents || [],
                images: props.fileInfo.images || []
            },
            agreements: agreements.value,
            submittedAt: new Date().toISOString()
        }

        // 这里应该调用实际的API
        console.log('提交数据:', submissionData)

        // 提交成功
        submissionStatus.value = {
            title: '提交成功！',
            type: 'success',
            description: '您的数据已成功提交，我们会在3-5个工作日内处理您的提交并发送确认邮件'
        }

        ElMessage.success('数据提交成功！')

    } catch (error) {
        if (error === 'cancel') {
            // 用户取消提交
            return
        }

        console.error('提交失败:', error)
        submissionStatus.value = {
            title: '提交失败',
            type: 'error',
            description: '提交过程中发生错误，请检查网络连接后重试'
        }
        ElMessage.error('提交失败，请重试')
    } finally {
        isSubmitting.value = false
    }
}

// 暴露给父组件的方法
defineExpose({
    agreements,
    canSubmit,
    handleSubmit
})
</script>

<style scoped>
.confirmation-step {
    max-width: 900px;
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

.confirmation-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.confirmation-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #e9ecef;
}

.confirmation-section h4 {
    color: #2c3e50;
    font-size: 1.2rem;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.section-icon {
    color: #3498db;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.info-item.full-width {
    grid-column: 1 / -1;
}

.info-item label {
    font-weight: 600;
    color: #495057;
    font-size: 0.9rem;
}

.info-item span {
    color: #2c3e50;
    padding: 0.5rem;
    background: white;
    border-radius: 4px;
    border: 1px solid #dee2e6;
    min-height: 1.5rem;
}

.file-summary {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.file-type-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.file-type {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem;
    background: white;
    border-radius: 6px;
    border: 1px solid #dee2e6;
}

.file-icon {
    color: #3498db;
    font-size: 1.1rem;
}

.file-label {
    font-weight: 500;
    color: #495057;
}

.file-count {
    color: #2c3e50;
    font-weight: 600;
    margin-left: auto;
}

.file-details {
    margin-top: 1rem;
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
    background: #f8f9fa;
    border-radius: 6px;
    border: 1px solid #e9ecef;
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

.agreement-section {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 8px;
    padding: 1.5rem;
}

.agreement-section h4 {
    color: #856404;
    margin-bottom: 1rem;
}

.agreement-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.agreement-content .el-checkbox {
    align-items: flex-start;
}

.agreement-content .el-checkbox__label {
    line-height: 1.5;
    color: #495057;
}

.submission-status {
    margin: 1.5rem 0;
}

.submit-actions {
    text-align: center;
    padding: 2rem 0;
}

.submit-actions .el-button {
    padding: 12px 32px;
    font-size: 1.1rem;
    font-weight: 600;
}

.submit-note {
    margin-top: 1rem;
    color: #6c757d;
    font-size: 0.9rem;
    line-height: 1.5;
}

.terms-content,
.privacy-content {
    line-height: 1.6;
}

.terms-content h4,
.privacy-content h4 {
    color: #2c3e50;
    margin: 1.5rem 0 0.5rem 0;
    font-size: 1.1rem;
}

.terms-content h4:first-child,
.privacy-content h4:first-child {
    margin-top: 0;
}

.terms-content p,
.privacy-content p {
    color: #495057;
    margin-bottom: 1rem;
}

@media (max-width: 768px) {
    .confirmation-step {
        padding: 0 1rem;
    }

    .confirmation-section {
        padding: 1rem;
    }

    .info-grid {
        grid-template-columns: 1fr;
    }

    .file-type-summary {
        grid-template-columns: 1fr;
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
