/*
 * @Author: Mli-TB mli.bio@outlook.com
 * @Date: 2025-08-04 11:59:27
 * @LastEditors: Mli-TB mli.bio@outlook.com
 * @LastEditTime: 2025-11-26 16:25:58
 * @FilePath: \CBD3-vue\CBD-frontend\src\router\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import { createRouter, createWebHistory } from 'vue-router'
const Home = () => import('../views/Home.vue')
const Biomarkers = () => import('../views/Biomarkers.vue')
const BiomarkerDetail = () => import('../views/BiomarkerDetail.vue')
const AdvancedSearch = () => import('../views/AdvancedSearch.vue')
const Submission = () => import('../views/Submission.vue')
const Download = () => import('../views/Download.vue')
const NetworkExplore = () => import('../views/NetworkExplore.vue')
const UMAPExplorer = () => import('../views/UMAPExplorer.vue')
const About = () => import('../views/About.vue')

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
      path: '/network-explore',
      name: 'network-explore',
      component: NetworkExplore
    },
    {
      path: '/umap',
      name: 'umap',
      component: UMAPExplorer
    },
    {
      path: '/about',
      name: 'about',
      component: About
    }
  ],
  scrollBehavior() {
    // 始终滚动到顶部
    return { top: 0 };
  }
})

export default router
