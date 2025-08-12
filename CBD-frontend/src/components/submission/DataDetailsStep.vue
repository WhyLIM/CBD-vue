<template>
    <div class="form-step">
        <h3 class="step-title">
            <font-awesome-icon :icon="['fas', 'database']" />
            数据详情
        </h3>

        <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="样本量" prop="sampleSize" required>
                        <el-input-number v-model="formData.sampleSize" :min="1" :max="100000" placeholder="请输入样本量"
                            style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="检测方法" prop="detectionMethod" required>
                        <el-select v-model="formData.detectionMethod" placeholder="请选择检测方法">
                            <el-option label="ELISA" value="elisa" />
                            <el-option label="Western Blot" value="western_blot" />
                            <el-option label="PCR" value="pcr" />
                            <el-option label="质谱" value="mass_spectrometry" />
                            <el-option label="免疫组化" value="immunohistochemistry" />
                            <el-option label="其他" value="other" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="敏感性 (%)" prop="sensitivity">
                        <el-input-number v-model="formData.sensitivity" :min="0" :max="100" :precision="2"
                            placeholder="请输入敏感性" style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="特异性 (%)" prop="specificity">
                        <el-input-number v-model="formData.specificity" :min="0" :max="100" :precision="2"
                            placeholder="请输入特异性" style="width: 100%" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="AUC值" prop="auc">
                        <el-input-number v-model="formData.auc" :min="0" :max="1" :precision="3" placeholder="请输入AUC值"
                            style="width: 100%" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="P值" prop="pValue">
                        <el-input v-model="formData.pValue" placeholder="请输入P值 (如: <0.001)" />
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item label="参考文献" prop="reference">
                <el-input v-model="formData.reference" placeholder="请输入相关参考文献 (DOI或PMID)" />
            </el-form-item>

            <el-form-item label="数据来源" prop="dataSource">
                <el-radio-group v-model="formData.dataSource">
                    <el-radio label="original">原创研究</el-radio>
                    <el-radio label="published">已发表文献</el-radio>
                    <el-radio label="database">公共数据库</el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="验证状态" prop="validationStatus">
                <el-radio-group v-model="formData.validationStatus">
                    <el-radio label="validated">已验证</el-radio>
                    <el-radio label="pending">待验证</el-radio>
                    <el-radio label="experimental">实验阶段</el-radio>
                </el-radio-group>
            </el-form-item>
        </el-form>
    </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
    formData: {
        type: Object,
        required: true
    },
    rules: {
        type: Object,
        required: true
    }
})

const formRef = ref()

const validate = () => {
    return formRef.value?.validate()
}

defineExpose({
    validate
})
</script>

<style scoped>
.form-step {
    margin-bottom: 30px;
}

.step-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #1e3c72;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 15px;
    border-bottom: 2px solid #e8ecf4;
}

.step-title svg {
    color: #2a5298;
}

.el-form-item {
    margin-bottom: 25px;
}

.el-input,
.el-select,
.el-input-number {
    width: 100%;
}

.el-radio-group {
    display: flex;
    gap: 20px;
}

.el-radio {
    margin-right: 0;
}
</style>