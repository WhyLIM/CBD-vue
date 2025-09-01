<template>
  <div class="about-page">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-background">
        <div class="container">
          <div class="hero-content">
            <h1 class="hero-title">About</h1>
            <p class="hero-subtitle">Project Details and Use Instructions</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Docs Section -->
    <section class="docs-section">
      <div class="docs-container">
        <DocsViewer />
      </div>
    </section>
  </div>
</template>

<script setup>
import DocsViewer from '@/components/DocsViewer.vue'
</script>

<style scoped>
.about-page {
  background: white;
  min-height: 100vh;
}

/* Docs Section */
.docs-section {
  background: white;
  padding: 0;
  margin: -9px 0;
}

.docs-container {
  width: 100%;
  margin: 0;
  background: white;
}

.docs-container :deep(.docs-viewer) {
  width: 100%;
}

@media (max-width: 768px) {
  .about-page {
    padding-bottom: 80px;
  }
}
</style>
