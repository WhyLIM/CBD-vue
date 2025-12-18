<template>
  <el-card class="analysis-card">
    <div class="controls">
      <el-select v-model="cellType" placeholder="Cell Type" filterable @change="loadData">
        <el-option v-for="ct in cellTypes" :key="ct" :label="ct" :value="ct" />
      </el-select>
      <el-select v-model="plotType" placeholder="Plot Type" filterable @change="loadData">
        <el-option v-for="pt in plotTypes" :key="pt" :label="pt" :value="pt" />
      </el-select>
    </div>
    <div class="cards-grid" :class="{ single: singleLayout }" v-loading="loading">
      <el-card v-for="f in pagedFiles" :key="f.file_path" class="thumb-card" :class="cardClass">
        <template #header>
          <div class="card-header">
            <span>{{ titleFor(f) }}</span>
            <el-tag type="info">{{ f.cell_type }}</el-tag>
          </div>
        </template>
        <div class="thumb">
          <img :src="toUrl(f.file_path)" alt="trajectory" />
        </div>
        <div class="actions">
          <el-button size="small" @click="open(f)">Open</el-button>
        </div>
      </el-card>
    </div>
    <div class="pagination">
      <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="pageSizeOptions" :total="total"
        layout="total, sizes, prev, pager, next" @current-change="loadData" @size-change="loadData" />
    </div>
  </el-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import analysisApi from '@/services/analysis'
const cellTypes = ref([])
const plotTypes = ref([])
const cellType = ref('')
const plotType = ref('')
const page = ref(1)
const limit = ref(1)
const total = ref(0)
const files = ref([])
const loading = ref(false)
const toUrl = (p) => p.startsWith('http') ? p : `${import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || ''}/${p.replace(/^\//, '')}`
const open = (f) => window.open(toUrl(f.file_path), '_blank')
const isGeneTraj = (pt) => String(pt || '').toLowerCase().includes('gene')
const singleLayout = computed(() => plotType.value === 'umap_manual' || isGeneTraj(plotType.value))
const cardClass = computed(() => ({ largeUmap: plotType.value === 'umap_manual', largeGene: isGeneTraj(plotType.value) }))
const pageSizeOptions = computed(() => isGeneTraj(plotType.value) ? [3, 6, 9] : [1, 2, 4])
const pagedFiles = computed(() => {
  const start = (page.value - 1) * limit.value
  return files.value.slice(start, start + limit.value)
})
const titleFor = (f) => isGeneTraj(plotType.value || f.plot_type) ? (f.gene || 'Gene') : (f.plot_type || '')
watch(() => plotType.value, () => {
  if (isGeneTraj(plotType.value)) {
    limit.value = 3
  } else {
    limit.value = 1
  }
  page.value = 1
  loadData()
})
watch(() => cellType.value, () => {
  page.value = 1
  loadData()
})
const loadData = async () => {
  loading.value = true
  const params = {
    cell_type: cellType.value || undefined,
    plot_type: plotType.value || undefined
  }
  const resp = await analysisApi.getTrajectoryFiles(params)
  files.value = resp.data || []
  total.value = resp.data?.length || 0
  loading.value = false
}
onMounted(async () => {
  const f = await (await import('@/services/analysis')).default.getFilters()
  cellTypes.value = f.data?.trajectoryCellTypes || []
  plotTypes.value = f.data?.plotTypes || []

  // 设置默认值
  if (!cellType.value && cellTypes.value.length) {
    cellType.value = 'b_plasma'
  }
  if (!plotType.value && plotTypes.value.length) {
    plotType.value = 'umap_manual'
  }

  loadData()
})
</script>

<style scoped>
.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 8px
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px
}

.cards-grid.single {
  grid-template-columns: 1fr
}

.thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 160px;
  overflow: hidden
}

.thumb-card.largeUmap .thumb {
  height: 480px
}

.thumb-card.largeGene .thumb {
  height: 280px
}

.thumb img {
  max-width: 100%;
  max-height: 100%
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center
}

.actions {
  margin-top: 8px;
  display: flex;
  justify-content: flex-end
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px
}
</style>
