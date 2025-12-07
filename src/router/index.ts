import { createRouter, createWebHistory } from 'vue-router'

// 引入你的组件
import Workshop from '@/views/WorkShop.vue'
import Login from '@/views/Login.vue'
import About from '@/views/About.vue'
// 简单的占位组件，用于其他还没写的页面
const Placeholder = { 
  template: `
    <div style="padding-top: 100px; text-align: center; color: #006064;">
      <h1>🚧 施工中...</h1>
      <p>这里是海洋世界的尽头，潜水员正在努力开发中。</p>
    </div>
  ` 
}

const routes = [
  { path: '/index', component: Placeholder }, // 主页暂时用占位
  { path: '/workshop', component: Workshop }, // 这里是你做好的工坊页面
  { path: '/products', component: Placeholder },
  { path: '/creations', component: Placeholder },
  { path: '/about', component: About },
  { path: '/login', component: Login }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

