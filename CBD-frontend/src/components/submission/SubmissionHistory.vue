<template>
    <div class="submission-history">
        <div class="history-header">
            <h3>
                <font-awesome-icon icon="history" class="header-icon" />
                提交历史
            </h3>
            <p class="header-description">查看您的历史提交记录和状态</p>
        </div>

        <!-- 筛选和搜索 -->
        <div class="filter-section">
            <div class="filter-controls">
                <el-select v-model="statusFilter" placeholder="筛选状态" clearable style="width: 150px">
                    <el-option label="全部状态" value="" />
                    <el-option label="待审核" value="pending" />
                    <el-option label="审核中" value="reviewing" />
                    <el-option label="已通过" value="approved" />
                    <el-option label="已拒绝" value="rejected" />
                    <el-option label="需修改" value="revision" />
                </el-select>

                <el-date-picker v-model="dateRange" type="daterange" range-separator="至" start-placeholder="开始日期"
                    end-placeholder="结束日期" format="YYYY-MM-DD" style="width: 240px" />

                <el-input v-model="searchKeyword" placeholder="搜索研究标题..." clearable style="width: 200px">
                    <template #prefix>
                        <font-awesome-icon icon="search" />
                    </template>
                </el-input>

                <el-button type="primary" @click="handleSearch">
                    <font-awesome-icon icon="search" />
                    搜索
                </el-button>

                <el-button @click="handleReset">
                    <font-awesome-icon icon="refresh" />
                    重置
                </el-button>
            </div>
        </div>

        <!-- 统计信息 -->
        <div class="stats-section">
            <div class="stat-card">
                <div class="stat-icon pending">
                    <font-awesome-icon icon="clock" />
                </div>
                <div class="stat-content">
                    <div class="stat-number">{{ stats.pending }}</div>
                    <div class="stat-label">待审核</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon reviewing">
                    <font-awesome-icon icon="eye" />
                </div>
                <div class="stat-content">
                    <div class="stat-number">{{ stats.reviewing }}</div>
                    <div class="stat-label">审核中</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon approved">
                    <font-awesome-icon icon="check-circle" />
                </div>
                <div class="stat-content">
                    <div class="stat-number">{{ stats.approved }}</div>
                    <div class="stat-label">已通过</div>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon rejected">
                    <font-awesome-icon icon="times-circle" />
                </div>
                <div class="stat-content">
                    <div class="stat-number">{{ stats.rejected }}</div>
                    <div class="stat-label">已拒绝</div>
                </div>
            </div>
        </div>

        <!-- 提交记录列表 -->
        <div class="submissions-section">
            <div v-if="loading" class="loading-container">
                <el-skeleton :rows="5" animated />
            </div>

            <div v-else-if="filteredSubmissions.length === 0" class="empty-state">
                <font-awesome-icon icon="inbox" class="empty-icon" />
                <h4>暂无提交记录</h4>
                <p>您还没有提交过任何数据，<router-link to="/submission">立即提交</router-link></p>
            </div>

            <div v-else class="submissions-list">
                <div v-for="submission in paginatedSubmissions" :key="submission.id" class="submission-card">
                    <div class="submission-header">
                        <div class="submission-title">
                            <h4>{{ submission.title }}</h4>
                            <el-tag :type="getStatusType(submission.status)" size="small">
                                {{ getStatusText(submission.status) }}
                            </el-tag>
                        </div>
                        <div class="submission-actions">
                            <el-button size="small" text @click="viewDetails(submission)">
                                <font-awesome-icon icon="eye" />
                                查看详情
                            </el-button>
                            <el-dropdown @command="handleAction">
                                <el-button size="small" text>
                                    <font-awesome-icon icon="ellipsis-v" />
                                </el-button>
                                <template #dropdown>
                                    <el-dropdown-menu>
                                        <el-dropdown-item :command="{ action: 'download', id: submission.id }">
                                            <font-awesome-icon icon="download" />
                                            下载数据
                                        </el-dropdown-item>
                                        <el-dropdown-item v-if="submission.status === 'revision'"
                                            :command="{ action: 'edit', id: submission.id }">
                                            <font-awesome-icon icon="edit" />
                                            修改提交
                                        </el-dropdown-item>
                                        <el-dropdown-item v-if="submission.status === 'pending'"
                                            :command="{ action: 'cancel', id: submission.id }" divided>
                                            <font-awesome-icon icon="times" />
                                            取消提交
                                        </el-dropdown-item>
                                    </el-dropdown-menu>
                                </template>
                            </el-dropdown>
                        </div>
                    </div>

                    <div class="submission-meta">
                        <div class="meta-item">
                            <font-awesome-icon icon="calendar" class="meta-icon" />
                            <span>提交时间：{{ formatDate(submission.submittedAt) }}</span>
                        </div>
                        <div class="meta-item">
                            <font-awesome-icon icon="flask" class="meta-icon" />
                            <span>研究类型：{{ submission.type }}</span>
                        </div>
                        <div class="meta-item">
                            <font-awesome-icon icon="database" class="meta-icon" />
                            <span>数据文件：{{ submission.fileCount }} 个</span>
                        </div>
                        <div v-if="submission.reviewedAt" class="meta-item">
                            <font-awesome-icon icon="clock" class="meta-icon" />
                            <span>审核时间：{{ formatDate(submission.reviewedAt) }}</span>
                        </div>
                    </div>

                    <div v-if="submission.description" class="submission-description">
                        <p>{{ submission.description }}</p>
                    </div>

                    <div v-if="submission.reviewComments" class="review-comments">
                        <h5>
                            <font-awesome-icon icon="comment" />
                            审核意见
                        </h5>
                        <p>{{ submission.reviewComments }}</p>
                    </div>

                    <div class="submission-progress">
                        <el-steps :active="getProgressStep(submission.status)" finish-status="success" simple>
                            <el-step title="已提交" />
                            <el-step title="审核中" />
                            <el-step :title="submission.status === 'approved' ? '已通过' : '已完成'" />
                        </el-steps>
                    </div>
                </div>
            </div>

            <!-- 分页 -->
            <div v-if="filteredSubmissions.length > pageSize" class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[5, 10, 20, 50]" :total="filteredSubmissions.length"
                    layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
                    @current-change="handleCurrentChange" />
            </div>
        </div>

        <!-- 详情对话框 -->
        <el-dialog v-model="showDetailsDialog" :title="selectedSubmission?.title" width="70%"
            :before-close="handleDialogClose">
            <div v-if="selectedSubmission" class="submission-details">
                <el-descriptions :column="2" border>
                    <el-descriptions-item label="提交ID">{{ selectedSubmission.id }}</el-descriptions-item>
                    <el-descriptions-item label="状态">
                        <el-tag :type="getStatusType(selectedSubmission.status)">
                            {{ getStatusText(selectedSubmission.status) }}
                        </el-tag>
                    </el-descriptions-item>
                    <el-descriptions-item label="研究类型">{{ selectedSubmission.type }}</el-descriptions-item>
                    <el-descriptions-item label="研究领域">{{ selectedSubmission.field }}</el-descriptions-item>
                    <el-descriptions-item label="主要研究者">{{ selectedSubmission.researcher }}</el-descriptions-item>
                    <el-descriptions-item label="所属机构">{{ selectedSubmission.institution }}</el-descriptions-item>
                    <el-descriptions-item label="联系邮箱">{{ selectedSubmission.email }}</el-descriptions-item>
                    <el-descriptions-item label="提交时间">{{ formatDate(selectedSubmission.submittedAt)
                        }}</el-descriptions-item>
                    <el-descriptions-item v-if="selectedSubmission.reviewedAt" label="审核时间">
                        {{ formatDate(selectedSubmission.reviewedAt) }}
                    </el-descriptions-item>
                    <el-descriptions-item label="数据文件数量">{{ selectedSubmission.fileCount }}</el-descriptions-item>
                    <el-descriptions-item label="研究描述" :span="2">
                        {{ selectedSubmission.description }}
                    </el-descriptions-item>
                    <el-descriptions-item v-if="selectedSubmission.reviewComments" label="审核意见" :span="2">
                        {{ selectedSubmission.reviewComments }}
                    </el-descriptions-item>
                </el-descriptions>
            </div>
            <template #footer>
                <el-button @click="showDetailsDialog = false">关闭</el-button>
                <el-button v-if="selectedSubmission?.status === 'approved'" type="primary" @click="downloadSubmission">
                    <font-awesome-icon icon="download" />
                    下载数据
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 响应式数据
const loading = ref(true)
const statusFilter = ref('')
const dateRange = ref([])
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showDetailsDialog = ref(false)
const selectedSubmission = ref(null)

// 统计数据
const stats = ref({
    pending: 0,
    reviewing: 0,
    approved: 0,
    rejected: 0
})

// 模拟提交数据
const submissions = ref([
    {
        id: 'SUB001',
        title: '肺癌早期诊断生物标记物研究',
        status: 'approved',
        type: '临床研究',
        field: '肿瘤学',
        researcher: '张医生',
        institution: '北京大学医学院',
        email: 'zhang@pku.edu.cn',
        submittedAt: '2024-01-15T10:30:00Z',
        reviewedAt: '2024-01-20T14:20:00Z',
        fileCount: 5,
        description: '通过分析血液样本中的蛋白质标记物，建立肺癌早期诊断模型...',
        reviewComments: '数据质量良好，研究方法科学，建议发表。'
    },
    {
        id: 'SUB002',
        title: '糖尿病并发症预测标记物',
        status: 'reviewing',
        type: '基础研究',
        field: '内分泌学',
        researcher: '李教授',
        institution: '清华大学医学院',
        email: 'li@tsinghua.edu.cn',
        submittedAt: '2024-01-20T09:15:00Z',
        fileCount: 3,
        description: '研究糖尿病患者血清中的代谢标记物与并发症发生的关系...'
    },
    {
        id: 'SUB003',
        title: '心血管疾病风险评估',
        status: 'revision',
        type: '临床研究',
        field: '心血管内科',
        researcher: '王主任',
        institution: '协和医院',
        email: 'wang@pumch.cn',
        submittedAt: '2024-01-10T16:45:00Z',
        reviewedAt: '2024-01-18T11:30:00Z',
        fileCount: 7,
        description: '基于多种生物标记物的心血管疾病风险预测模型...',
        reviewComments: '研究设计合理，但需要补充对照组数据和统计分析方法说明。'
    }
])

// 计算属性
const filteredSubmissions = computed(() => {
    let filtered = submissions.value

    // 状态筛选
    if (statusFilter.value) {
        filtered = filtered.filter(sub => sub.status === statusFilter.value)
    }

    // 日期范围筛选
    if (dateRange.value && dateRange.value.length === 2) {
        const [startDate, endDate] = dateRange.value
        filtered = filtered.filter(sub => {
            const submittedDate = new Date(sub.submittedAt)
            return submittedDate >= startDate && submittedDate <= endDate
        })
    }

    // 关键词搜索
    if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase()
        filtered = filtered.filter(sub =>
            sub.title.toLowerCase().includes(keyword) ||
            sub.researcher.toLowerCase().includes(keyword) ||
            sub.institution.toLowerCase().includes(keyword)
        )
    }

    return filtered
})

const paginatedSubmissions = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredSubmissions.value.slice(start, end)
})

// 方法
const updateStats = () => {
    const statusCounts = submissions.value.reduce((acc, sub) => {
        acc[sub.status] = (acc[sub.status] || 0) + 1
        return acc
    }, {})

    stats.value = {
        pending: statusCounts.pending || 0,
        reviewing: statusCounts.reviewing || 0,
        approved: statusCounts.approved || 0,
        rejected: statusCounts.rejected || 0
    }
}

const getStatusType = (status) => {
    const statusMap = {
        pending: 'warning',
        reviewing: 'primary',
        approved: 'success',
        rejected: 'danger',
        revision: 'info'
    }
    return statusMap[status] || 'info'
}

const getStatusText = (status) => {
    const statusMap = {
        pending: '待审核',
        reviewing: '审核中',
        approved: '已通过',
        rejected: '已拒绝',
        revision: '需修改'
    }
    return statusMap[status] || '未知'
}

const getProgressStep = (status) => {
    const stepMap = {
        pending: 1,
        reviewing: 2,
        approved: 3,
        rejected: 3,
        revision: 2
    }
    return stepMap[status] || 0
}

const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const handleSearch = () => {
    currentPage.value = 1
    ElMessage.success('搜索完成')
}

const handleReset = () => {
    statusFilter.value = ''
    dateRange.value = []
    searchKeyword.value = ''
    currentPage.value = 1
    ElMessage.success('筛选条件已重置')
}

const handleSizeChange = (newSize) => {
    pageSize.value = newSize
    currentPage.value = 1
}

const handleCurrentChange = (newPage) => {
    currentPage.value = newPage
}

const viewDetails = (submission) => {
    selectedSubmission.value = submission
    showDetailsDialog.value = true
}

const handleDialogClose = (done) => {
    done()
    selectedSubmission.value = null
}

const handleAction = async ({ action, id }) => {
    const submission = submissions.value.find(sub => sub.id === id)
    if (!submission) return

    switch (action) {
        case 'download':
            ElMessage.success(`正在下载 ${submission.title} 的数据...`)
            break
        case 'edit':
            ElMessage.info('跳转到编辑页面...')
            break
        case 'cancel':
            try {
                await ElMessageBox.confirm(
                    `确定要取消提交"${submission.title}"吗？`,
                    '确认取消',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                )
                // 这里应该调用API取消提交
                ElMessage.success('提交已取消')
            } catch {
                // 用户取消操作
            }
            break
    }
}

const downloadSubmission = () => {
    if (selectedSubmission.value) {
        ElMessage.success(`正在下载 ${selectedSubmission.value.title} 的数据...`)
        showDetailsDialog.value = false
    }
}

// 生命周期
onMounted(async () => {
    // 模拟加载数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    loading.value = false
    updateStats()
})
</script>

<style scoped>
.submission-history {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.history-header {
    text-align: center;
    margin-bottom: 2rem;
}

.history-header h3 {
    color: #2c3e50;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
}

.header-icon {
    color: #3498db;
}

.header-description {
    color: #7f8c8d;
    font-size: 1rem;
}

.filter-section {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    border: 1px solid #e9ecef;
}

.filter-controls {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    align-items: center;
}

.stats-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
}

.stat-card {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid #e9ecef;
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    color: white;
}

.stat-icon.pending {
    background: #f39c12;
}

.stat-icon.reviewing {
    background: #3498db;
}

.stat-icon.approved {
    background: #27ae60;
}

.stat-icon.rejected {
    background: #e74c3c;
}

.stat-content {
    flex: 1;
}

.stat-number {
    font-size: 2rem;
    font-weight: bold;
    color: #2c3e50;
    line-height: 1;
}

.stat-label {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin-top: 0.25rem;
}

.submissions-section {
    background: white;
    border-radius: 8px;
    border: 1px solid #e9ecef;
    overflow: hidden;
}

.loading-container {
    padding: 2rem;
}

.empty-state {
    text-align: center;
    padding: 4rem 2rem;
}

.empty-icon {
    font-size: 4rem;
    color: #bdc3c7;
    margin-bottom: 1rem;
}

.empty-state h4 {
    color: #7f8c8d;
    margin-bottom: 0.5rem;
}

.empty-state p {
    color: #95a5a6;
}

.submissions-list {
    display: flex;
    flex-direction: column;
}

.submission-card {
    padding: 1.5rem;
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.2s;
}

.submission-card:hover {
    background-color: #f8f9fa;
}

.submission-card:last-child {
    border-bottom: none;
}

.submission-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
}

.submission-title {
    flex: 1;
}

.submission-title h4 {
    color: #2c3e50;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.submission-actions {
    display: flex;
    gap: 0.5rem;
}

.submission-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6c757d;
    font-size: 0.9rem;
}

.meta-icon {
    color: #3498db;
    width: 14px;
}

.submission-description {
    margin-bottom: 1rem;
}

.submission-description p {
    color: #495057;
    line-height: 1.5;
}

.review-comments {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 1rem;
    margin-bottom: 1rem;
}

.review-comments h5 {
    color: #856404;
    font-size: 1rem;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.review-comments p {
    color: #856404;
    margin: 0;
    line-height: 1.5;
}

.submission-progress {
    margin-top: 1rem;
}

.pagination-container {
    padding: 1.5rem;
    border-top: 1px solid #e9ecef;
    display: flex;
    justify-content: center;
}

.submission-details {
    max-height: 60vh;
    overflow-y: auto;
}

@media (max-width: 768px) {
    .submission-history {
        padding: 1rem;
    }

    .filter-controls {
        flex-direction: column;
        align-items: stretch;
    }

    .filter-controls>* {
        width: 100% !important;
    }

    .stats-section {
        grid-template-columns: 1fr;
    }

    .submission-header {
        flex-direction: column;
        gap: 1rem;
    }

    .submission-actions {
        align-self: flex-end;
    }

    .submission-meta {
        grid-template-columns: 1fr;
    }
}
</style>