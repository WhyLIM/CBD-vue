<template>
  <template v-for="(ev, i) in items" :key="i">
    <a v-if="ev.url" :href="ev.url" target="_blank" rel="noopener" class="evidence-link" :style="{ color: ev.color }">{{ ev.label }}</a>
    <span v-else class="evidence-text" :style="{ color: ev.color }">{{ ev.label }}</span>
  </template>
  <span v-if="!items.length">-</span>
</template>

<script setup>
import { computed } from 'vue'
import { EnrichmentProcessor } from '@/utils/networkAnalysis'

const props = defineProps({
  evidence: { type: String, default: '' }
})

// 颜色与 URL 复用 EnrichmentProcessor 的 categoryColors / urlTemplates，与 Functional Enrichment 一致
const parser = new EnrichmentProcessor()
const items = computed(() => parser.parseEvidence(props.evidence))
</script>

<style scoped>
.evidence-link {
  margin-right: 8px;
  font-weight: bold;
  text-decoration: none;
  white-space: nowrap;
}

.evidence-link:hover {
  text-decoration: underline;
}

.evidence-text {
  margin-right: 8px;
  white-space: nowrap;
}
</style>
