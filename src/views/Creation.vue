<template>
  <div class="ocean-world">
    
    <!-- 非相机模式下的 UI -->
    <div class="page-content" v-show="currentTab !== 'camera'">
      <div class="header-area">
        <h1 class="main-title">✨ 魔法贴纸工坊</h1>
        <p class="subtitle">制作透明贴纸 -> 开启摄像头 -> 伸出食指控制！</p>
        <p class="subtitle">tip：可以点击右上角用食指和拇指改变贴图大小（等待3s固定大小），然后用另一只手比OK截图</p>
      </div>

      <div class="tab-header">
        <button class="tab-btn" :class="{ active: currentTab === 'workshop' }" @click="currentTab = 'workshop'">🪄 制作工坊</button>
        <button class="tab-btn" :class="{ active: currentTab === 'gallery' }" @click="currentTab = 'gallery'">📂 我的贴纸集</button>
      </div>

      <!-- WORKSHOP & GALLERY 内容保持不变 -->
      <div v-show="currentTab === 'workshop'" class="view-container">
         <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          @change="onFileSelect"
          style="display: none"
        />
        <div v-if="!hasImage" class="upload-section">
          <label class="upload-card" @click="triggerNewImage">
            <div class="icon">📂</div>
            <h3>点击上传图片</h3>
          </label>
        </div>
        <div v-else class="editor-section">
          <div class="canvas-wrapper shadow-box" ref="containerRef"
               @pointerdown="handlePointerDown" @pointermove="handlePointerMove" @pointerup="handlePointerUp">
            <div class="grid-bg"></div>
            <canvas ref="canvasRef" class="magic-canvas"></canvas>
            <div v-if="step === 1 && selectionBox" class="selection-box" :style="selectionStyle"></div>
          </div>

          <div class="toolbar">
            <div class="new-row" v-if="hasImage">
              <button class="btn new-btn" @click="triggerNewImage">🆕 新建图片</button>
            </div>
            <div v-if="step === 1" class="step-actions">
              <button class="btn confirm-btn" @click="confirmCrop" :disabled="!selectionBox">✂️ 确认裁剪</button>
              <button class="btn cancel-btn" @click="resetImage">❌ 取消</button>
            </div>
            <div v-if="step === 2" class="step-actions column-layout">
              <!-- 🧽 橡皮擦模式切换 -->
              <div class="mode-row">
                <button
                  class="btn mode-btn"
                  :class="{ active: eraseMode === 'magic' }"
                  @click="eraseMode = 'magic'"
                >
                  ✨ 智能擦除
                </button>
                <button
                  class="btn mode-btn"
                  :class="{ active: eraseMode === 'free' }"
                  @click="eraseMode = 'free'"
                >
                  ✏️ 自由擦除
                </button>
              </div>

              <!-- 🎛 不同模式下的力度/半径调节 -->
              <div class="slider-row" v-if="eraseMode === 'magic'">
                <span>擦除容差：{{ tolerance }}</span>
                <input type="range" min="5" max="80" v-model.number="tolerance" />
              </div>

              <div class="slider-row" v-else>
                <span>笔刷半径：{{ eraseRadius }}</span>
                <input type="range" min="5" max="80" v-model.number="eraseRadius" />
              </div>

              <!-- 操作按钮 -->
              <div class="btn-row">
                <button class="btn undo-btn" @click="undo" :disabled="historyStep <= 0">
                  ↩️ 撤销
                </button>
                <button class="btn download-btn" @click="downloadSticker">
                  ⬇️ 下载PNG
                </button>
                <button class="btn save-btn" @click="saveSticker">
                  💾 保存并体验
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-show="currentTab === 'gallery'" class="view-container">
        <div class="gallery-grid">
          <div v-for="(item, idx) in gallery" :key="item.id" class="gallery-card">
            <div class="img-display"><img :src="item.url" /></div>
            <div class="card-actions">
              <button class="action-btn camera" @click="enterCameraMode(item.url)">📸 AI 驱动</button>
              <button class="action-btn edit" @click="editSticker(item.url)">✂️ 再处理</button>
              <button class="action-btn del" @click="deleteSticker(idx)">🗑️</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🔥 TAB 3: AI 相机全屏模式 -->
    <div v-if="currentTab === 'camera'" class="camera-fullscreen">
      
      <!-- 1. 视频流 (用于显示) -->
      <video ref="videoRef" class="camera-video" playsinline></video>
      
      <!-- 2. AI 加载遮罩 -->
      <div v-if="!isModelReady" class="loading-mask">
        <div class="spinner"></div>
        <p>正在下载 AI 模型...</p>
        <p class="sub-text">首次加载约需 10-20 秒，请耐心等待</p>
      </div>

      <!-- 3. 贴纸层 -->
      <div v-if="activeSticker && isModelReady" class="sticker-container">
        <!-- 贴纸本体 -->
        <div 
          class="sticker-layer"
          :style="{ 
            transform: `translate(${stickerPos.x}px, ${stickerPos.y}px) scale(${stickerScale})` 
          }"
        >
          <img :src="activeSticker" class="draggable-sticker" />
        </div>

        <!-- 手指追踪点 (视觉反馈) -->
        <div 
          class="finger-dot" 
          v-if="isHandDetected"
          :style="{ transform: `translate(${fingerRawPos.x}px, ${fingerRawPos.y}px)` }"
        ></div>
      </div>

      <!-- 在 camera-ui 内部 -->
      <div class="camera-ui" v-if="isModelReady">
  
        <div class="top-bar">
          <button class="glass-btn" @click="exitCameraMode">❌ 关闭</button>
          <button 
            class="glass-btn zoom-btn" 
            :class="{ active: isZoomMode }" 
            @click="isZoomMode ? isZoomMode = false : startZoomMode()"
          >
            {{ isZoomMode ? '🔓 缩放中' : '🔒 大小锁定' }}
          </button>
        </div>

        <!-- 🔥 倒计时遮罩层 -->
        <div v-if="isCountingDown" class="countdown-overlay">
          <div class="countdown-number">{{ countdownNum }}</div>
          <div class="countdown-text">保持姿势！</div>
        </div>

        <!-- 底部提示栏 -->
        <div class="bottom-tip">
          <!-- 状态 1: 正在倒计时 -->
          <div v-if="isCountingDown">
            📸 正在拍照...
          </div>
          
          <!-- 状态 2: 识别到 OK 手势 (准备触发) -->
          <div v-else-if="okGestureTimer > 0" style="color: #00ff00; font-weight: bold;">
            👌 识别到 OK！保持 1 秒...
          </div>
          
          <!-- 状态 3: 普通状态 -->
          <div v-else>
            <span class="highlight">一只手</span> 拿贴纸，<span class="highlight">另一只手</span> 比 OK 拍照
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onUnmounted, watch } from 'vue';

const fileInputRef = ref(null);      // 隐藏文件选择框

const isErasing = ref(false);         // 是否正在擦除
const eraseRadius = ref(20);          // 擦除笔刷半径（可调）
const eraseMode = ref('magic');       // 'magic' 智能擦除 | 'free' 自由擦除

const isCountingDown = ref(false); // 是否正在倒计时
const countdownNum = ref(3);       // 倒计时数字
const okGestureTimer = ref(0);     // OK手势保持计时器
// ... 其他变量 ...
const debugInfo = ref({ dist: 0, delta: 0, timer: 0 }); // 🐞 调试信息
const isZoomMode = ref(false); // 是否处于缩放模式
const lastActivityTime = ref(0); // 上次检测到手指移动的时间戳
const previousHandsPos = ref(null); // 上一帧手指的位置 (用于计算有没有动)
const stickerScale = ref(1); // 控制贴纸大小，默认 1 倍

// --- 基础状态 ---
const currentTab = ref('workshop');
const hasImage = ref(false);
const step = ref(1);
const tolerance = ref(30);

// ✅ 贴纸集（每个用户 / 游客各自一份）
const gallery = ref([]);

// 🔑 本地存储 key 前缀
const STORAGE_PREFIX = 'magic_stickers_ai_';

// 根据当前登录状态返回对应的 key：guest / 用户名
const getStorageKey = () => {
  const raw = localStorage.getItem('currentUser');
  if (!raw) {
    // 未登录 = 游客
    return STORAGE_PREFIX + 'guest';
  }
  try {
    const user = JSON.parse(raw);
    const username = user?.username || 'guest';
    return STORAGE_PREFIX + username;
  } catch (e) {
    return STORAGE_PREFIX + 'guest';
  }
};

// 从 localStorage 加载当前用户的贴纸集
const loadGallery = () => {
  const key = getStorageKey();
  const saved = localStorage.getItem(key);
  if (saved) {
    try {
      gallery.value = JSON.parse(saved);
    } catch (e) {
      gallery.value = [];
    }
  } else {
    gallery.value = [];
  }
};

// Canvas 相关
const canvasRef = ref(null);
const containerRef = ref(null);
const ctx = ref(null);
const selectionBox = ref(null);
const history = ref([]);
const historyStep = ref(-1);
const isDragging = ref(false);
const startPos = ref({ x:0, y:0 });

// --- AI & 相机状态 ---
const videoRef = ref(null);
const activeSticker = ref(null);
const isModelReady = ref(false);
const isHandDetected = ref(false);

// 坐标系统
const stickerPos = ref({ x: 0, y: 0 }); // 贴纸位置 (经过平滑处理)
const fingerRawPos = ref({ x: 0, y: 0 }); // 手指红点位置

// AI 核心对象
let hands = null;
let camera = null;

onMounted(() => {
  // ✅ 一进页面，按当前登录状态加载对应的贴纸集
  loadGallery();

  // 如果是从绣梦局页面跳过来的，会带一个 sio_last_cropped
  const incoming = localStorage.getItem('sio_last_cropped');
  if (incoming) {
    const img = new Image();
    img.onload = () => {
      hasImage.value = true;
      step.value = 1;
      selectionBox.value = null;
      initCanvas(img);
    };
    img.src = incoming;
    localStorage.removeItem('sio_last_cropped');
  }
});

// 当 tab 切回「我的贴纸集」时，再根据当前登录状态刷新一次
watch(currentTab, (val) => {
  if (val === 'gallery') {
    loadGallery();
  }
});

onUnmounted(() => {
  stopCameraSystem();
});

// ==========================================
// 🧠 AI 核心逻辑 (MediaPipe)
// ==========================================

// 1. 动态加载脚本
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.body.appendChild(s);
  });
};

// 2. 进入相机模式
const enterCameraMode = async (url) => {
  activeSticker.value = url || (gallery.value[0]?.url);
  if (!activeSticker.value) return;

  currentTab.value = 'camera';
  isModelReady.value = false;
  
  await nextTick();
  
  try {
    await Promise.all([
      loadScript('/ai/camera_utils.js'),
      loadScript('/ai/hands.js')
    ]);
    
    initMediaPipe();
  } catch (e) {
    console.error(e);
    alert('AI 模型加载失败，请检查 public/ai 文件夹下是否有完整文件');
    exitCameraMode();
  }
};

// 3. 初始化 AI
const initMediaPipe = () => {
  const videoElement = videoRef.value;
  
  hands = new window.Hands({
    locateFile: (file) => {
      return `/ai/${file}`;
    }
  });

  hands.setOptions({
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7
  });

  hands.onResults(onResults);

  camera = new window.Camera(videoElement, {
    onFrame: async () => {
      await hands.send({image: videoElement});
    },
    width: 1280,
    height: 720
  });
  camera.start();
};

// 4. 处理识别结果
const onResults = (results) => {
  if (!isModelReady.value) isModelReady.value = true;
  
  if (isCountingDown.value) {
    return;
  }

  const handsFound = results.multiHandLandmarks;

  if (!handsFound || handsFound.length === 0) {
    isHandDetected.value = false;
    checkAutoExit();
    okGestureTimer.value = 0;
    return;
  }

  isHandDetected.value = true;

  let mainHand = null;
  let secondHand = null;

  if (handsFound.length === 1) {
    mainHand = handsFound[0];
  } else {
    const stickerCX = stickerPos.value.x + 100;
    const stickerCY = stickerPos.value.y + 100;

    let minDist = Infinity;
    let mainIndex = 0;

    handsFound.forEach((h, i) => {
      const hx = (1 - h[8].x) * window.innerWidth;
      const hy = h[8].y * window.innerHeight;
      const d = Math.sqrt((hx - stickerCX) ** 2 + (hy - stickerCY) ** 2);
      if (d < minDist) {
        minDist = d;
        mainIndex = i;
      }
    });

    mainHand = handsFound[mainIndex];
    secondHand = handsFound[mainIndex === 0 ? 1 : 0];
  }

  if (mainHand) {
    const indexTip = mainHand[8];
    const thumbTip = mainHand[4];

    const targetX = (1 - indexTip.x) * window.innerWidth;
    const targetY = indexTip.y * window.innerHeight;

    stickerPos.value = {
      x: stickerPos.value.x * 0.85 + (targetX - 100) * 0.15,
      y: stickerPos.value.y * 0.85 + (targetY - 100) * 0.15
    };
    fingerRawPos.value = { x: targetX, y: targetY };

    if (isZoomMode.value) {
      const dx = ((1 - indexTip.x) - (1 - thumbTip.x)) * window.innerWidth;
      const dy = (indexTip.y - thumbTip.y) * window.innerHeight;
      const currentDist = Math.sqrt(dx*dx + dy*dy);

      let targetScale = currentDist / 100;
      if (targetScale < 0.3) targetScale = 0.3;
      if (targetScale > 3.0) targetScale = 3.0;

      stickerScale.value = stickerScale.value * 0.9 + targetScale * 0.1;

      let delta = 0;
      if (previousHandsPos.value !== null) {
        delta = Math.abs(currentDist - previousHandsPos.value);
        if (delta > 16) { 
          lastActivityTime.value = Date.now(); 
        }
      }
      previousHandsPos.value = currentDist;
      
      const timePassed = Date.now() - lastActivityTime.value;
      debugInfo.value = {
        dist: Math.round(currentDist),
        delta: delta.toFixed(2),
        timer: (3000 - timePassed)
      };
      checkAutoExit();
    }
  }

  if (secondHand) {
    const h2_index = secondHand[8];
    const h2_thumb = secondHand[4];
    
    const dx2 = ((1 - h2_index.x) - (1 - h2_thumb.x)) * window.innerWidth;
    const dy2 = (h2_index.y - h2_thumb.y) * window.innerHeight;
    const dist2 = Math.sqrt(dx2*dx2 + dy2*dy2);

    if (dist2 < 60) {
      if (okGestureTimer.value === 0) {
        okGestureTimer.value = Date.now();
      } 
      else if (Date.now() - okGestureTimer.value > 1000) {
        startSnapshotCountdown();
        okGestureTimer.value = 0; 
      }
    } else {
      okGestureTimer.value = 0;
    }
  } else {
    okGestureTimer.value = 0;
  }
};

// 点击「新建图片」或上传卡片
const triggerNewImage = () => {
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.click();
  }
};

// 从贴纸集里重新打开进行处理
const editSticker = (url) => {
  if (!url) return;
  const img = new Image();
  img.onload = () => {
    currentTab.value = 'workshop';
    initCanvas(img);
  };
  img.src = url;
};

// 下载当前处理后的图片
const downloadSticker = () => {
  const cvs = canvasRef.value;
  if (!cvs) return;
  const link = document.createElement('a');
  link.href = cvs.toDataURL('image/png');
  link.download = `sticker_${Date.now()}.png`;
  link.click();
};

// 开始 3 秒倒计时
const startSnapshotCountdown = () => {
  if (isCountingDown.value) return;
  
  isCountingDown.value = true;
  countdownNum.value = 3;

  const timer = setInterval(() => {
    countdownNum.value--;
    if (countdownNum.value <= 0) {
      clearInterval(timer);
      takeSnapshot();
      isCountingDown.value = false;
    }
  }, 1000);
};

// 执行截图
const takeSnapshot = () => {
  const canvas = document.createElement('canvas');
  const w = window.innerWidth;
  const h = window.innerHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  const video = videoRef.value;
  ctx.save();
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();

  const img = new Image();
  img.crossOrigin = "Anonymous";
  img.src = activeSticker.value;
  
  img.onload = () => {
    const baseSize = 200; 
    const currentSize = baseSize * stickerScale.value;
    const x = stickerPos.value.x - currentSize / 2;
    const y = stickerPos.value.y - currentSize / 2;

    ctx.drawImage(img, x, y, currentSize, currentSize);

    const link = document.createElement('a');
    link.download = `MagicSticker_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };
};

const checkAutoExit = () => {
  if (!isZoomMode.value) return;
  
  const idleTime = Date.now() - lastActivityTime.value;
  if (idleTime > 3000) {
    isZoomMode.value = false;
    previousHandsPos.value = null;
  }
};

const stopCameraSystem = () => {
  if (camera) camera.stop();
  if (hands) hands.close();
  camera = null;
  hands = null;
};

const exitCameraMode = () => {
  stopCameraSystem();
  currentTab.value = 'gallery';
};

// ==========================================
// 🎨 制作工坊逻辑
// ==========================================
const onFileSelect = (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => initCanvas(img);
  img.src = url;
};

const initCanvas = async (img) => {
  hasImage.value = true; step.value = 1; selectionBox.value = null;
  await nextTick();
  const cvs = canvasRef.value;
  const MAX_SIZE = 800;
  let w = img.naturalWidth, h = img.naturalHeight;
  if (w > MAX_SIZE || h > MAX_SIZE) {
    const r = w / h;
    if (w > h) { w = MAX_SIZE; h = MAX_SIZE / r; } else { h = MAX_SIZE; w = MAX_SIZE * r; }
  }
  cvs.width = w; cvs.height = h;
  ctx.value = cvs.getContext('2d', { willReadFrequently: true });
  ctx.value.drawImage(img, 0, 0, w, h);
};

const resetImage = () => { hasImage.value = false; step.value = 1; selectionBox.value = null; };

const getPos = (e) => {
  const rect = containerRef.value.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
};

const handlePointerDown = (e) => {
  if (step.value === 1) {
    isDragging.value = true;
    const p = getPos(e);
    startPos.value = p;
    selectionBox.value = { x: p.x, y: p.y, w: 0, h: 0 };
  } else if (step.value === 2) {
    if (eraseMode.value === 'free') {
      saveHistory();
      isErasing.value = true;
      freeErase(e);
    } else if (eraseMode.value === 'magic') {
      magicErase(e);
    }
  }
};

const handlePointerMove = (e) => {
  if (step.value === 1 && isDragging.value) {
    const p = getPos(e);
    const w = p.x - startPos.value.x, h = p.y - startPos.value.y;
    selectionBox.value = {
      x: w > 0 ? startPos.value.x : p.x,
      y: h > 0 ? startPos.value.y : p.y,
      w: Math.abs(w),
      h: Math.abs(h)
    };
  } else if (step.value === 2 && eraseMode.value === 'free' && isErasing.value) {
    freeErase(e);
  }
};

const handlePointerUp = () => {
  isDragging.value = false;
  isErasing.value = false;
};

const selectionStyle = computed(() => {
  if (!selectionBox.value) return {};
  return { 
    left: selectionBox.value.x + 'px', 
    top: selectionBox.value.y + 'px', 
    width: selectionBox.value.w + 'px', 
    height: selectionBox.value.h + 'px' 
  };
});

const confirmCrop = () => {
  if (!selectionBox.value || !ctx.value) return;
  const cvs = canvasRef.value;
  const rect = cvs.getBoundingClientRect();
  const scaleX = cvs.width / rect.width, scaleY = cvs.height / rect.height;
  const sx = selectionBox.value.x * scaleX, sy = selectionBox.value.y * scaleY;
  const sw = selectionBox.value.w * scaleX, sh = selectionBox.value.h * scaleY;
  const imgData = ctx.value.getImageData(sx, sy, sw, sh);
  cvs.width = sw; cvs.height = sh;
  ctx.value.putImageData(imgData, 0, 0);
  step.value = 2; history.value = []; historyStep.value = -1; saveHistory();
};

const magicErase = (e) => {
  const cvs = canvasRef.value;
  const rect = cvs.getBoundingClientRect();
  const scaleX = cvs.width / rect.width, scaleY = cvs.height / rect.height;
  const x = Math.floor((e.clientX - rect.left) * scaleX), y = Math.floor((e.clientY - rect.top) * scaleY);
  const imgData = ctx.value.getImageData(0, 0, cvs.width, cvs.height);
  const data = imgData.data, w = cvs.width, h = cvs.height;
  const idx = (y * w + x) * 4;
  const r0 = data[idx], g0 = data[idx+1], b0 = data[idx+2], a0 = data[idx+3];
  if (a0 === 0) return;
  const stack = [idx / 4], visited = new Uint8Array(w * h), tol = tolerance.value;
  while(stack.length) {
    const i = stack.pop();
    if(visited[i]) continue;
    visited[i] = 1;
    const px = i * 4;
    const diff = Math.abs(data[px] - r0) + Math.abs(data[px+1] - g0) + Math.abs(data[px+2] - b0);
    if (diff <= tol && data[px+3] !== 0) {
      data[px+3] = 0;
      const cx = i % w, cy = Math.floor(i / w);
      if(cx > 0) stack.push(i-1); if(cx < w-1) stack.push(i+1); if(cy > 0) stack.push(i-w); if(cy < h-1) stack.push(i+w);
    }
  }
  ctx.value.putImageData(imgData, 0, 0);
  saveHistory();
};

const freeErase = (e) => {
  const cvs = canvasRef.value;
  const rect = cvs.getBoundingClientRect();
  const scaleX = cvs.width / rect.width;
  const scaleY = cvs.height / rect.height;

  const x = Math.floor((e.clientX - rect.left) * scaleX);
  const y = Math.floor((e.clientY - rect.top) * scaleY);

  const imgData = ctx.value.getImageData(0, 0, cvs.width, cvs.height);
  const data = imgData.data;
  const r = eraseRadius.value;

  for (let dy = -r; dy <= r; dy++) {
    for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue;

      const px = x + dx;
      const py = y + dy;

      if (px < 0 || py < 0 || px >= cvs.width || py >= cvs.height) continue;

      const idx = (py * cvs.width + px) * 4;
      data[idx + 3] = 0;
    }
  }

  ctx.value.putImageData(imgData, 0, 0);
};

const saveHistory = () => {
  if (historyStep.value < history.value.length - 1) history.value = history.value.slice(0, historyStep.value + 1);
  history.value.push(ctx.value.getImageData(0, 0, canvasRef.value.width, canvasRef.value.height));
  historyStep.value++;
};

const undo = () => { 
  if (historyStep.value > 0) { 
    historyStep.value--; 
    ctx.value.putImageData(history.value[historyStep.value], 0, 0); 
  } 
};

// ✅ 保存贴纸：按当前用户 / 游客各存各的
const saveSticker = () => {
  const url = canvasRef.value.toDataURL('image/png');
  const newItem = { id: Date.now(), url };
  gallery.value.unshift(newItem);
  const key = getStorageKey();
  localStorage.setItem(key, JSON.stringify(gallery.value));
  enterCameraMode(newItem.url);
};

// ✅ 删除贴纸：同样按当前 key 更新
const deleteSticker = (idx) => {
  if(confirm('删除?')) {
    gallery.value.splice(idx, 1);
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(gallery.value));
  }
};

const startZoomMode = () => {
  isZoomMode.value = true;
  lastActivityTime.value = Date.now();
  previousHandsPos.value = null;
};
</script>


<style scoped>
/* 保持原有工坊样式，省略部分重复代码以节省空间，核心布局不变 */
.ocean-world {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 50%, #4dd0e1 100%);
  font-family: 'Segoe UI', 'Nunito', sans-serif;
  padding-bottom: 20px;
  box-sizing: border-box;
  color: #006064;
}

.page-content {
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px 20px;
  text-align: center;
  position: relative;
  z-index: 10;
}

.main-title {
  color: #006064;
  margin-bottom: 8px;
}

.subtitle {
  color: #007c91;
  margin-bottom: 20px;
}

/* tab 改成玻璃海洋风 */
.tab-header {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-bottom: 20px;
}

.tab-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  color: #006064;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  transition: 0.2s;
}

.tab-btn.active {
  background: linear-gradient(135deg, #4dd0e1 0%, #00bcd4 100%);
  color: #ffffff;
  box-shadow: 0 4px 10px rgba(0, 188, 212, 0.5);
  transform: translateY(-1px);
}

/* 上传卡片 & 工坊盒子玻璃化一点 */
.upload-card {
  height: 250px;
  border: 2px dashed #00bcd4;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.7);
  margin-top: 20px;
  cursor: pointer;
  transition: 0.2s;
}

.upload-card:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: translateY(-2px);
}

.canvas-wrapper {
  position: relative;
  display: inline-block;
  border: 4px solid white;
  box-shadow: 0 10px 20px rgba(0,0,0,0.15);
  background: #e0f7fa;
  user-select: none;
  border-radius: 10px;
}

/* 通用按钮改成海洋主题 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  margin: 0 5px;
  color: white;
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
  transition: 0.2s;
}

.confirm-btn { background: linear-gradient(135deg, #4caf50, #2e7d32); }
.cancel-btn { background: linear-gradient(135deg, #ef5350, #d32f2f); }
.undo-btn   { background: linear-gradient(135deg, #ffe082, #ffca28); color: #4e342e; }
.save-btn   { background: linear-gradient(135deg, #4dd0e1, #00bcd4); }

.btn:disabled {
  opacity: 0.6;
  box-shadow: none;
  cursor: not-allowed;
}


/* 上传卡片与编辑区 */

.grid-bg { position: absolute; inset: 0; background-image: linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee), linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee); background-size: 20px 20px; }
.magic-canvas { position: relative; z-index: 1; max-width: 100%; max-height: 50vh; }
.selection-box { position: absolute; border: 2px dashed #ffeaa7; background: rgba(255, 234, 167, 0.3); z-index: 2; pointer-events: none;}
.toolbar { margin-top: 15px; padding: 15px; background: white; border-radius: 12px; }


.step-actions { display: flex; justify-content: center; } .column-layout { flex-direction: column; gap: 10px; }
.gallery-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; padding: 10px; }
.gallery-card { background: white; padding: 8px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); }
.img-display { height: 120px; background: #f0f0f0; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.img-display img { max-width: 100%; max-height: 100%; object-fit: contain; }
.card-actions { display: flex; gap: 5px; }
.action-btn { flex: 1; border: none; padding: 6px; border-radius: 4px; cursor: pointer; color: white; font-weight: bold; font-size: 12px; }
.action-btn.camera { background: linear-gradient(135deg, #6c5ce7, #a29bfe); }
.action-btn.del { background: #ff7675; flex: 0 0 30px; }

/* ========================================= */
/* 🔥 AI 相机全屏模式样式 */
/* ========================================= */
.camera-fullscreen {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: black; z-index: 999;
  overflow: hidden;
}

.camera-video {
  width: 100%; height: 100%; object-fit: cover;
  transform: scaleX(-1); /* 镜像翻转视频，像照镜子一样 */
}

/* 加载遮罩 */
.loading-mask {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  color: white; z-index: 50;
}
.spinner {
  width: 40px; height: 40px; border: 4px solid rgba(255,255,255,0.3); border-top-color: #0984e3; border-radius: 50%;
  animation: spin 1s linear infinite; margin-bottom: 20px;
}
@keyframes spin { to { transform: rotate(360deg); } }
.sub-text { font-size: 12px; color: #aaa; margin-top: 5px; }

/* 贴纸层 */
.sticker-layer {
  position: absolute; top: 0; left: 0; z-index: 20;
  transition: transform 0.1s linear; /* 平滑过渡 */
  pointer-events: none; /* 让鼠标事件穿透 */
}
.draggable-sticker {
  width: 200px; display: block;
  filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
}

/* 手指红点 */
.finger-dot {
  position: absolute; top: 0; left: 0;
  width: 20px; height: 20px; background: rgba(255,0,0,0.5);
  border: 2px solid white; border-radius: 50%;
  z-index: 30; pointer-events: none;
  margin-top: -10px; margin-left: -10px; /* 居中校正 */
  box-shadow: 0 0 10px red;
}

/* 相机 UI */
.camera-ui {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  pointer-events: none; z-index: 40;
}
.top-bar {
  position: absolute; top: 20px; left: 20px; right: 20px;
  display: flex; justify-content: space-between; align-items: center;
}
.glass-btn {
  background: rgba(255,255,255,0.2); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.3); color: white;
  padding: 8px 20px; border-radius: 20px; cursor: pointer; pointer-events: auto;
}
.status-badge {
  background: rgba(0,0,0,0.5); color: #aaa; padding: 6px 12px; border-radius: 15px; font-size: 14px;
}
.status-badge.active { color: #00ff00; border: 1px solid #00ff00; }
.bottom-tip {
  position: absolute; bottom: 40px; width: 100%; text-align: center;
  color: white; text-shadow: 0 2px 4px black; font-size: 16px;
}
.highlight { color: #ffeaa7; font-weight: bold; }
/* 新增样式 */
.zoom-btn {
  margin-left: 10px;
  transition: all 0.3s;
}

.zoom-btn.active {
  background: rgba(46, 204, 113, 0.6); /* 绿色激活态 */
  border-color: #2ecc71;
  box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);
}

.warning-text {
  color: #fab1a0; /* 醒目的颜色 */
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
/* 倒计时遮罩 */
.countdown-overlay {
  position: absolute; inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  z-index: 100;
  backdrop-filter: blur(2px);
}

.countdown-number {
  font-size: 150px; font-weight: 900; color: white;
  text-shadow: 0 5px 20px rgba(0,0,0,0.5);
  animation: pulseCount 1s infinite;
}

.countdown-text {
  font-size: 24px; color: white; margin-top: 10px;
}

@keyframes pulseCount {
  0% { transform: scale(0.5); opacity: 0; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(1); opacity: 0; }
}
.mode-row {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-bottom: 10px;
}

.mode-btn {
  background: #6c5ce7;
}

.mode-btn.active {
  background: #00b894;
}
.new-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.new-btn {
  background: #6c5ce7;
}

.download-btn {
  background: #00b894;
}

.action-btn.edit {
  background: #fdcb6e;
  color: #333;
}

</style>
