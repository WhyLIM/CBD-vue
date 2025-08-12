<template>
    <div class="form-step">
        <h3 class="step-title">
            <font-awesome-icon :icon="['fas', 'info-circle']" />
            基本信息
        </h3>

        <el-form :model="formData" :rules="rules" ref="formRef" label-width="120px">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="生物标记物名称" prop="biomarkerName" required>
                        <el-input v-model="formData.biomarkerName" placeholder="请输入生物标记物名称" />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="标记物类型" prop="biomarkerType" required>
                        <el-select v-model="formData.biomarkerType" placeholder="请选择类型">
                            <el-option label="蛋白质" value="protein" />
                            <el-option label="基因" value="gene" />
                            <el-option label="微RNA" value="microrna" />
                            <el-option label="代谢物" value="metabolite" />
                            <el-option label="DNA" value="dna" />
                            <el-option label="RNA" value="rna" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="疾病类型" prop="diseaseType" required>
                        <el-select v-model="formData.diseaseType" placeholder="请选择疾病类型">
                            <el-option label="癌症" value="cancer" />
                            <el-option label="心血管疾病" value="cardiovascular" />
                            <el-option label="神经系统疾病" value="neurological" />
                            <el-option label="免疫系统疾病" value="immunological" />
                            <el-option label="代谢性疾病" value="metabolic" />
                            <el-option label="其他" value="other" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="应用场景" prop="application" required>
                        <el-select v-model="formData.application" placeholder="请选择应用场景">
                            <el-option label="诊断" value="diagnosis" />
                            <el-option label="预后" value="prognosis" />
                            <el-option label="治疗监测" value="monitoring" />
                            <el-option label="药物反应" value="drug_response" />
                            <el-option label="风险评估" value="risk_assessment" />
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>

            <el-form-item label="研究机构" prop="institution" required>
                <el-input v-model="formData.institution" placeholder="请输入研究机构名称" />
            </el-form-item>

            <el-form-item label="联系邮箱" prop="email" required>
                <el-input v-model="formData.email" placeholder="请输入联系邮箱" />
            </el-form-item>

            <el-form-item label="研究描述" prop="description">
                <el-input v-model="formData.description" type="textarea" :rows="4" placeholder="请简要描述您的研究背景和目的" />
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
.el-select {
    width: 100%;
}

.el-textarea {
    width: 100%;
}
</style>