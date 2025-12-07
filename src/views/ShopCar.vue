<!-- 文件路径：src/views/buy/checkout.vue -->
<template>
  <div class="checkout-page">
    <h1>订单结算</h1>
    
    <div v-if="orderData" class="order-content">
      <div class="items-list">
        <div v-for="item in orderData.items" :key="item.cartId" class="item">
          <!-- 这里显示刚才生成的预览图 -->
          <img :src="item.preview" class="thumb" />
          <div class="info">
            <h3>{{ item.name }}</h3>
            <p>价格: ¥{{ item.price }}</p>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <h2>总计: ¥{{ orderData.total.toFixed(2) }}</h2>
        <button class="pay-btn">确认支付</button>
      </div>
    </div>
    
    <div v-else class="loading">
      正在读取订单信息...
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const orderData = ref(null);

onMounted(() => {
  // 1. 从 localStorage 读取数据
  const savedCart = localStorage.getItem('my_diy_cart_data');
  
  if (savedCart) {
    orderData.value = JSON.parse(savedCart);
    
    // (可选) 读取完后是否清除？如果不清除，用户刷新页面数据还在，体验更好
    // localStorage.removeItem('my_diy_cart_data'); 
  } else {
    alert("未找到订单数据，请返回重新下单");
  }
});
</script>

<style scoped>
.checkout-page { padding: 40px; max-width: 800px; margin: 0 auto; }
.item { display: flex; gap: 20px; border-bottom: 1px solid #eee; padding: 15px 0; }
.thumb { width: 100px; height: 100px; object-fit: contain; border: 1px solid #ddd; }
.pay-btn { background: #f56c6c; color: white; border: none; padding: 10px 30px; font-size: 18px; cursor: pointer; }
</style>
