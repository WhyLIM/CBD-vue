import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Biomarkers from '../views/Biomarkers.vue'
import BiomarkerDetail from '../views/BiomarkerDetail.vue'
import AdvancedSearch from '../views/AdvancedSearch.vue'
import Submission from '../views/Submission.vue'
import Download from '../views/Download.vue'
import Explore from '../views/Explore.vue'
import About from '../views/About.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/biomarkers',
      name: 'biomarkers',
      component: Biomarkers
    },
    {
      path: '/biomarkers/:id',
      name: 'biomarker-detail',
      component: BiomarkerDetail,
      props: true
    },
    {
      path: '/advanced',
      name: 'advanced',
      component: AdvancedSearch
    },
    {
      path: '/submission',
      name: 'submission',
      component: Submission
    },
    {
      path: '/download',
      name: 'download',
      component: Download
    },
    {
      path: '/explore',
      name: 'explore',
      component: Explore
    },
    {
      path: '/about',
      name: 'about',
      component: About
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/About.vue')
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // 始终滚动到顶部
    return { top: 0 };
  }
})

export default router