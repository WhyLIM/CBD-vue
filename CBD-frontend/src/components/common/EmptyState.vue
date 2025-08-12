<template>
  <div class="empty-state">
    <div class="empty-icon">
      <slot name="icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="#d1d5db" stroke-width="1.5"/>
          <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="9" y1="9" x2="9.01" y2="9" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"/>
          <line x1="15" y1="9" x2="15.01" y2="9" stroke="#d1d5db" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </slot>
    </div>
    <div class="empty-content">
      <h3 class="empty-title">{{ title }}</h3>
      <p class="empty-description">{{ description }}</p>
      <div class="empty-actions" v-if="showAction">
        <slot name="action">
          <button class="action-button" @click="handleAction">
            {{ actionText }}
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'No Data'
  },
  description: {
    type: String,
    default: 'There is no data to display at the moment.'
  },
  showAction: {
    type: Boolean,
    default: false
  },
  actionText: {
    type: String,
    default: 'Refresh'
  }
})

const emit = defineEmits(['action'])

const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  min-height: 300px;
}

.empty-icon {
  margin-bottom: 1.5rem;
  opacity: 0.6;
}

.empty-content {
  max-width: 400px;
}

.empty-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.empty-description {
  margin: 0 0 1.5rem 0;
  font-size: 0.875rem;
  color: #6b7280;
  line-height: 1.5;
}

.empty-actions {
  margin-top: 1.5rem;
}

.action-button {
  background: #2563eb;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.action-button:hover {
  background: #1d4ed8;
}
</style>