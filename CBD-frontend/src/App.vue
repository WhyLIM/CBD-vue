<template>
  <div id="app" class="main">
    <AppHeader />
    <div class="content">
      <div class="innerbox">
        <router-view />
      </div>
    </div>
    <AppFooter />
  </div>
</template>

<script setup>
import AppHeader from './components/layout/AppHeader.vue'
import AppFooter from './components/layout/AppFooter.vue'
</script>

<style>
#app {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 确保Element Plus样式与原有样式兼容 */
.el-button {
  /* font-family: LXGW, sans-serif; */
}

.el-input__inner {
  /* font-family: LXGW, sans-serif; */
}

.el-table {
  /* font-family: LXGW, sans-serif; */
}

/* 覆盖Element Plus的一些默认样式以匹配原设计 */
.el-button--primary {
  background-color: #1B9CFC;
  border-color: #1B9CFC;
}

.el-button--primary:hover {
  background-color: #0d699e;
  border-color: #0d699e;
}

.el-link {
  color: #0d699e;
}

.el-link:hover {
  color: #1B9CFC;
}
</style>