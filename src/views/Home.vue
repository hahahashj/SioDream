<template>
  <div class="test-page">
    <div class="status-bar">
      <h2>🖐️ 手指识别测试终端</h2>
      <p>状态: <span :class="{ active: isLoaded }">{{ statusText }}</span></p>
      <button class="btn-back" @click="$router.push('/')">返回主页</button>
    </div>

    <div class="canvas-container">
      <!-- 原始视频流 (隐藏，只用于计算) -->
      <video ref="videoRef" class="input_video" style="display: none;"></video>
      
      <!-- 绘制结果的画布 -->
      <canvas ref="canvasRef" class="output_canvas"></canvas>
      
      <!-- 加载动画 -->
      <div v-if="!isLoaded" class="loading-overlay">
        <div class="spinner"></div>
        <p>正在从 Google 下载 AI 模型...</p>
        <p class="sub-text">(首次加载可能需要 10-20 秒)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const statusText = ref('初始化中...');
const isLoaded = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);

let hands = null;
let camera = null;
let canvasCtx = null;

// --- 1. 动态加载 MediaPipe 脚本 ---
// 因为没有 npm install，我们需要手动注入脚本标签
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

onMounted(async () => {
  try {
    statusText.value = '正在加载 MediaPipe 核心文件...';
    
    // 并行加载必要的库
    await Promise.all([
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js'),
      loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js')
    ]);

    statusText.value = '模型加载完毕，启动摄像头...';
    initMediaPipe();
    
  } catch (error) {
    statusText.value = '加载失败，请检查网络 (需要能访问 jsdelivr CDN)';
    console.error(error);
  }
});

onUnmounted(() => {
  if (camera) camera.stop();
  if (hands) hands.close();
});

// --- 2. 初始化识别逻辑 ---
const initMediaPipe = () => {
  const videoElement = videoRef.value;
  const canvasElement = canvasRef.value;
  canvasCtx = canvasElement.getContext('2d');

  // 设置画布尺寸
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  // 实例化 Hands 对象 (全局变量 Hands 由 CDN 脚本提供)
  hands = new window.Hands({locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }});

  // 配置模型参数
  hands.setOptions({
    maxNumHands: 2, // 最多识别2只手
    modelComplexity: 1, // 精度 0=快, 1=中, 2=准
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
  });

  // 设置回调函数：每处理完一帧，就会调用这个函数
  hands.onResults(onResults);

  // 使用 Camera Utils 自动管理视频流
  camera = new window.Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
  });

  camera.start();
};

// --- 3. 绘制结果 ---
const onResults = (results) => {
  if (!isLoaded.value) {
    isLoaded.value = true;
    statusText.value = '识别运行中';
  }

  // 1. 准备画布
  const canvasElement = canvasRef.value;
  const width = canvasElement.width;
  const height = canvasElement.height;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, width, height);

  // 2. 绘制摄像头画面作为背景
  canvasCtx.drawImage(results.image, 0, 0, width, height);

  // 3. 如果识别到了手
  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      
      // A. 画骨架连线
      window.drawConnectors(canvasCtx, landmarks, window.HAND_CONNECTIONS,
                     {color: '#00FF00', lineWidth: 5});
      
      // B. 画所有关节红点
      window.drawLandmarks(canvasCtx, landmarks, 
                    {color: '#FF0000', lineWidth: 2});

      // C. 【重点】特意识别食指指尖 (索引为 8)
      // landmarks[8] 是归一化坐标 (0.0 ~ 1.0)，需要乘宽高转为像素坐标
      const indexFinger = landmarks[8]; 
      const x = indexFinger.x * width;
      const y = indexFinger.y * height;

      // 在食指尖画一个大光圈
      canvasCtx.beginPath();
      canvasCtx.arc(x, y, 20, 0, 2 * Math.PI);
      canvasCtx.fillStyle = "rgba(0, 255, 255, 0.7)"; // 青色光圈
      canvasCtx.fill();
      
      // 显示坐标文字
      canvasCtx.font = "20px Arial";
      canvasCtx.fillStyle = "white";
      canvasCtx.fillText(`食指: (${Math.floor(x)}, ${Math.floor(y)})`, x + 25, y);
    }
  }
  canvasCtx.restore();
};

</script>

<style scoped>
.test-page {
  position: relative;
  width: 100vw;
  height: 100vh;
  background-color: #1e1e1e;
  overflow: hidden;
}

.status-bar {
  position: absolute;
  top: 0; left: 0; width: 100%;
  padding: 15px 30px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  z-index: 100;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(5px);
}

.status-bar span.active { color: #00ff00; font-weight: bold; }

.canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.output_canvas {
  width: 100%;
  height: 100%;
  object-fit: contain; /* 保持比例，可能有黑边 */
}

/* 加载动画 */
.loading-overlay {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}
.spinner {
  width: 50px; height: 50px;
  border: 5px solid rgba(255,255,255,0.3);
  border-top-color: #00bcd4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.sub-text { font-size: 12px; color: #aaa; margin-top: 5px; }
.btn-back { padding: 8px 16px; cursor: pointer; background: #333; color: white; border: 1px solid #555; border-radius: 4px; }
</style>
