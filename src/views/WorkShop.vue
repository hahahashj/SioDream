<template>
  <!-- 最外层容器 -->
  <div class="ocean-world" @click="spawnClickBubble">
    
    <!-- 1. 背景特效层 -->
    <div class="sun-rays"></div>
    <div class="fish-container" ref="fishContainer"></div>

    <!-- 2. 页面内容层 -->
    <div class="page-content">
      <h1 class="main-title">🧵Sio.绣梦局 新绎工坊DIY</h1>

      <!-- 顶部悬浮条 -->
      <div class="sticky-bar glass-panel">
        <div class="bar-left">
          <button class="btn ocean-btn" @click.stop="showProductDrawer = true">
            打开纹样宝库 🔮
          </button>
        </div>
        
        <div class="bar-right">
          <div class="cart-summary glass-button" @click.stop="showCartDrawer = true">
            <span class="cart-icon">🛒</span>
            <span class="cart-count" v-if="cartCount > 0">{{ cartCount }}</span>
            <span class="cart-total" v-if="cartTotal > 0">¥{{ cartTotal.toFixed(2) }}</span>
          </div>
        </div>
      </div>

      <!-- 步骤一：素材裁剪 -->
      <section class="panel glass-panel fade-in-up">
        <h2 class="panel-title">
          Step 1: 挑选你的刺绣纹样
          <span v-if="currentProduct" class="badge">当前：{{ currentProduct.name }}</span>
        </h2>
        
        <div class="panel-body">
          <div class="source-selection">
            <div class="option-block" @click="showProductDrawer = true">
              <span class="icon">🪡</span> 官方素材库
            </div>
            <div class="divider"></div>
            <label class="option-block">
              <span class="icon">📄</span> 上传本地图
              <input type="file" accept="image/*" @change="onSelectLocalSource" hidden />
            </label>
          </div>

          <div class="cs-tip-box">
            💡 遇到特殊需求? 顾问可协助优化成刺绣稿
          </div>

          <!-- 绘图区 -->
          <div v-if="srcImageUrl" class="draw-wrapper">
            <div class="draw-area shadow-box">
              <img
                :src="srcImageUrl"
                ref="srcImageEl"
                class="src-img"
                @load="initDrawCanvas"
                draggable="false"
                crossorigin="anonymous"
              />
              <canvas
                ref="drawCanvas"
                class="draw-canvas"
                @pointerdown="startDraw"
                @pointermove="drawing"
                @pointerup="endDraw"
                @pointerleave="endDraw"
              ></canvas>
            </div>
            <p class="tip">✨ 用手指/鼠标圈出你喜欢的图案 ✨</p>
            <div class="btn-group">
              <button class="btn ocean-btn primary" :disabled="!canCrop" @click.stop="handleCropWithEffect">
                ✂️ 完成裁剪
              </button>
              <button class="btn ocean-btn ghost" @click.stop="clearDraw">重画</button>
            </div>
          </div>
          
          <div v-if="croppedImageUrl" class="preview-box">
            <p>已捕获贴纸：</p>
            <img :src="croppedImageUrl" class="preview-img floating-anim" />
          </div>
        </div>
      </section>

      <!-- 步骤二：背景试贴 -->
      <section class="panel glass-panel fade-in-up" style="animation-delay: 0.2s">
        <h2 class="panel-title">Step 2: 选择载体+AR预览</h2>
        <div class="panel-body">
          <div class="upload-bg-box">
            <label class="upload-btn glass-button">
              📷 选择刺绣载体
              <input type="file" accept="image/*" @change="onSelectBackgroundImage" hidden/>
            </label>
          </div>

          <div v-if="backgroundImageUrl" class="canvas-wrapper">
            <div class="canvas shadow-box" ref="bgContainer">
              <img
                ref="bgImageEl"
                :src="backgroundImageUrl"
                class="bg-img"
                @load="onBgLoaded"
                draggable="false"
              />
              <!-- 贴纸 -->
              <img
                v-if="croppedImageUrl"
                :src="croppedImageUrl"
                class="sticker"
                :style="stickerStyle"
                @pointerdown="onStickerPointerDown"
                draggable="false"
              />
            </div>
            <p class="tip" v-if="croppedImageUrl">☝️ 按住贴纸拖动，使用下方滑块调整</p>
          </div>

          <!-- 控制面板 -->
          <div v-if="croppedImageUrl && backgroundImageUrl" class="control-panel">
            <div class="sliders">
              <div class="control-row">
                <label>🔍 大小</label>
                <input type="range" min="0.1" max="2" step="0.02" v-model.number="overlay.scale" class="ocean-range"/>
              </div>
              <div class="control-row">
                <label>🔄 旋转</label>
                <input type="range" min="-180" max="180" step="1" v-model.number="overlay.rotate" class="ocean-range"/>
              </div>
            </div>

            <!-- 新增：双按钮区域 -->
            <div class="action-footer double-btn">
              <button class="btn ocean-btn download-btn" @click.stop="handleDownload">
                💾 保存图片
              </button>
              <button class="btn coral-btn add-cart-btn" @click.stop="handleAddToCartWithEffect">
                🛒 加入购物车
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- 抽屉：素材列表 -->
    <div class="drawer-mask" v-if="showProductDrawer" @click="showProductDrawer = false"></div>
    <div class="drawer left-drawer glass-drawer" :class="{ open: showProductDrawer }">
      <div class="drawer-header">
        <h3>🪡 非遗纹样库</h3>
        <button class="close-btn" @click="showProductDrawer = false">×</button>
      </div>
      <div class="product-list">
        <div 
          v-for="item in productList" 
          :key="item.id" 
          class="product-item glass-card"
          @click="selectProduct(item)"
        >
          <img :src="item.image" class="thumb" />
          <div class="info">
            <h4>{{ item.name }}</h4>
            <p class="price">¥{{ item.price }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 抽屉：购物车 -->
    <div class="drawer-mask" v-if="showCartDrawer" @click="showCartDrawer = false"></div>
    <div class="drawer right-drawer glass-drawer" :class="{ open: showCartDrawer }">
      <div class="drawer-header">
        <h3>🛒 您的绣制订单 ({{ cartCount }})</h3>
        <button class="close-btn" @click="showCartDrawer = false">×</button>
      </div>
      
      <div class="cart-list" v-if="cartItems.length > 0">
        <div v-for="(item, index) in cartItems" :key="item.cartId" class="cart-item glass-card">
          <div class="cart-thumb">
            <img :src="item.preview" />
          </div>
          <div class="cart-info">
            <h4>{{ item.name }} <span v-if="item.isCustom" class="tag-custom">定制</span></h4>
            <div class="cart-meta">
              <span class="price">¥{{ item.price }}</span>
              <button class="del-btn" @click.stop="removeFromCart(index)">放生</button>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty-cart">
        订单暂未添加绣品<br>快去挑选你的刺绣纹样和载体吧~
      </div>

      <div class="cart-footer">
        <div class="total-row">
          <span>订单总价：</span>
          <span class="total-price">¥{{ cartTotal.toFixed(2) }}</span>
        </div>
        <button class="btn coral-btn checkout-btn" :disabled="cartCount === 0" @click="goToCheckout">
          🚢 绣梦启航 (去结算)
        </button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router"; 
const router = useRouter(); 

/**
 * 1. 海洋特效逻辑
 */
const fishContainer = ref(null);

const spawnClickBubble = (e) => {
  if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
  const bubble = document.createElement('div');
  bubble.classList.add('click-bubble');
  const size = Math.random() * 20 + 10; 
  bubble.style.width = `${size}px`; bubble.style.height = `${size}px`;
  bubble.style.left = `${e.clientX}px`; bubble.style.top = `${e.clientY}px`;
  document.body.appendChild(bubble);
  setTimeout(() => bubble.remove(), 1000);
};

const spawnFishSchool = () => {
  const target = document.body;
  const count = Math.floor(Math.random() * 3) + 3;
  for(let i=0; i<count; i++) {
    const fish = document.createElement('div');
    fish.classList.add('swimming-fish');
    fish.innerText = ['🐠', '🐟', '🐡', '🦑'][Math.floor(Math.random()*4)];
    const startY = Math.random() * window.innerHeight;
    const duration = Math.random() * 3 + 2; 
    fish.style.top = `${startY}px`; fish.style.animationDuration = `${duration}s`;
    target.appendChild(fish);
    setTimeout(() => fish.remove(), duration * 1000);
  }
};

const handleCropWithEffect = () => { doFreehandCrop(); spawnFishSchool(); };
const handleAddToCartWithEffect = () => { addToCart(); spawnFishSchool(); };

/**
 * 2. 核心数据与逻辑
 */
const showProductDrawer = ref(false);
const showCartDrawer = ref(false);
const currentProduct = ref(null);
const cartItems = ref([]);
const cartCount = computed(() => cartItems.value.length);
const cartTotal = computed(() => cartItems.value.reduce((s,i)=>s+i.price,0));

const productList = [
  { id: 101, name: "卡通国风纹样", price: 9.9, image: "/3.png" },
  { id: 102, name: "传统纹样", price: 15.0, image: "/2.png" },
  { id: 103, name: "共创纹样", price: 12.5, image: "/1.png" }
];

// 绘图相关
const srcImageUrl = ref("");
const rawSrcImage = ref(null);
const srcImageEl = ref(null);
const drawCanvas = ref(null);
const drawCtx = ref(null);
const isDrawing = ref(false);
const drawPoints = ref([]);
const croppedImageUrl = ref("");

// 背景与贴纸
const backgroundImageUrl = ref("");
const bgImageEl = ref(null);
const bgContainer = ref(null);
const overlay = reactive({ x: 100, y: 100, scale: 0.5, rotate: 0 });

const stickerStyle = computed(() => ({
  left: overlay.x + "px", top: overlay.y + "px",
  transform: `translate(-50%, -50%) scale(${overlay.scale}) rotate(${overlay.rotate}deg)`,
  zIndex: 20
}));

// --- 功能函数 ---
const onSelectLocalSource = (e) => {
  const f = e.target.files?.[0]; if(!f) return;
  const url = URL.createObjectURL(f);
  currentProduct.value = { id:`c_${Date.now()}`, name:"自定义上传", price:0.1, isCustom:true, image: url };
  loadImage(url);
};

const selectProduct = (item) => { 
  currentProduct.value = {...item}; showProductDrawer.value = false; loadImage(item.image); 
};

const loadImage = (url) => { 
  srcImageUrl.value = url; 
  const img = new Image(); img.crossOrigin = "anonymous"; 
  img.onload = () => { 
    rawSrcImage.value = img; drawPoints.value = []; croppedImageUrl.value = ""; initDrawCanvas(); 
  }; 
  img.src = url; 
};

const initDrawCanvas = async() => { 
  await nextTick(); if(!srcImageEl.value || !drawCanvas.value) return; 
  const r = srcImageEl.value.getBoundingClientRect(); 
  drawCanvas.value.width = r.width; drawCanvas.value.height = r.height; 
  drawCtx.value = drawCanvas.value.getContext("2d"); 
};

// 绘图
const startDraw = (e) => { 
  isDrawing.value = true; drawPoints.value = [{x:e.offsetX, y:e.offsetY}]; 
  drawCtx.value.clearRect(0,0,9999,9999); drawCtx.value.lineWidth = 3; drawCtx.value.strokeStyle = "#00b4d8"; 
  drawCtx.value.lineCap = "round"; drawCtx.value.beginPath(); drawCtx.value.moveTo(e.offsetX,e.offsetY); 
  e.preventDefault();
};
const drawing = (e) => { 
  if(!isDrawing.value) return; 
  drawPoints.value.push({x:e.offsetX, y:e.offsetY}); drawCtx.value.lineTo(e.offsetX,e.offsetY); drawCtx.value.stroke(); 
};
const endDraw = () => isDrawing.value = false;
const clearDraw = () => { drawPoints.value=[]; drawCtx.value?.clearRect(0,0,9999,9999); };
const canCrop = computed(() => drawPoints.value.length > 10);

const doFreehandCrop = () => { 
  const img = rawSrcImage.value;
  const rx = img.naturalWidth / srcImageEl.value.clientWidth; 
  const ry = img.naturalHeight / srcImageEl.value.clientHeight;
  const c = document.createElement("canvas"); 
  c.width = img.naturalWidth; c.height = img.naturalHeight; 
  const ctx = c.getContext("2d");
  ctx.beginPath(); 
  drawPoints.value.forEach((p,i) => i===0 ? ctx.moveTo(p.x*rx, p.y*ry) : ctx.lineTo(p.x*rx, p.y*ry)); 
  ctx.closePath(); ctx.clip(); ctx.drawImage(img,0,0);
  croppedImageUrl.value = c.toDataURL("image/png"); 
  clearDraw(); 
  if(backgroundImageUrl.value) centerOverlay();
};

// 背景与拖拽
const onSelectBackgroundImage = (e) => { 
  const f = e.target.files?.[0]; if(f) backgroundImageUrl.value = URL.createObjectURL(f); 
};
const onBgLoaded = () => centerOverlay();
const centerOverlay = async() => { 
  await nextTick(); if(!bgContainer.value) return; 
  const r = bgContainer.value.getBoundingClientRect(); 
  overlay.x = r.width / 2; overlay.y = r.height / 2; overlay.scale = 0.5; overlay.rotate = 0;
};

// 拖拽
let isDragging = false; let startPos = { x: 0, y: 0 }; let startOverlay = { x: 0, y: 0 };
const onStickerPointerDown = (e) => { 
  e.preventDefault(); e.stopPropagation();
  isDragging = true;
  startPos = { x: e.clientX, y: e.clientY }; startOverlay = { x: overlay.x, y: overlay.y };
  e.currentTarget.setPointerCapture(e.pointerId);
  document.addEventListener("pointermove", onStickerMove); document.addEventListener("pointerup", onStickerUp);
};
const onStickerMove = (e) => {
  if (!isDragging) return; e.preventDefault();
  overlay.x = startOverlay.x + (e.clientX - startPos.x); overlay.y = startOverlay.y + (e.clientY - startPos.y);
};
const onStickerUp = () => {
  isDragging = false;
  document.removeEventListener("pointermove", onStickerMove); document.removeEventListener("pointerup", onStickerUp);
};
onBeforeUnmount(() => {
  document.removeEventListener("pointermove", onStickerMove); document.removeEventListener("pointerup", onStickerUp);
});

// 核心：生成合成图片数据 (base64)
const generateCompositeDataUrl = (targetWidth) => { 
  return new Promise(resolve => { 
    if(!bgImageEl.value) return resolve(""); 
    const bg = bgImageEl.value; 
    const r = bg.naturalWidth / bg.getBoundingClientRect().width; 
    const cvs = document.createElement("canvas"); 
    cvs.width = bg.naturalWidth; cvs.height = bg.naturalHeight; 
    const ctx = cvs.getContext("2d"); 
    ctx.drawImage(bg, 0, 0); 
    const stk = new Image(); stk.crossOrigin = "anonymous"; 
    stk.onload = () => { 
      ctx.translate(overlay.x*r, overlay.y*r); ctx.rotate(overlay.rotate * Math.PI / 180); 
      const s = overlay.scale * r; ctx.scale(s, s); ctx.drawImage(stk, -stk.width/2, -stk.height/2); 
      resolve(cvs.toDataURL("image/png")); 
    }; 
    stk.src = croppedImageUrl.value; 
  }); 
};

// --- 新增：处理下载 ---
const handleDownload = async () => {
  if(!bgImageEl.value || !croppedImageUrl.value) return;
  
  // 1. 生成图片
  const dataUrl = await generateCompositeDataUrl();
  
  // 2. 创建临时链接下载
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `ocean_diy_${Date.now()}.png`; // 文件名
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 3. 触发特效
  spawnFishSchool();
};

const addToCart = async() => { 
  if(!currentProduct.value){alert("请选素材");return;} 
  const snap = await generateCompositeDataUrl(300); 
  cartItems.value.push({ cartId:Date.now(), ...currentProduct.value, preview:snap }); 
  showCartDrawer.value = true; 
};
const removeFromCart = (i) => cartItems.value.splice(i,1);
const goToCheckout = () => { 
  if(cartItems.value.length === 0) return; 
  localStorage.setItem('my_diy_cart_data', JSON.stringify({ items:cartItems.value, total:cartTotal.value })); 
  const url = router ? router.resolve({path:'/index/newpage'}).href : '#'; 
  window.open(url, '_blank'); 
};
</script>

<style>
/* 
  全局样式重置 & 海洋主题 
*/
body, html {
  margin: 0; padding: 0; width: 100%; height: 100%;
  font-family: 'Segoe UI', 'Nunito', sans-serif;
  overflow-x: hidden;
}

.ocean-world {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(180deg, #e0f7fa 0%, #b2ebf2 50%, #4dd0e1 100%);
  color: #006064;
  padding-bottom: 100px;
  box-sizing: border-box;
}

.sun-rays {
  position: absolute; top: 0; left: 0; width: 100%; height: 60vh;
  background: linear-gradient(to bottom, rgba(255,255,255,0.4), transparent);
  clip-path: polygon(20% 0%, 40% 100%, 60% 0%, 80% 100%);
  opacity: 0.3; pointer-events: none; z-index: 1;
}
.fish-container { position: fixed; inset: 0; pointer-events: none; z-index: 2; }

/* 核心修改：增加 padding-top 以防止内容被新的 sticky-bar 遮挡 */
/* 导航栏(60px) + 工具条(约70px) + 间隙(40px) = 170px 左右 */
.page-content {
  position: relative; 
  z-index: 10; 
  max-width: 900px; 
  margin: 0 auto; 
  padding: 180px 20px 20px; /* 修改：加大上边距 */
}

/* 核心修改：工具条下移，避开导航栏 */
.sticky-bar {
  position: fixed; 
  top: calc(var(--nav-h) + 20px); /* 修改：在导航栏高度基础上加 20px */
  left: 50%; 
  transform: translateX(-50%);
  width: 90%; 
  max-width: 880px; 
  z-index: 100;
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  padding: 10px 20px; 
  box-sizing: border-box;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
  margin-bottom: 24px;
}
.glass-button {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  border-radius: 20px; cursor: pointer; transition: 0.2s;
}
.glass-button:hover { background: rgba(255, 255, 255, 0.9); transform: translateY(-2px); }

/* --- 按钮风格 --- */
.btn {
  border: none; border-radius: 25px; padding: 10px 24px; 
  font-weight: bold; cursor: pointer; transition: 0.3s;
  position: relative; z-index: 5;
}
/* 海洋蓝按钮 (通用/下载) */
.ocean-btn {
  background: linear-gradient(135deg, #4dd0e1 0%, #00bcd4 100%); color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.ocean-btn:hover { transform: scale(1.05); }
.ocean-btn.ghost { background: white; color: #00bcd4; border: 1px solid #b2ebf2; }
.ocean-btn:disabled { background: #cfd8dc; transform: none; cursor: not-allowed; }

/* 珊瑚橙按钮 (强调购买) */
.coral-btn {
  background: linear-gradient(135deg, #ff8a65 0%, #ff5722 100%); color: white;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}
.coral-btn:hover { transform: scale(1.05); box-shadow: 0 6px 12px rgba(255,87,34, 0.3); }

/* 面板内部 */
.panel { padding: 25px; }
.panel-title { font-size: 1.2rem; margin-bottom: 15px; color: #00838f; border-left: 5px solid #00bcd4; padding-left: 10px; }
.main-title { text-align: center; color: #006064; margin-bottom: 30px; }
.badge { background: #e0f7fa; color: #006064; font-size: 12px; padding: 2px 8px; border-radius: 4px; margin-left: 8px;}

/* 绘图与图片 */
.draw-wrapper { text-align: center; margin-top: 15px; }
.shadow-box {
  box-shadow: 0 10px 25px rgba(0,0,0,0.15); border-radius: 8px; 
  overflow: hidden; display: inline-block; background: white; border: 4px solid white;
  max-width: 100%; 
}
.draw-area { position: relative; max-width: 100%; }
.src-img { max-height: 400px; display: block; max-width: 100%; }
.draw-canvas { position: absolute; inset: 0; width: 100%; height: 100%; cursor: crosshair; }
.btn-group { display: flex; gap: 10px; justify-content: center; margin-top: 15px;}

/* 贴图画布 */
.canvas-wrapper { text-align: center; margin-top: 15px; }
.canvas {
  position: relative; display: inline-block; background: white;
  overflow: hidden; max-width: 100%; 
  box-shadow: 0 5px 15px rgba(0,0,0,0.2); border-radius: 4px;
}
.bg-img { display: block; max-width: 100%; height: auto; max-height: 70vh; object-fit: contain; }
.sticker { position: absolute; cursor: grab; touch-action: none; }
.sticker:active { cursor: grabbing; }

/* 底部操作区 (含双按钮) */
.control-panel { margin-top: 20px; }
.sliders { display: flex; gap: 20px; margin-bottom: 20px; flex-wrap: wrap; justify-content: center;}
.control-row { display: flex; align-items: center; gap: 10px; font-size: 14px; min-width: 200px; }
.ocean-range { flex: 1; }

.action-footer.double-btn {
  display: flex; gap: 15px; /* 按钮间距 */
}
.action-footer .btn { flex: 1; font-size: 16px; padding: 12px; } /* 两个按钮平分宽度 */

/* 抽屉 */
.drawer-mask { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 199; }
.drawer { 
  position: fixed; top: 0; bottom: 0; width: 320px; background: white; z-index: 200; 
  transition: transform 0.3s ease; display: flex; flex-direction: column; 
}
.glass-drawer { background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(15px); }
.left-drawer { left: 0; transform: translateX(-100%); }
.right-drawer { right: 0; transform: translateX(100%); }
.drawer.open { transform: translateX(0); }
.drawer-header { padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; font-weight: bold; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #999; }

.product-list, .cart-list { flex: 1; overflow-y: auto; padding: 15px; }
.glass-card {
  background: rgba(255,255,255,0.6); border: 1px solid white; border-radius: 12px;
  padding: 10px; margin-bottom: 12px; display: flex; gap: 10px; cursor: pointer; transition: 0.2s;
}
.glass-card:hover { background: white; transform: scale(1.02); }
.thumb { width: 60px; height: 60px; border-radius: 6px; object-fit: cover; }
.cart-thumb img { width: 60px; height: 60px; object-fit: contain; }
.cart-info { flex: 1; font-size: 14px; }
.cart-meta { display: flex; justify-content: space-between; margin-top: 5px;}
.price { color: #00bcd4; font-weight: bold; }
.del-btn { color: #f56c6c; border: none; background: none; cursor: pointer; }

/* 动画类 */
.click-bubble {
  position: fixed; border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.4));
  box-shadow: 0 0 5px rgba(255,255,255,0.5);
  pointer-events: none; z-index: 9999;
  transform: translate(-50%, -50%); animation: bubblePop 1s ease-out forwards;
}
@keyframes bubblePop {
  0% { transform: translate(-50%, -50%) scale(0.5); opacity: 1; }
  100% { transform: translate(-50%, -150px) scale(1.5); opacity: 0; }
}
.swimming-fish {
  position: fixed; font-size: 40px; z-index: 9998; pointer-events: none;
  left: -50px; opacity: 0.8; animation: swimRight linear forwards;
}
@keyframes swimRight {
  0% { left: -50px; transform: rotateY(0deg); }
  100% { left: 110vw; transform: rotateY(0deg); }
}
.floating-anim { animation: float 3s ease-in-out infinite; }
@keyframes float { 
  0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } 
}
.fade-in-up { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; transform: translateY(20px); }
@keyframes fadeInUp { to { opacity: 1; transform: translateY(0); } }

/* 杂项 */
.cart-summary { padding: 8px 16px; display: flex; align-items: center; gap: 8px; color: #006064; font-weight: bold;}
.cart-count { background: #ff7043; color: white; padding: 2px 6px; border-radius: 10px; font-size: 12px; }
.source-selection { display: flex; gap: 15px; justify-content: center; background: rgba(255,255,255,0.3); padding: 15px; border-radius: 12px; margin-bottom: 15px;}
.option-block { display: flex; gap: 5px; padding: 8px 15px; background: white; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: bold; color: #00838f;}
.divider { width: 1px; background: #b2ebf2; }
.cs-tip-box { font-size: 12px; text-align: center; color: #ff9800; margin-bottom: 10px;}
.upload-btn { display: inline-block; padding: 12px 20px; font-weight: bold; color: #006064; }
.cart-footer { padding: 20px; border-top: 1px solid #eee; background: #f9f9f9; }
.total-row { display: flex; justify-content: space-between; font-weight: bold; margin-bottom: 10px; font-size: 16px;}
.total-price { color: #f56c6c; }
.checkout-btn { width: 100%; font-size: 16px; padding: 12px; }
</style>
