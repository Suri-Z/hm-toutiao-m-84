// 权限认证  token 令牌
// 提供  获取token  设置token  删除token
const USER_KEY = 'hm-toutiao-m-84-user'

// 获取token
export const getUser = () => {
  return JSON.parse(window.localStorage.getItem(USER_KEY) || '{}')
}
// 设置token
export const setUser = (user) => {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user))
}
// 删除token
export const delUser = () => {
  window.localStorage.removeItem(USER_KEY)
}
