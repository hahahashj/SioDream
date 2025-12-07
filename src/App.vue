<template>
  <div class="app-layout">
    <!-- 全局顶部导航栏 -->
    <nav class="main-nav glass-nav">
      <div class="nav-content">
        <!-- 点击 Logo 回主页 -->
        <router-link to="/index" class="logo">🧵 SioDream</router-link>
        
        <div class="nav-links">
          <router-link to="/index" class="nav-item">主页</router-link>
          <router-link to="/workshop" class="nav-item">工坊</router-link>
          <router-link to="/products" class="nav-item">商品介绍</router-link>
          <router-link to="/creations" class="nav-item">我的创作</router-link>
          <router-link to="/about" class="nav-item">关于我们</router-link>
        </div>
      </div>
    </nav>

    <!-- 页面内容渲染区 -->
    <!-- 1. 获取 route 对象 -->
    <router-view v-slot="{ Component, route }">
      <div class="router-host">
        <!-- 2. 删除了 <transition>，解决了 fixed 定位失效导致的"只有背景无内容"问题 -->
        <!-- 3. 添加 :key，强制每次切换路由都彻底重绘组件 -->
        <component :is="Component" :key="route.fullPath" />
      </div>
    </router-view>
  </div>
</template>

<style>
/* 
  修复：导航栏高度 20px 太小了，文字都放不下。
  改为 60px，这样工坊页面的 top: calc(60px + 20px) 才能正确避开导航栏 
*/
:root {
  --nav-h: 60px; 
}

#app, .app-layout {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.router-host {
  width: 100%;
  min-height: 100vh;
}

/* 全局重置 */
body, html {
  margin: 0; padding: 0; width: 100%; height: 100%;
  font-family: 'Segoe UI', 'Nunito', sans-serif;
  overflow-x: hidden;
  background-color: #e0f7fa; 
}

/* 导航栏样式 - 玻璃拟态 */
.glass-nav {
  position: fixed;
  top: 0; left: 0; width: 100%;
  height: var(--nav-h); 
  /* line-height 移除，使用 flex 居中更稳妥 */
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 20px rgba(0, 96, 100, 0.1);
  z-index: 999; 
  display: flex;
  justify-content: center;
}

.nav-content {
  width: 90%; max-width: 1200px;
  display: flex; justify-content: space-between; align-items: center;
  height: 100%; /* 让内容撑满导航栏高度 */
}

.logo {
  font-size: 1.5rem; font-weight: bold; color: #006064;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-decoration: none;
  cursor: pointer;
}

.nav-links { display: flex; gap: 30px; }

.nav-item {
  text-decoration: none; color: #006064; font-weight: 600; font-size: 16px;
  position: relative; transition: color 0.3s;
  display: flex; align-items: center;
}

.nav-item:hover, .nav-item.router-link-active {
  color: #00bcd4;
}

.nav-item::after {
  content: ''; position: absolute; bottom: -5px; left: 0; width: 0%; height: 2px;
  background: #00bcd4; transition: width 0.3s;
}
.nav-item:hover::after, .nav-item.router-link-active::after {
  width: 100%;
}
</style>
