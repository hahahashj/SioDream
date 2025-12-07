<template>
  <div class="about-page">
    <!-- 背景装饰 -->
    <div class="sky-container">
      <div class="cloud cloud-1">☁️</div>
      <div class="cloud cloud-2">☁️</div>
    </div>

    <div class="content-box glass-panel fade-in-up">
      
      <!-- ⭐ 核心动画区域 -->
      <div class="animation-stage">
        <!-- 动态切换的图片 -->
        <img :src="currentImageSrc" class="girl-anim" alt="Waving Girl" />
        <!-- 脚下的影子 -->
        <div class="shadow"></div>
      </div>

      <!-- 文字内容 -->
      <h1 class="title">关于我们</h1>
      <p class="subtitle">Sio Dream Workshop</p>
      
      <div class="text-body">
        <p>👋 嗨！欢迎来到Sio梦工坊。</p>
        <p>这里没有复杂的工作流，只有海风、阳光和无尽的创意。</p>
        <p>我们是浙江海洋大学的各位</p>
        <p>很高兴为你服务！</p>
      </div>

      <div class="footer-links">
        <button class="social-btn">其他配置</button>
        <button class="social-btn">其他配置</button>
      </div>
    </div>

    <!-- 🛠 隐形预加载容器 (防止第一次播放闪烁) -->
    <div style="display: none;">
      <img v-for="n in totalFrames" :key="n" :src="`/girl_frames/${n}.png`" />
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// --- ⚙️ 动画配置区域 ---
const totalFrames = 20;     // 你的图片总数
const animationSpeed = 100;  // 播放速度 (毫秒)，越小越快。80ms 大约是 12帧/秒
const fileExtension = '.png'; // 如果你的图片是 jpg，这里改成 '.jpg'
// -----------------------

const currentFrameIndex = ref(1);
let timer = null;

// 计算当前应该显示哪张图
const currentImageSrc = computed(() => {
  return `/girl_frames/${currentFrameIndex.value}${fileExtension}`;
});

// 启动动画循环
const startAnimation = () => {
  timer = setInterval(() => {
    currentFrameIndex.value++;
    // 如果超过总帧数，就回到第1帧
    if (currentFrameIndex.value > totalFrames) {
      currentFrameIndex.value = 1;
    }
  }, animationSpeed);
};

// 页面加载时启动
onMounted(() => {
  startAnimation();
});

// 页面销毁时(切换去别的页面)停止，防止内存泄漏
onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>

<style scoped>
/* 页面布局 */
.about-page {
  min-height: 100vh;
  padding-top: 100px;
  display: flex;
  justify-content: center;
  /* 海洋蓝渐变背景 */
  background: linear-gradient(180deg, #81d4fa 0%, #4fc3f7 50%, #e1f5fe 100%);
  position: relative;
  overflow: hidden;
}

/* 动画舞台 */
.animation-stage {
  position: relative;
  width: 200px; /* 根据你的图片实际宽度调整 */
  height: 250px; /* 根据你的图片实际高度调整 */
  margin: 0 auto 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
}

/* 图片本体 */
.girl-anim {
  height: 100%;       /* 让图片撑满高度 */
  object-fit: contain; /* 保持比例 */
  filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1)); /* 给人物加一点立体投影 */
}

/* 影子 */
.shadow {
  width: 100px;
  height: 10px;
  background: rgba(0,0,0,0.15);
  border-radius: 50%;
  margin-top: -5px;
  filter: blur(2px);
}

/* 玻璃面板 */
.content-box {
  width: 90%; max-width: 600px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(12px);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 15px 35px rgba(0, 100, 150, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.8);
  margin-bottom: 50px;
}

/* 文字样式 */
.title { color: #01579b; margin-bottom: 5px; }
.subtitle { color: #00bcd4; font-weight: bold; margin-bottom: 25px; letter-spacing: 1px;}
.text-body { color: #455a64; line-height: 1.8; margin-bottom: 30px; font-size: 16px; }

/* 装饰云朵 */
.cloud {
  position: absolute; font-size: 60px; opacity: 0.8;
  animation: floatCloud 25s linear infinite;
  user-select: none;
}
.cloud-1 { top: 120px; left: -10%; }
.cloud-2 { top: 180px; left: -15%; animation-duration: 35s; animation-delay: 5s; scale: 0.8;}

@keyframes floatCloud {
  0% { transform: translateX(0); }
  100% { transform: translateX(110vw); }
}

/* 按钮 */
.social-btn {
  background: white; border: none; color: #0288d1;
  padding: 10px 24px; border-radius: 25px; margin: 0 10px; cursor: pointer;
  font-weight: bold; transition: 0.3s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}
.social-btn:hover { background: #0288d1; color: white; transform: translateY(-2px); box-shadow: 0 6px 12px rgba(2,136,209,0.3); }

/* 入场动画 */
.fade-in-up { animation: fadeInUp 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; opacity: 0; transform: translateY(30px); }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }
</style>
