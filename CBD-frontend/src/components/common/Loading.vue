<template>
  <div class="loading-container" v-if="show">
    <div class="loading-backdrop" @click="handleBackdropClick">
      <div class="loading-content">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p class="loading-text">{{ text }}</p>
      </div>
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
  text: {
    type: String,
    default: 'Loading...'
  },
  backdrop: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['close'])

const handleBackdropClick = () => {
  if (props.backdrop) {
    emit('close')
  }
}
</script>

<style scoped>
.loading-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
}

.loading-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  margin: 0;
  color: #666;
  font-size: 14px;
}
</style>