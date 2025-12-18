<template>
  <div class="filter-panel">
    <el-card class="filter-card">
      <template #header>
        <h3 class="panel-title">
          <font-awesome-icon :icon="['fas', 'filter']" />
          Smart Filters
        </h3>
      </template>

      <!-- Quick Filter Chips -->
      <div class="quick-filters">
        <h4 class="section-title">Quick Filters</h4>
        <div class="filter-chips">
          <el-tag v-for="preset in presetFilters" :key="preset.key"
            :type="activePreset === preset.key ? 'primary' : 'info'" class="filter-chip"
            :effect="activePreset === preset.key ? 'dark' : 'plain'" @click="$emit('applyPreset', preset)">
            <font-awesome-icon :icon="preset.icon" />
            {{ preset.label }}
          </el-tag>
        </div>
      </div>

      <!-- Advanced Filters -->
      <div class="advanced-filters">
        <h4 class="section-title">Advanced Filters</h4>

        <div class="filters-grid">
          <!-- Biomarker Name Search -->
          <div class="filter-group">
            <label class="filter-label">
              <font-awesome-icon :icon="['fas', 'search']" />
              Biomarker Name
            </label>
            <el-input :model-value="filters.name" placeholder="Enter biomarker name..." clearable
              @input="handleNameChange">
              <template #prefix>
                <font-awesome-icon :icon="['fas', 'dna']" />
              </template>
            </el-input>
          </div>

          <!-- Category Filter -->
          <div class="filter-group">
            <label class="filter-label">
              <font-awesome-icon :icon="['fas', 'tags']" />
              Category
            </label>
            <el-select :model-value="filters.category" placeholder="Select category" clearable multiple collapse-tags
              @change="handleCategoryChange">
              <el-option v-for="category in availableCategories" :key="category" :label="category" :value="category" />
            </el-select>
          </div>

          <!-- Application Type -->
          <div class="filter-group">
            <label class="filter-label">
              <font-awesome-icon :icon="['fas', 'stethoscope']" />
              Application
            </label>
            <el-select :model-value="filters.application" placeholder="Select application" clearable multiple
              collapse-tags @change="handleApplicationChange">
              <el-option v-for="app in availableApplications" :key="app" :label="app" :value="app" />
            </el-select>
          </div>

          <!-- Location -->
          <div class="filter-group">
            <label class="filter-label">
              <font-awesome-icon :icon="['fas', 'map-marker-alt']" />
              Location
            </label>
            <el-select :model-value="filters.location" placeholder="Select location" clearable multiple collapse-tags
              @change="handleLocationChange">
              <el-option v-for="location in availableLocations" :key="location" :label="location" :value="location" />
            </el-select>
          </div>

          <!-- Sample Source -->
          <div class="filter-group">
            <label class="filter-label">
              <font-awesome-icon :icon="['fas', 'vial']" />
              Sample Source
            </label>
            <el-select :model-value="filters.source" placeholder="Select sample source" clearable multiple collapse-tags
              @change="handleSourceChange">
              <el-option v-for="source in availableSources" :key="source" :label="source" :value="source" />
            </el-select>
          </div>

          <!-- Publication Year Range -->
          <div class="filter-group">
            <label class="filter-label">
              <font-awesome-icon :icon="['fas', 'calendar-alt']" />
              Publication Year
            </label>
            <div class="range-input">
              <el-date-picker v-model="yearRangeLocal" type="yearrange" unlink-panels range-separator="To"
                style="width: 100%" start-placeholder="Start Year" end-placeholder="End Year"
                :default-value="[new Date(minYear, 0, 1), new Date(maxYear, 11, 31)]" @change="handleYearRangeChange" />
            </div>
          </div>

          <!-- Research Region -->
          <div class="filter-group">
            <label class="filter-label">
              <font-awesome-icon :icon="['fas', 'globe']" />
              Research Region
            </label>
            <el-select :model-value="filters.region" placeholder="Select research region" clearable multiple
              collapse-tags @change="handleRegionChange">
              <el-option v-for="region in availableRegions" :key="region" :label="region" :value="region" />
            </el-select>
          </div>

          <!-- Disease Stage -->
          <div class="filter-group">
            <label class="filter-label">
              <font-awesome-icon :icon="['fas', 'chart-line']" />
              Disease Stage
            </label>
            <el-select :model-value="filters.stage" placeholder="Select disease stage" clearable multiple collapse-tags
              @change="handleStageChange">
              <el-option v-for="stage in availableStages" :key="stage" :label="stage" :value="stage" />
            </el-select>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="filter-actions">
          <el-button @click="$emit('clearFilters')" class="clear-btn">
            <font-awesome-icon :icon="['fas', 'eraser']" />
            Clear Filters
          </el-button>
          <el-button @click="$emit('savePreset')" type="primary" class="save-btn">
            <font-awesome-icon :icon="['fas', 'bookmark']" />
            Save Preset
          </el-button>
        </div>
      </div>
    </el-card>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  filters: Object,
  activePreset: String,
  availableCategories: Array,
  availableApplications: Array,
  availableLocations: Array,
  availableSources: Array,
  availableRegions: Array,
  availableStages: Array,
  minYear: Number,
  maxYear: Number,
  presetFilters: Array
})

const emit = defineEmits(['filterChange', 'filter-change', 'applyPreset', 'clearFilters', 'savePreset'])

const yearRangeLocal = computed({
  get: () => props.filters.yearRange,
  set: (value) => {
    emit('filterChange', { ...props.filters, yearRange: value })
    emit('filter-change', { ...props.filters, yearRange: value })
  }
})

// 处理各种输入变化的函数
const handleNameChange = (value) => {
  emit('filterChange', { ...props.filters, name: value })
  emit('filter-change', { ...props.filters, name: value })
}

const handleCategoryChange = (value) => {
  emit('filterChange', { ...props.filters, category: value })
  emit('filter-change', { ...props.filters, category: value })
}

const handleApplicationChange = (value) => {
  emit('filterChange', { ...props.filters, application: value })
  emit('filter-change', { ...props.filters, application: value })
}

const handleLocationChange = (value) => {
  emit('filterChange', { ...props.filters, location: value })
  emit('filter-change', { ...props.filters, location: value })
}

const handleSourceChange = (value) => {
  emit('filterChange', { ...props.filters, source: value })
  emit('filter-change', { ...props.filters, source: value })
}

const handleYearRangeChange = (value) => {
  emit('filterChange', { ...props.filters, yearRange: value })
  emit('filter-change', { ...props.filters, yearRange: value })
}

const handleRegionChange = (value) => {
  emit('filterChange', { ...props.filters, region: value })
  emit('filter-change', { ...props.filters, region: value })
}

const handleStageChange = (value) => {
  emit('filterChange', { ...props.filters, stage: value })
  emit('filter-change', { ...props.filters, stage: value })
}
</script>

<style scoped>
.filter-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-card {
  border: none;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 15px 0;
}

.quick-filters {
  margin-bottom: 25px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip:hover {
  transform: translateY(-1px);
}

.advanced-filters {
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.filters-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
}

.filter-actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
}

.clear-btn {
  flex: 1;
  background: #f5f5f5;
  border: 1px solid #ddd;
}

.save-btn {
  flex: 1;
  background: var(--accent-gradient);
  border: none;
  color: white;
}

.range-input {
  display: flex;
  align-items: center;
  gap: 8px;
}

.range-separator {
  color: #6c757d;
  font-weight: 500;
  padding: 0 4px;
}
</style>
