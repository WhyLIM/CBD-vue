<template>
    <div class="form-section">
        <div class="container">
            <el-card class="form-card">
                <template #header>
                    <div class="form-header">
                        <h2 class="section-title">
                            <font-awesome-icon :icon="['fas', 'edit']" class="title-icon" />
                            数据提交表单
                        </h2>
                        <div class="form-progress">
                            <el-steps :active="currentStep" finish-status="success" simple>
                                <el-step title="基本信息" />
                                <el-step title="数据详情" />
                                <el-step title="文件上传" />
                                <el-step title="确认提交" />
                            </el-steps>
                        </div>
                    </div>
                </template>

                <div class="form-content">
                    <!-- 基本信息步骤 -->
                    <BasicInfoStep v-show="currentStep === 0" :form-data="formData" :rules="rules" ref="basicFormRef" />

                    <!-- 数据详情步骤 -->
                    <DataDetailsStep v-show="currentStep === 1" :form-data="formData" :rules="rules"
                        ref="dataFormRef" />

                    <!-- 文件上传步骤 -->
                    <FileUploadStep v-show="currentStep === 2" :file-list="fileList" @file-change="handleFileChange" />

                    <!-- 确认提交步骤 -->
                    <ConfirmationStep v-show="currentStep === 3" :form-data="formData" :file-list="fileList"
                        :agreed-to-terms="agreedToTerms" @update:agreed-to-terms="agreedToTerms = $event" />

                    <!-- 表单操作按钮 -->
                    <div class="form-actions">
                        <el-button v-if="currentStep > 0" @click="prevStep" size="large">
                            <font-awesome-icon :icon="['fas', 'arrow-left']" />
                            上一步
                        </el-button>
                        <el-button v-if="currentStep < 3" type="primary" @click="nextStep" size="large">
                            下一步
                            <font-awesome-icon :icon="['fas', 'arrow-right']" />
                        </el-button>
                        <el-button v-if="currentStep === 3" type="success" @click="submitForm" :loading="submitting"
                            :disabled="!agreedToTerms" size="large">
                            <font-awesome-icon :icon="['fas', 'paper-plane']" />
                            提交数据
                        </el-button>
                    </div>
                </div>
            </el-card>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import BasicInfoStep from './BasicInfoStep.vue'
import DataDetailsStep from './DataDetailsStep.vue'
import FileUploadStep from './FileUploadStep.vue'
import ConfirmationStep from './ConfirmationStep.vue'

// 响应式数据
const currentStep = ref(0)
const submitting = ref(false)
const agreedToTerms = ref(false)
const fileList = ref([])

const basicFormRef = ref()
const dataFormRef = ref()

const formData = reactive({
    biomarkerName: '',
    biomarkerType: '',
    diseaseType: '',
    application: '',
    institution: '',
    email: '',
    description: '',
    sampleSize: null,
    detectionMethod: '',
    sensitivity: null,
    specificity: null,
    auc: null,
    pValue: '',
    reference: '',
    dataSource: 'original',
    validationStatus: 'pending'
})

const rules = {
    biomarkerName: [
        { required: true, message: '请输入生物标记物名称', trigger: 'blur' }
    ],
    biomarkerType: [
        { required: true, message: '请选择标记物类型', trigger: 'change' }
    ],
    diseaseType: [
        { required: true, message: '请选择疾病类型', trigger: 'change' }
    ],
    application: [
        { required: true, message: '请选择应用场景', trigger: 'change' }
    ],
    institution: [
        { required: true, message: '请输入研究机构', trigger: 'blur' }
    ],
    email: [
        { required: true, message: '请输入邮箱地址', trigger: 'blur' },
        { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
    ],
    sampleSize: [
        { required: true, message: '请输入样本量', trigger: 'blur' }
    ],
    detectionMethod: [
        { required: true, message: '请选择检测方法', trigger: 'change' }
    ]
}

// 方法
const nextStep = async () => {
    if (currentStep.value === 0) {
        const valid = await basicFormRef.value?.validate().catch(() => false)
        if (!valid) return
    } else if (currentStep.value === 1) {
        const valid = await dataFormRef.value?.validate().catch(() => false)
        if (!valid) return
    } else if (currentStep.value === 2) {
        if (fileList.value.length === 0) {
            ElMessage.warning('请至少上传一个文件')
            return
        }
    }

    if (currentStep.value < 3) {
        currentStep.value++
    }
}

const prevStep = () => {
    if (currentStep.value > 0) {
        currentStep.value--
    }
}

const submitForm = async () => {
    if (!agreedToTerms.value) {
        ElMessage.warning('请先同意数据提交协议和隐私政策')
        return
    }

    try {
        await ElMessageBox.confirm('确定要提交数据吗？提交后将进入审核流程。', '确认提交', {
            confirmButtonText: '确定提交',
            cancelButtonText: '取消',
            type: 'warning'
        })

        submitting.value = true

        // 模拟提交过程
        setTimeout(() => {
            submitting.value = false
            ElMessage.success('数据提交成功！我们将通过邮件通知您审核进度。')
            resetForm()
        }, 3000)
    } catch {
        // 用户取消
    }
}

const resetForm = () => {
    currentStep.value = 0
    agreedToTerms.value = false
    fileList.value = []
    Object.keys(formData).forEach(key => {
        if (typeof formData[key] === 'string') {
            formData[key] = ''
        } else if (typeof formData[key] === 'number') {
            formData[key] = null
        }
    })
    formData.dataSource = 'original'
    formData.validationStatus = 'pending'
}

const handleFileChange = (files) => {
    fileList.value = files
}
</script>

<style scoped>
.form-section {
    padding: 80px 0;
    background: #f8f9fa;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.form-card {
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border: none;
}

.form-header {
    text-align: center;
}

.section-title {
    font-size: 2rem;
    font-weight: 700;
    color: #1e3c72;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.title-icon {
    color: #2a5298;
}

.form-progress {
    margin-top: 20px;
}

.form-content {
    padding: 40px;
}

.form-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
    padding-top: 30px;
    border-top: 1px solid #e8ecf4;
}

.form-actions .el-button {
    min-width: 120px;
}
</style>