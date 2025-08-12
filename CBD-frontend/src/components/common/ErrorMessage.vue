<template>
  <div class="error-container" v-if="show">
    <div class="error-content">
      <div class="error-icon">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#ef4444" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="#ef4444" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="#ef4444" stroke-width="2"/>
        </svg>
      </div>
      <div class="error-text">
        <h4 class="error-title">{{ title }}</h4>
        <p class="error-message">{{ message }}</p>
      </div>
      <button class="error-close" @click="handleClose" v-if="closable">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
    <div class="error-actions" v-if="showRetry">
      <button class="retry-button" @click="handleRetry">
        重试
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: '出错了'
  },
  message: {
    type: String,
    default: '请稍后重试'
  },
  closable: {
    type: Boolean,
    default: true
  },
  showRetry: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'retry'])

const handleClose = () => {
  emit('close')
}

const handleRetry = () => {
  emit('retry')
}
</script>

<style scoped>
.error-container {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.error-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  position: relative;
}

.error-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;
}

.error-text {
  flex: 1;
}

.error-title {
  margin: 0 0 0.25rem 0;
  font-size: 1rem;
  font-weight: 600;
  color: #dc2626;
}

.error-message {
  margin: 0;
  font-size: 0.875rem;
  color: #991b1b;
  line-height: 1.4;
}

.error-close {
  position: absolute;
  top: 0;
  right: 0;
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.error-close:hover {
  background-color: #fecaca;
}

.error-actions {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #fecaca;
}

.retry-button {
  background: #dc2626;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.retry-button:hover {
  background: #b91c1c;
}
</style>