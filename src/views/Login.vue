<template>
  <div class="login-container">
    <!-- 背景装饰元素 -->
    <div class="ocean-bg">
      <div class="wave wave-1"></div>
      <div class="wave wave-2"></div>
      <div class="wave wave-3"></div>
      <div class="bubble bubble-1"></div>
      <div class="bubble bubble-2"></div>
      <div class="bubble bubble-3"></div>
      <div class="fish fish-1"></div>
      <div class="fish fish-2"></div>
    </div>

    <!-- 登录卡片 -->
    <div class="login-card" v-if="currentForm === 'login'">
      <div class="login-header">
        <div class="logo">
          <svg viewBox="0 0 100 100" class="anchor-icon">
            <circle cx="50" cy="50" r="45" fill="#1a73e8" />
            <path d="M50 15v30l-15 15h30L50 45V15z" fill="white" />
            <circle cx="50" cy="65" r="10" fill="white" />
          </svg>
          <h1>OceanMart</h1>
        </div>
        <p>海航方舟,探索海洋般丰富的购物体验</p>
      </div>
      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">用户名</label>
          <div class="input-wrapper">
            <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
            </svg>
            <input 
              type="text" 
              id="username" 
              v-model="loginData.username" 
              placeholder="请输入用户名" 
              required>
          </div>
        </div>

        <div class="form-group">
          <label for="password">密码</label>
          <div class="input-wrapper">
            <svg class="icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="currentColor" d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z" />
            </svg>
            <input 
              :type="showPassword ? 'text' : 'password'" 
              id="password" 
              v-model="loginData.password" 
              placeholder="请输入密码" 
              required
            >
            <button 
              type="button" 
              class="toggle-password" 
              @click="showPassword = !showPassword"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11.07-7.5-2.5 0-4.78.7-6.76 1.97l2.61 2.61C8.18 8.39 9.83 7 12 7zm0 3c-1.66 0-3 1.34-3 3 0 .62.18 1.19.48 1.66L4.52 8.08C5.91 6.06 8.27 5 11 5c3.53 0 6.58 2.36 7.75 5.42l-2.83 2.83C15.19 13.19 14.62 13 14 13c-1.66 0-3 1.34-3 3 0 2.76 2.24 5 5 5 2.5 0 4.78-.7 6.76-1.97l-2.61-2.61c-.3 0-.58-.07-.82-.21 1.51-1.26 2.7-2.89 3.43-4.75C19.42 13.24 16.26 10 12 10z" />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-options">
          <label class="remember-me">
            <input type="checkbox" v-model="rememberMe">
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="ForgetHandle">忘记密码?</a>
        </div>

        <button type="submit" class="login-btn">登录</button>
      </form>

      <div class="register-prompt">
        <span>还没有账号?</span>
        <a href="#" @click.prevent="switchToRegister">立即注册</a>
      </div>
    </div>
    <div class="login-card" v-else>
        <div class="login-header">
            <h1>注册</h1>
        </div>
        <form class="login-form" @submit.prevent="handleRegister">       
            <div class="form-group">
                <label for="reg-username">用户名</label>
                <input 
                    type="text" 
                    id="reg-username" 
                    v-model="registerData.username" 
                    placeholder="请输入用户名" 
                    required>
            </div>
            <div class="form-group">
                <label for="reg-email">邮箱</label>
                <input 
                    type="email" 
                    id="reg-email" 
                    v-model="registerData.email" 
                    placeholder="请输入邮箱地址" 
                    required>
            </div>
            <div class="form-group">
                <label for="reg-password">密码</label>
                <div class="password-input-container">
                    <input 
                    :type="showRegPassword ? 'text' : 'password'"
                    id="reg-password" 
                    v-model="registerData.password" 
                    placeholder="请输入密码" 
                    required
                    class="password-field"
                    >
                    <button 
                    type="button" 
                    class="password-toggle-btn" 
                    @click="showRegPassword = !showRegPassword"
                    >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path v-if="!showRegPassword" fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11.07-7.5-2.5 0-4.78.7-6.76 1.97l2.61 2.61C8.18 8.39 9.83 7 12 7zm0 3c-1.66 0-3 1.34-3 3 0 .62.18 1.19.48 1.66L4.52 8.08C5.91 6.06 8.27 5 11 5c3.53 0 6.58 2.36 7.75 5.42l-2.83 2.83C15.19 13.19 14.62 13 14 13c-1.66 0-3 1.34-3 3 0 2.76 2.24 5 5 5 2.5 0 4.78-.7 6.76-1.97l-2.61-2.61c-.3 0-.58-.07-.82-.21 1.51-1.26 2.7-2.89 3.43-4.75C19.42 13.24 16.26 10 12 10z" />
                        <path v-else fill="currentColor" d="M12 6.5c2.76 0 5 2.24 5 5 0 .51-.1 1-.24 1.46l3.06 3.06c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l2.17 2.17c.47-.14.96-.24 1.47-.24zM2.71 3.16a.996.996 0 0 0 0 1.41l1.97 1.97C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.97-.3 4.31-.82l2.72 2.72a.996.996 0 1 0 1.41-1.41L4.13 3.16c-.39-.39-1.03-.39-1.42 0zM12 16.5c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07L14.14 16c-.65.32-1.37.5-2.14.5zm2.97-5.33a2.97 2.97 0 0 0-2.64-2.64l2.64 2.64z" />
                    </svg>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <label for="reg-repassword">确认密码</label>
                <div class="password-input-container">
                    <input 
                    :type="showRegRePassword ? 'text' : 'password'"
                    id="reg-repassword" 
                    v-model="registerData.rePassword" 
                    placeholder="请再次输入密码" 
                    required
                    class="password-field"
                    >
                    <button 
                    type="button" 
                    class="password-toggle-btn" 
                    @click="showRegRePassword = !showRegRePassword"
                    >
                    <svg viewBox="0 0 24 24" width="18" height="18">
                        <path v-if="!showRegRePassword" fill="currentColor" d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11.07-7.5-2.5 0-4.78.7-6.76 1.97l2.61 2.61C8.18 8.39 9.83 7 12 7zm0 3c-1.66 0-3 1.34-3 3 0 .62.18 1.19.48 1.66L4.52 8.08C5.91 6.06 8.27 5 11 5c3.53 0 6.58 2.36 7.75 5.42l-2.83 2.83C15.19 13.19 14.62 13 14 13c-1.66 0-3 1.34-3 3 0 2.76 2.24 5 5 5 2.5 0 4.78-.7 6.76-1.97l-2.61-2.61c-.3 0-.58-.07-.82-.21 1.51-1.26 2.7-2.89 3.43-4.75C19.42 13.24 16.26 10 12 10z" />
                        <path v-else fill="currentColor" d="M12 6.5c2.76 0 5 2.24 5 5 0 .51-.1 1-.24 1.46l3.06 3.06c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l2.17 2.17c.47-.14.96-.24 1.47-.24zM2.71 3.16a.996.996 0 0 0 0 1.41l1.97 1.97C3.06 7.83 1.77 9.53 1 11.5 2.73 15.89 7 19 12 19c1.52 0 2.97-.3 4.31-.82l2.72 2.72a.996.996 0 1 0 1.41-1.41L4.13 3.16c-.39-.39-1.03-.39-1.42 0zM12 16.5c-2.76 0-5-2.24-5-5 0-.77.18-1.5.49-2.14l1.57 1.57c-.03.18-.06.37-.06.57 0 1.66 1.34 3 3 3 .2 0 .38-.03.57-.07L14.14 16c-.65.32-1.37.5-2.14.5zm2.97-5.33a2.97 2.97 0 0 0-2.64-2.64l2.64 2.64z" />
                    </svg>
                    </button>
                </div>
            </div>
            <button type="submit" class="login-btn">注册</button>        
        </form>
        <div class="register-prompt">
            <span>已有账号?</span>
            <a href="#" @click.prevent="switchToLogin">立即登录</a>
        </div>
    </div>
  </div>
</template>
<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 当前显示的是登录还是注册
const currentForm = ref('login');

// 显示/隐藏密码
const showRegPassword = ref(false);
const showRegRePassword = ref(false);
const showPassword = ref(false);

// 记住我（这里只做前端）
const rememberMe = ref(false);

// 注册表单数据（纯前端校验 + 提示文案）
const registerData = reactive({
  username: '',
  password: '',
  email: '',
  rePassword: ''
});

// 登录表单数据
const loginData = reactive({
  username: '',
  password: ''
});

// 组件挂载时：如果之前“记住我”了，就把用户名带回来
onMounted(() => {
  const rememberedUser = localStorage.getItem('rememberedUser');
  if (rememberedUser) {
    loginData.username = rememberedUser;
    rememberMe.value = true;
  }
});

// 切换到注册表单
const switchToRegister = () => {
  currentForm.value = 'register';
};

// 切换到登录表单
const switchToLogin = () => {
  currentForm.value = 'login';
};

// 注册逻辑（完全前端模拟）
const handleRegister = () => {
  if (
    !registerData.username.trim() ||
    !registerData.email.trim() ||
    !registerData.password ||
    !registerData.rePassword
  ) {
    alert('请填写完整的注册信息');
    return;
  }

  // 验证密码一致性
  if (registerData.password !== registerData.rePassword) {
    alert('两次输入的密码不一致');
    return;
  }

  // 验证邮箱格式（可选）
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerData.email)) {
    alert('请输入有效的邮箱地址');
    return;
  }

  // 验证密码长度（可选）
  if (registerData.password.length < 6) {
    alert('密码长度不能少于6位');
    return;
  }

  // 这里只是模拟，不真的创建账号
  console.log('注册信息(前端模拟):', { ...registerData });
  alert('注册信息已提交（当前为前端模拟注册，实际仅 admin 账号可登录）');

  // 注册完自动切回登录页，并把用户名带过去
  loginData.username = registerData.username;
  currentForm.value = 'login';
};

// 登录处理函数（前端模拟：admin / 123456）
const handleLogin = () => {
  if (!loginData.username.trim() || !loginData.password) {
    alert('请填写完整的登录信息');
    return;
  }

  const user = loginData.username.trim();
  const pwd = loginData.password;

  // ✅ 只允许 admin / 123456 这一组
  if (user === 'admin' && pwd === '123456') {
    // 1. 存当前登录用户（给导航栏、/creations 等页面用）
    localStorage.setItem(
      'currentUser',
      JSON.stringify({
        username: 'admin',
        displayName: '管理员'
      })
    );

    // 2. 处理“记住我”
    if (rememberMe.value) {
      localStorage.setItem('rememberedUser', user);
    } else {
      localStorage.removeItem('rememberedUser');
    }

    // 3. 额外放一个简单标记（可选，其他地方可以用）
    localStorage.setItem('isLoggedIn', 'true');

    alert('登录成功，欢迎 admin！');
    router.push('/index'); // 跳转到首页
  } else {
    alert('用户名或密码错误（提示：用户名 admin，密码 123456）');
  }

  console.log('登录信息(前端模拟):', { ...loginData });
};

// 忘记密码提示
const ForgetHandle = () => {
  alert('演示账号为：admin / 123456');
};
</script>



<style scoped>
/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 600px; /* 确保最小高度 */
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px; /* 添加内边距防止在小屏幕上被裁剪 */
}

/* 海洋背景和动画 */
.ocean-bg {
  position: fixed; /* 改为固定定位，相对于视口 */
  top: 0;
  left: 0;
  width: 100vw;   /* 使用视口宽度 */
  height: 100vh;  /* 使用视口高度 */
  background: linear-gradient(135deg, #0b486b 0%, #00d2ff 100%);
  z-index: 0;
}

.wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.2' d='M0,192L48,181.3C96,171,192,149,288,149.3C384,149,480,171,576,181.3C672,192,768,192,864,181.3C960,171,1056,149,1152,133.3C1248,117,1344,107,1392,101.3L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: 100% 100px;
  background-repeat: no-repeat;
  animation: wave-animation 20s linear infinite;
}

.wave-2 {
  height: 80px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.15' d='M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,213.3C672,224,768,224,864,213.3C960,203,1056,181,1152,181.3C1248,181,1344,203,1392,213.3L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: 100% 80px;
  animation: wave-animation 15s linear infinite reverse;
}

.wave-3 {
  height: 60px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.1' d='M0,160L48,165.3C96,171,192,181,288,176C384,171,480,149,576,144C672,139,768,149,864,170.7C960,192,1056,224,1152,224C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E");
  background-size: 100% 60px;
  animation: wave-animation 10s linear infinite;
}

@keyframes wave-animation {
  0% { background-position-x: 0; }
  100% { background-position-x: 1440px; }
}

/* 气泡动画 */
.bubble {
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: bubble-rise linear infinite;
}

.bubble-1 {
  width: 30px;
  height: 30px;
  bottom: -30px;
  left: 15%;
  animation-duration: 15s;
}

.bubble-2 {
  width: 20px;
  height: 20px;
  bottom: -20px;
  left: 45%;
  animation-duration: 12s;
}

.bubble-3 {
  width: 25px;
  height: 25px;
  bottom: -25px;
  left: 80%;
  animation-duration: 18s;
}

@keyframes bubble-rise {
  0% { transform: translateY(0) scale(0.8); opacity: 0; }
  10% { opacity: 0.8; }
  90% { opacity: 0.8; }
  100% { transform: translateY(-100vh) scale(1.2); opacity: 0; }
}

/* 鱼动画 */
.fish {
  position: absolute;
  width: 50px;
  height: 30px;
  background-color: #ff9800;
  border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
  animation: fish-swim linear infinite;
}

.fish::before {
  content: '';
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: white;
  border-radius: 50%;
  right: 10px;
  top: 10px;
}

.fish::after {
  content: '';
  position: absolute;
  width: 15px;
  height: 10px;
  background-color: #ff9800;
  border-radius: 50%;
  left: -8px;
  top: 10px;
}

.fish-1 {
  top: 20%;
  left: -50px;
  animation-duration: 25s;
}

.fish-2 {
  top: 60%;
  left: -50px;
  background-color: #1a73e8;
  animation-duration: 35s;
}

.fish-2::after {
  background-color: #1a73e8;
}

@keyframes fish-swim {
  0% { transform: translateX(-50px) rotateY(0deg); }
  100% { transform: translateX(100vw) rotateY(0deg); }
}

/* 登录卡片样式 */
.login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transition: transform 0.3s ease;
  margin: 0 auto 0 550px; /* 上右下左，向左移动20px */
}

.login-card:hover {
  transform: translateY(-5px);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 15px;
}

.anchor-icon {
  width: 50px;
  height: 50px;
}

h1 {
  font-size: 28px;
  color: #1a73e8;
  margin: 0;
}

.login-header p {
  color: #666;
  font-size: 14px;
}

/* 表单样式 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.icon {
  position: absolute;
  left: 15px;
  color: #999;
}

.login-form input {
  width: 100%;
  padding: 14px 15px 14px 45px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.login-form input:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.2);
}

.toggle-password {
  position: absolute;
  right: 15px;
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #1a73e8;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 5px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.forgot-password {
  font-size: 14px;
  color: #1a73e8;
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #0d47a1;
  text-decoration: underline;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  padding: 14px;
  background-color: #1a73e8;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.login-btn:hover {
  background-color: #0d47a1;
}

.login-btn:active {
  transform: scale(0.98);
}

/* 注册提示 */
.register-prompt {
  margin-top: 25px;
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-prompt a {
  color: #1a73e8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.register-prompt a:hover {
  color: #0d47a1;
  text-decoration: underline;
}

/* 响应式设计 */
@media (max-width: 480px) {
  .login-container {
    padding: 15px;
    height: auto;
    min-height: 100vh;
    align-items: flex-start; /* 在小屏幕上顶部对齐 */
  }
  
  .login-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 30px;
  transition: transform 0.3s ease;
  margin: 0 auto; /* ❗这里改成整体居中，别再写 0 auto 0 550px */
}
  
  .logo {
    flex-direction: column;
    gap: 8px;
  }
  
  h1 {
    font-size: 24px;
  }
  
  .login-form input {
    padding: 12px 15px 12px 45px;
  }
}

@media (max-height: 700px) {
  .login-container {
    align-items: flex-start;
    padding-top: 40px;
  }
  
  .login-card {
    margin-top: 0;
  }
}
.password-input-container {
  position: relative;
  width: 100%;
}

.password-field {
  width: 100%;
  padding: 14px 45px 14px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.password-field:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.1);
}

.password-toggle-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle-btn:hover {
  color: #1a73e8;
  background-color: rgba(26, 115, 232, 0.1);
}

.password-toggle-btn:active {
  transform: translateY(-50%) scale(0.95);
}
</style>