<template>
  <footer class="app-footer">
    <div class="footer-main">
      <div class="container">
        <div class="footer-content">
          <!-- 品牌信息区域 -->
          <div class="footer-brand">
            <div class="brand-logo">
              <div class="logo-icon">
                <img src="/images/favicon.png"></img>
              </div>
              <div class="brand-text">
                <h3 class="brand-title">CBD3</h3>
                <p class="brand-subtitle">Colorectal Cancer Biomarker Database</p>
              </div>
            </div>
            <p class="brand-description">
              An evidence-based biomarker data integration platform that aggregates research findings from authoritative
              journals worldwide, providing scientific evidence for clinical diagnosis, prognosis assessment, and
              personalized treatment.
            </p>
          </div>

          <!-- Quick Links -->
          <div class="footer-section">
            <h4 class="section-title">
              <font-awesome-icon :icon="['fas', 'link']" class="section-icon" />
              Quick Links
            </h4>
            <div class="partner-links">
              <a href="https://liu.se/en" target="_blank" class="partner-link">
                <img src="/images/liu-logo.svg" alt="Linköping University" class="partner-logo">
                <span class="partner-name">Linköping University</span>
              </a>
              <a href="https://www.siat.ac.cn/" target="_blank" class="partner-link">
                <img src="/images/siat-logo.svg" alt="Shenzhen Institutes of Advanced Technology" class="partner-logo">
                <span class="partner-name">SIAT (CAS)</span>
              </a>
              <a href="http://www.suda.edu.cn/" target="_blank" class="partner-link">
                <img src="/images/suda-logo.svg" alt="Soochow University" class="partner-logo">
                <span class="partner-name">Soochow University</span>
              </a>
              <a href="https://www.gdghospital.org.cn/" target="_blank" class="partner-link">
                <img src="/images/gdph-logo.svg" alt="Guangdong Provincial People's Hospital" class="partner-logo">
                <span class="partner-name">GDPH</span>
              </a>
            </div>
          </div>

          <!-- Help -->
          <div class="footer-section">
            <h4 class="section-title">
              <font-awesome-icon :icon="['fas', 'question-circle']" class="section-icon" />
              Help Information
            </h4>
            <ul class="footer-links">
              <li>
                <a @click="openHelp('Use')" href="#" class="footer-link">
                  <font-awesome-icon :icon="['fas', 'book-open']" />
                  User Guide
                </a>
              </li>
              <li>
                <a @click="openHelp('Cite')" href="#" class="footer-link">
                  <font-awesome-icon :icon="['fas', 'quote-right']" />
                  Citation Guide
                </a>
              </li>
              <li>
                <a @click="openHelp('Updatelog')" href="#" class="footer-link">
                  <font-awesome-icon :icon="['fas', 'history']" />
                  Update Log
                </a>
              </li>
              <li>
                <a @click="openHelp('Home')" href="#" class="footer-link">
                  <font-awesome-icon :icon="['fas', 'envelope']" />
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <!-- Support -->
          <div class="footer-section">
            <h4 class="section-title">
              <font-awesome-icon :icon="['fas', 'cogs']" class="section-icon" />
              Technical Support
            </h4>
            <ul class="footer-links">
              <li>
                <a href="https://github.com/WhyLIM/CBD-vue" target="_blank" class="footer-link">
                  <font-awesome-icon :icon="['fab', 'github']" />
                  Source Code
                </a>
              </li>
              <li>
                <a href="https://fontawesome.com/" target="_blank" class="footer-link">
                  <font-awesome-icon :icon="['fas', 'icons']" />
                  Icon Support
                </a>
              </li>
              <li>
                <a href="https://docsify.js.org/#/" target="_blank" class="footer-link">
                  <font-awesome-icon :icon="['fas', 'file-alt']" />
                  Documentation
                </a>
              </li>
              <li>
                <a href="https://string-db.org/cgi/help" target="_blank" class="footer-link">
                  <font-awesome-icon :icon="['fas', 'code']" />
                  API Interface
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="footer-bottom">
      <div class="container">
        <div class="bottom-content">
          <div class="copyright">
            <p class="copyright-text">
              <font-awesome-icon :icon="['fas', 'copyright']" />
              2018-{{ currentYear }} CBD3: Colorectal Cancer Biomarker Database. All rights reserved.
            </p>
            <p class="disclaimer-text">
              This database is for academic research use only and should not be used for clinical diagnosis or treatment
              decisions.
            </p>
          </div>

          <div class="social-links">
            <a href="https://github.com/WhyLIM/CBD-vue" target="_blank" class="social-link">
              <font-awesome-icon :icon="['fab', 'github']" />
            </a>
            <a href="mailto:lm@alu.suda.edu.cn" class="social-link">
              <font-awesome-icon :icon="['fas', 'envelope']" />
            </a>
            <!-- <a href="#" class="social-link">
              <font-awesome-icon :icon="['fas', 'rss']" />
            </a> -->
          </div>
        </div>
      </div>
    </div>

    <!-- 回到顶部按钮 -->
    <div class="back-to-top" :class="{ visible: showBackToTop }" @click="scrollToTop">
      <font-awesome-icon :icon="['fas', 'chevron-up']" />
    </div>
  </footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showBackToTop = ref(false)

const currentYear = computed(() => new Date().getFullYear())

const openHelp = (section) => {
  let frameurl = ''
  switch (section) {
    case 'Use':
      frameurl = 'help/index.html#/Use'
      break
    case 'Cite':
      frameurl = 'help/index.html#/Cite'
      break
    case 'Updatelog':
      frameurl = 'help/index.html#/Updatelog'
      break
    case 'Home':
      frameurl = 'help/index.html#/'
      break
  }

  // 跳转到关于页面并传递帮助文档路径
  router.push({
    name: 'about',
    query: { help: frameurl }
  })
}

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.app-footer {
  background: var(--primary-gradient);
  color: white;
  margin-top: auto;
  position: relative;
}

.footer-main {
  padding: var(--spacing-3xl) 0 var(--spacing-2xl);
  position: relative;
}

.footer-main::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
  opacity: 0.3;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: var(--spacing-2xl);
  flex-wrap: wrap;
}

.footer-brand {
  flex: 2;
  max-width: 350px;
}

.footer-section {
  flex: 1;
  min-width: 200px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.logo-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.logo-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-title {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 700;
  font-family: var(--font-family-heading);
}

.brand-subtitle {
  margin: var(--spacing-xs) 0 0 0;
  font-size: var(--font-size-sm);
  opacity: 0.9;
}

.brand-description {
  line-height: var(--line-height-relaxed);
  opacity: 0.9;
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-size-sm);
}

.brand-stats {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.stat-badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-md);
  border: 1px solid rgba(255, 255, 255, 0.2);
  text-align: center;
  min-width: 80px;
}

.stat-number {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--secondary-color);
}

.stat-label {
  display: block;
  font-size: var(--font-size-xs);
  opacity: 0.8;
  margin-top: var(--spacing-xs);
}

/* 页脚区块 */
/* .footer-section {
  display: flex;
  flex-direction: column;
} */

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin: 0 0 var(--spacing-lg) 0;
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--secondary-color);
}

.section-icon {
  font-size: 1.1rem;
}

.footer-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: var(--font-size-sm);
  padding: var(--spacing-xs) 0;
  transition: all var(--transition-normal);
  cursor: pointer;
}

.footer-link:hover {
  color: var(--secondary-color);
  transform: translateX(5px);
}

.footer-link svg {
  width: 14px;
  flex-shrink: 0;
}

/* 合作机构 */
.partner-links {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.partner-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  padding: var(--spacing-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-normal);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.partner-link:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.partner-logo {
  width: 30px;
  height: 30px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  background: white;
  padding: 2px;
}

.partner-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
}

/* 底部版权区域 */
.footer-bottom {
  background: rgba(0, 0, 0, 0.2);
  padding: var(--spacing-lg) 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.bottom-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-lg);
}

.copyright {
  flex: 1;
}

.copyright-text {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  opacity: 0.8;
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.disclaimer-text {
  margin: 0;
  font-size: var(--font-size-xs);
  opacity: 0.6;
}

.social-links {
  display: flex;
  gap: var(--spacing-md);
}

.social-link {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all var(--transition-normal);
  backdrop-filter: blur(10px);
}

.social-link:hover {
  background: rgba(255, 255, 255, 0.2);
  color: var(--secondary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* 回到顶部按钮 */
.back-to-top {
  position: fixed;
  bottom: var(--spacing-xl);
  right: var(--spacing-xl);
  width: 50px;
  height: 50px;
  background: var(--primary-gradient);
  color: white;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-normal);
  opacity: 0;
  visibility: hidden;
  transform: translateY(20px);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
}

.back-to-top.visible {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.back-to-top:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-xl);
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .footer-content {
    grid-template-columns: 1fr 1fr 1fr;
    gap: var(--spacing-xl);
  }

  .footer-brand {
    grid-column: 1 / -1;
    max-width: none;
    margin-bottom: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-lg);
  }

  .footer-main {
    padding: var(--spacing-2xl) 0 var(--spacing-xl);
  }

  .brand-logo {
    justify-content: center;
    text-align: center;
  }

  .brand-description {
    text-align: center;
  }

  .brand-stats {
    justify-content: center;
  }

  .bottom-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
}

@media (max-width: 480px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }

  .footer-main {
    padding: var(--spacing-xl) 0;
  }

  .brand-stats {
    flex-direction: column;
    align-items: center;
  }

  .stat-badge {
    min-width: 120px;
  }

  .back-to-top {
    bottom: var(--spacing-lg);
    right: var(--spacing-lg);
    width: 45px;
    height: 45px;
  }

  .social-links {
    justify-content: center;
  }
}

/* 动画效果 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.footer-section {
  animation: fadeInUp 0.6s ease-out;
}

.footer-section:nth-child(2) {
  animation-delay: 0.1s;
}

.footer-section:nth-child(3) {
  animation-delay: 0.2s;
}

.footer-section:nth-child(4) {
  animation-delay: 0.3s;
}

.footer-section:nth-child(5) {
  animation-delay: 0.4s;
}
</style>