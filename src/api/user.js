// src/api/user.js (或 auth.js)
import request from '@/utils/request.js'

// 或者如果你的后端需要表单格式
export const empRegisterService = (registerData) => {
  const params = new URLSearchParams()
  for (let key in registerData) {
    params.append(key, registerData[key])
  }
  return request.post('/admin/emp/register', params)
}

// 员工登录接口
export const empLoginService = (loginData) => {
  return request.post('/admin/emp/login', loginData)
}

// 获取员工信息
export const empGetInfoService = () => {
  return request.get('/admin/emp/info')
}

// 更新员工信息
export const empUpdateService = (empData) => {
  return request.put('/admin/emp/update', empData)
}