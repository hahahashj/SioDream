// src/utils/request.js
import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

// 创建 axios 实例
const service = axios.create({
  baseURL: '/api', // 改为空，因为要用完整路径
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 添加 token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    console.log('发送请求:', config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    const { data } = response
    
    console.log('🔍 后端返回数据:', data)
    
    // 根据你的后端实际格式调整
    if (data.code === 1) {  // 你的后端成功code是1
      return data
    } else {
      ElMessage.error(data.msg || '操作失败')  // 你的后端错误字段是msg
      return Promise.reject(new Error(data.msg || 'Error'))
    }
  },
  (error) => {
    console.error('请求错误:', error)
    
    if (error.response) {
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('登录已过期，请重新登录')
          localStorage.removeItem('token')
          localStorage.removeItem('userInfo')
          router.push('/login')
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 500:
          ElMessage.error(data?.message || '服务器内部错误')
          break
        default:
          ElMessage.error(data?.message || `请求失败: ${status}`)
      }
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查后端服务是否启动')
    } else {
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 封装请求方法 - 针对你的后端路由
export const http = {
  // 员工相关接口
  emp: {
    // 登录
    login(data) {
      return service.post('/admin/emp/login', data)
    },
    // 获取员工信息
    getInfo() {
      return service.get('/admin/emp/info')
    },
    // 退出登录
    logout() {
      return service.post('/admin/emp/logout')
    },
    // 获取员工列表
    list(params) {
      return service.get('/admin/emp/list', { params })
    },
    // 添加员工
    add(data) {
      return service.post('/admin/emp/add', data)
    },
    // 更新员工
    update(data) {
      return service.put('/admin/emp/update', data)
    },
    // 删除员工
    delete(id) {
      return service.delete(`/admin/emp/delete/${id}`)
    }
  },
  
  // 通用请求方法
  get(url, params = {}) {
    return service.get(url, { params })
  },
  
  post(url, data = {}) {
    return service.post(url, data)
  },
  
  put(url, data = {}) {
    return service.put(url, data)
  },
  
  delete(url, params = {}) {
    return service.delete(url, { params })
  }
}

export default service