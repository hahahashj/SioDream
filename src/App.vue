<template>
  <div class="app-layout">
    <!-- 全局顶部导航栏 -->
    <nav class="main-nav glass-nav">
      <div class="nav-content">
        <!-- 点击 Logo 回主页 -->
        <router-link to="/index" class="logo">🧵 SioDream</router-link>

        <!-- 右侧：导航链接 + 登录 / 头像 -->
        <div class="nav-right">
          <div class="nav-links">
            <router-link to="/index" class="nav-item">主页</router-link>
            <router-link to="/workshop" class="nav-item">工坊</router-link>
            <router-link to="/products" class="nav-item">商品介绍</router-link>
            <router-link to="/creations" class="nav-item">我的创作</router-link>
            <router-link to="/about" class="nav-item">关于我们</router-link>
          </div>

          <!-- 未登录：圆形“登”按钮，跳转到 /login -->
          <router-link
            v-if="!currentUser"
            to="/login"
            class="login-btn"
          >
            登
          </router-link>

          <!-- 已登录：头像 + 下拉菜单 -->
          <div v-else class="avatar-wrap" ref="avatarWrap">
            <button
              type="button"
              class="avatar-btn"
              @click.stop="toggleMenu"
            >
              <!-- 头像图片，你可以换成本地 /public/avatar/admin.png -->
              <img
                src="/avatar/zna.png"
                alt="avatar"
                class="avatar-img"
              />
            </button>

            <div
              v-if="showMenu"
              class="avatar-menu"
              @click.stop
            >
              <div class="avatar-menu-header">
                <div class="avatar-name">
                  {{ currentUser.displayName || currentUser.username }}
                </div>
                <div class="avatar-tag">已登录</div>
              </div>

              <router-link to="/creations" class="menu-item">
                我的创作
              </router-link>
              <router-link to="/login" class="menu-item">
                登录页
              </router-link>
              <button
                type="button"
                class="menu-item danger"
                @click="logout"
              >
                退出登录
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 页面内容渲染区 -->
    <router-view v-slot="{ Component, route }">
      <div class="router-host">
        <component :is="Component" :key="route.fullPath" />
      </div>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

// 当前登录用户（null 表示未登录）
const currentUser = ref(null);
// 头像菜单是否展开
const showMenu = ref(false);
// 头像区域的 ref，用来判断点外面关闭菜单
const avatarWrap = ref(null);

const loadUserFromStorage = () => {
  const saved = localStorage.getItem('currentUser');
  if (saved) {
    try {
      currentUser.value = JSON.parse(saved);
    } catch (e) {
      currentUser.value = null;
    }
  } else {
    currentUser.value = null;
  }
};

const onDocumentClick = (e) => {
  if (!showMenu.value) return;
  if (avatarWrap.value && !avatarWrap.value.contains(e.target)) {
    showMenu.value = false;
  }
};

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const logout = () => {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('isLoggedIn');
  showMenu.value = false;
  loadUserFromStorage();
  router.push('/login');
};

onMounted(() => {
  loadUserFromStorage();
  document.addEventListener('click', onDocumentClick);
});

// 每次路由切换都重新读一下 localStorage，
// 这样从 /login 跳到 /index 时，头像会立刻出现
watch(
  () => route.fullPath,
  () => {
    loadUserFromStorage();
  }
);

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>

<style>
:root {
  --nav-h: 60px;
}

#app,
.app-layout {
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
body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  font-family: 'Segoe UI', 'Nunito', sans-serif;
  overflow-x: hidden;
  background-color: #e0f7fa;
}

/* 导航栏样式 - 玻璃拟态 */
.glass-nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: var(--nav-h);
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
  width: 90%;
  max-width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: #006064;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  cursor: pointer;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-links {
  display: flex;
  gap: 30px;
}

/* 普通导航项 */
.nav-item {
  text-decoration: none;
  color: #006064;
  font-weight: 600;
  font-size: 16px;
  position: relative;
  transition: color 0.3s;
  display: flex;
  align-items: center;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #00bcd4;
}

.nav-item::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0%;
  height: 2px;
  background: #00bcd4;
  transition: width 0.3s;
}

.nav-item:hover::after,
.nav-item.router-link-active::after {
  width: 100%;
}

/* 圆形登录按钮（router-link） */
.login-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  outline: none;
  cursor: pointer;
  background: linear-gradient(135deg, #4dd0e1 0%, #00bcd4 100%);
  color: #ffffff;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  box-shadow: 0 4px 10px rgba(0, 188, 212, 0.5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.login-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 14px rgba(0, 188, 212, 0.7);
}

/* 头像 & 菜单 */
.avatar-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.avatar-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  padding: 0;
  background: transparent;
  cursor: pointer;
}

.avatar-img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 4px 10px rgba(0, 188, 212, 0.5);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.avatar-img:hover {
  transform: scale(1.06);
  box-shadow: 0 6px 14px rgba(0, 188, 212, 0.7);
}

.avatar-menu {
  position: absolute;
  top: 48px;
  right: 0;
  min-width: 160px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 10px 24px rgba(0, 96, 100, 0.18);
  display: flex;
  flex-direction: column;
  gap: 6px;
  z-index: 2000;
}

.avatar-menu-header {
  padding: 6px 8px 4px;
  border-bottom: 1px solid rgba(0, 96, 100, 0.1);
  margin-bottom: 4px;
}

.avatar-name {
  font-size: 14px;
  font-weight: 700;
  color: #006064;
}

.avatar-tag {
  font-size: 12px;
  color: #0097a7;
}

/* 菜单项（link 和 button 用同一个类） */
.menu-item {
  text-decoration: none;
  border: none;
  background: transparent;
  text-align: left;
  padding: 8px 8px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: #006064;
  display: block;
  width: 100%;
}

.menu-item:hover {
  background: rgba(0, 188, 212, 0.12);
}

.menu-item.danger {
  color: #d32f2f;
}

.menu-item.danger:hover {
  background: rgba(211, 47, 47, 0.12);
}
</style>
