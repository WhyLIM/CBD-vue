<template>
  <div class="app-header">
    <!-- 顶部横幅区域 -->
    <!-- <div class="header-banner">
      <div class="banner-background">
        <div class="container">
          <div class="banner-content">
            <div class="logo-section">
              <div class="logo-icon">
                <font-awesome-icon :icon="['fas', 'dna']" />
              </div>
              <div class="logo-text">
                <h1 class="logo-title">
                  <router-link to="/">CBD2</router-link>
                </h1>
                <p class="logo-subtitle">Colorectal Cancer Biomarker Database</p>
              </div>
            </div>

            <div class="header-stats">
              <div class="stat-item">
                <div class="stat-number">2,847</div>
                <div class="stat-label">Biomarkers</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">1,256</div>
                <div class="stat-label">Citations</div>
              </div>
              <div class="stat-item">
                <div class="stat-number">89</div>
                <div class="stat-label">Institutions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> -->

    <!-- 导航菜单区域 -->
    <div class="navigation-bar">
      <div class="container">
        <nav class="main-navigation">
          <ul class="nav-menu">
            <li class="nav-item" :class="{ active: $route.name === 'home' }">
              <router-link to="/" class="nav-link">
                <font-awesome-icon :icon="['fas', 'home']" class="nav-icon" />
                <span class="nav-text">Home</span>
              </router-link>
            </li>
            <li class="nav-item" :class="{ active: $route.name === 'biomarkers' }">
              <router-link to="/biomarkers" class="nav-link">
                <font-awesome-icon :icon="['fas', 'list']" class="nav-icon" />
                <span class="nav-text">Biomarkers</span>
              </router-link>
            </li>
            <li class="nav-item" :class="{ active: $route.name === 'advanced' }">
              <router-link to="/advanced" class="nav-link">
                <font-awesome-icon :icon="['fab', 'searchengin']" class="nav-icon" />
                <span class="nav-text">Advanced Search</span>
              </router-link>
            </li>
            <li class="nav-item dropdown" :class="{ active: isExploreActive }" @mouseenter="showExploreDropdown = true"
              @mouseleave="showExploreDropdown = false">
              <div class="nav-link">
                <font-awesome-icon :icon="['fas', 'chart-line']" class="nav-icon" />
                <span class="nav-text">Explore</span>
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="dropdown-arrow" />
              </div>
              <div class="dropdown-menu" :class="{ show: showExploreDropdown }">
                <router-link to="/network-explore" class="dropdown-item" @click="showExploreDropdown = false">
                  <font-awesome-icon :icon="['fas', 'project-diagram']" class="dropdown-icon" />
                  <span>Network Analysis</span>
                </router-link>
                <router-link to="/umap" class="dropdown-item" @click="showExploreDropdown = false">
                  <font-awesome-icon :icon="['fas', 'map']" class="dropdown-icon" />
                  <span>Bulk to Single-Cell</span>
                </router-link>
              </div>
            </li>
            <li class="nav-item" :class="{ active: $route.name === 'download' }">
              <router-link to="/download" class="nav-link">
                <font-awesome-icon :icon="['fas', 'download']" class="nav-icon" />
                <span class="nav-text">Download</span>
              </router-link>
            </li>
            <li class="nav-item" :class="{ active: $route.name === 'submission' }">
              <router-link to="/submission" class="nav-link">
                <font-awesome-icon :icon="['fas', 'upload']" class="nav-icon" />
                <span class="nav-text">Submission</span>
              </router-link>
            </li>
            <li class="nav-item" :class="{ active: $route.name === 'about' }">
              <router-link to="/about" class="nav-link">
                <font-awesome-icon :icon="['fas', 'info-circle']" class="nav-icon" />
                <span class="nav-text">About</span>
              </router-link>
            </li>
          </ul>

          <!-- 移动端菜单按钮 -->
          <div class="mobile-menu-toggle" @click="toggleMobileMenu">
            <font-awesome-icon :icon="['fas', mobileMenuOpen ? 'times' : 'bars']" />
          </div>
        </nav>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div class="mobile-menu" :class="{ active: mobileMenuOpen }">
      <div class="mobile-menu-content">
        <ul class="mobile-nav-menu">
          <li class="mobile-nav-item" v-for="item in navItems" :key="item.name">
            <router-link :to="item.path" class="mobile-nav-link" :class="{ active: $route.name === item.name }"
              @click="closeMobileMenu">
              <font-awesome-icon :icon="item.icon" class="mobile-nav-icon" />
              <span class="mobile-nav-text">{{ item.label }}</span>
            </router-link>
          </li>

          <!-- Explore submenu for mobile -->
          <li class="mobile-nav-item mobile-submenu">
            <div class="mobile-nav-link mobile-submenu-header" @click="toggleExploreSubmenu">
              <font-awesome-icon :icon="['fas', 'chart-line']" class="mobile-nav-icon" />
              <span class="mobile-nav-text">Explore</span>
              <font-awesome-icon :icon="['fas', 'chevron-down']" class="mobile-submenu-arrow"
                :class="{ expanded: exploreSubmenuOpen }" />
            </div>
            <ul class="mobile-submenu-items" :class="{ expanded: exploreSubmenuOpen }">
              <li class="mobile-submenu-item">
                <router-link to="/network-explore" class="mobile-nav-link" @click="closeMobileMenu">
                  <font-awesome-icon :icon="['fas', 'project-diagram']" class="mobile-nav-icon" />
                  <span class="mobile-nav-text">Network Analysis</span>
                </router-link>
              </li>
              <li class="mobile-submenu-item">
                <router-link to="/umap" class="mobile-nav-link" @click="closeMobileMenu">
                  <font-awesome-icon :icon="['fas', 'map']" class="mobile-nav-icon" />
                  <span class="mobile-nav-text">UMAP Explorer</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </div>

    <!-- 移动端遮罩 -->
    <div class="mobile-menu-overlay" :class="{ active: mobileMenuOpen }" @click="closeMobileMenu"></div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const mobileMenuOpen = ref(false)
const showExploreDropdown = ref(false)
const exploreSubmenuOpen = ref(false)

const navItems = [
  { name: 'home', path: '/', label: 'Home', icon: ['fas', 'home'] },
  { name: 'biomarkers', path: '/biomarkers', label: 'Biomarkers', icon: ['fas', 'list'] },
  { name: 'advanced', path: '/advanced', label: 'Advanced Search', icon: ['fas', 'search-plus'] },
  { name: 'download', path: '/download', label: 'Download', icon: ['fas', 'download'] },
  { name: 'submission', path: '/submission', label: 'Submission', icon: ['fas', 'upload'] },
  { name: 'about', path: '/about', label: 'About', icon: ['fas', 'info-circle'] }
]

// Computed property to check if any explore route is active
const isExploreActive = computed(() => {
  return route.name === 'network-explore' || route.name === 'umap'
})

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const toggleExploreSubmenu = () => {
  exploreSubmenuOpen.value = !exploreSubmenuOpen.value
}
</script>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: white;
  box-shadow: var(--shadow-md);
}

/* 顶部横幅区域 */
.header-banner {
  background: var(--primary-gradient);
  color: white;
  padding: var(--spacing-lg) 0;
  position: relative;
  overflow: hidden;
}

.banner-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.banner-content {
  position: relative;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.logo-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  margin: 0;
  font-size: 2.5rem;
  font-weight: 700;
  font-family: var(--font-family-heading);
  line-height: 1;
}

.logo-title a {
  color: white;
  text-decoration: none;
  transition: all var(--transition-normal);
}

.logo-title a:hover {
  color: var(--secondary-color);
  text-shadow: 0 0 20px rgba(100, 181, 246, 0.5);
}

.logo-subtitle {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-sm);
  opacity: 0.9;
  font-weight: 500;
}

.header-stats {
  display: flex;
  gap: var(--spacing-xl);
}

.stat-item {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: var(--spacing-md);
  border-radius: var(--radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 100px;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--secondary-color);
  line-height: 1;
}

.stat-label {
  font-size: var(--font-size-sm);
  opacity: 0.9;
  margin-top: var(--spacing-xs);
}

/* 导航菜单区域 */
.navigation-bar {
  background: white;
  border-bottom: 1px solid var(--border-light);
  padding: 0;
}

.main-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.nav-menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--spacing-xs);
}

.nav-item {
  position: relative;
}

.nav-item.dropdown {
  position: relative;
}

.dropdown-arrow {
  margin-left: 5px;
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.nav-item.dropdown:hover .dropdown-arrow {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  min-width: 200px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  padding: 8px 0;
  z-index: 1000;
  opacity: 0;
  visibility: hidden;
  transform: translateY(10px);
  transition: all 0.3s ease;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 10px 20px;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.dropdown-item.router-link-active {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.dropdown-icon {
  margin-right: 10px;
  font-size: 1rem;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-md) var(--spacing-lg);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  font-size: var(--font-size-base);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--primary-gradient);
  opacity: 0;
  transition: opacity var(--transition-normal);
  z-index: -1;
}

.nav-link:hover::before,
.nav-item.active .nav-link::before {
  opacity: 1;
}

.nav-link:hover,
.nav-item.active .nav-link {
  color: white;
  transform: translateY(0px);
}

.nav-icon {
  font-size: 1.1rem;
}

.nav-text {
  font-family: var(--font-family-base);
}

/* 移动端菜单按钮 */
.mobile-menu-toggle {
  display: none;
  width: 44px;
  height: 44px;
  background: var(--primary-gradient);
  color: white;
  border-radius: var(--radius-md);
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.2rem;
  transition: all var(--transition-normal);
}

.mobile-menu-toggle:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

/* 移动端菜单 */
.mobile-menu {
  position: fixed;
  top: 0;
  right: -100%;
  width: 280px;
  height: 100vh;
  background: white;
  box-shadow: var(--shadow-xl);
  transition: right var(--transition-normal);
  z-index: 1001;
}

.mobile-menu.active {
  right: 0;
}

.mobile-menu-content {
  padding: var(--spacing-xl) 0;
  height: 100%;
  overflow-y: auto;
}

.mobile-nav-menu {
  list-style: none;
  margin: 0;
  padding: 0;
}

.mobile-nav-item {
  border-bottom: 1px solid var(--border-light);
}

.mobile-nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-lg) var(--spacing-xl);
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
  transition: all var(--transition-normal);
}

.mobile-nav-link:hover,
.mobile-nav-link.active {
  background: var(--bg-tertiary);
  color: var(--primary-color);
}

.mobile-nav-icon {
  font-size: 1.2rem;
  width: 20px;
}

.mobile-nav-text {
  font-size: var(--font-size-base);
}

/* Mobile Submenu Styles */
.mobile-submenu {
  border-bottom: 1px solid var(--border-light);
}

.mobile-submenu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-submenu-arrow {
  transition: transform 0.3s ease;
}

.mobile-submenu-arrow.expanded {
  transform: rotate(180deg);
}

.mobile-submenu-items {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
  background: rgba(0, 0, 0, 0.02);
}

.mobile-submenu-items.expanded {
  max-height: 200px;
}

.mobile-submenu-item {
  padding-left: 20px;
}

/* 移动端遮罩 */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  visibility: hidden;
  transition: all var(--transition-normal);
  z-index: 1000;
}

.mobile-menu-overlay.active {
  opacity: 1;
  visibility: visible;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .header-stats {
    gap: var(--spacing-lg);
  }

  .stat-item {
    min-width: 80px;
    padding: var(--spacing-sm);
  }

  .stat-number {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .banner-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    text-align: center;
  }

  .logo-section {
    justify-content: center;
  }

  .header-stats {
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--spacing-md);
  }

  .logo-title {
    font-size: 2rem;
  }

  .nav-menu {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }
}

@media (max-width: 480px) {
  .header-banner {
    padding: var(--spacing-md) 0;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
    font-size: 1.5rem;
  }

  .logo-title {
    font-size: 1.8rem;
  }

  .header-stats {
    gap: var(--spacing-sm);
  }

  .stat-item {
    min-width: 70px;
    padding: var(--spacing-xs);
  }

  .stat-number {
    font-size: 1.2rem;
  }

  .stat-label {
    font-size: var(--font-size-xs);
  }
}

/* 动画效果 */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}

.mobile-menu.active .mobile-menu-content {
  animation: slideInRight 0.3s ease-out;
}

/* 滚动时的样式变化 */
.app-header.scrolled {
  box-shadow: var(--shadow-lg);
}

.app-header.scrolled .header-banner {
  padding: var(--spacing-sm) 0;
}

.app-header.scrolled .logo-title {
  font-size: 2rem;
}

.app-header.scrolled .logo-icon {
  width: 50px;
  height: 50px;
  font-size: 1.5rem;
}

.app-header.scrolled .stat-item {
  padding: var(--spacing-sm);
}
</style>
