// 导出 频道相关的API函数
import request from '@/utils/request'
import store from '@/store'
/**
 * 获取我的频道（未登录，获取的系统默认给的频道）
 */
// 存储都使用这个key  对应值是  json字符串是数组类型
const CHANNEL_KEY = 'hm-toutiao-m-84-channel-key'
export const getMyChannels = () => {
  // 该函数的返回值必须是promise 使用的时候用了await
  // 1. 登录状态  直接调用接口返回数据即可
  // 2. 未登录状态
  // 2.1 本地未存储频道数据（获取默认频道数据，存储在本地，返回数据）
  // 2.2 本地已存储频道数据（获取本地频道数据即可）
  return new Promise(async (resolve, reject) => {
    const { user } = store.state
    if (user.token) {
      // 已登录  data = {channels: [我的频道]}
      const data = await request('/app/v1_0/user/channels', 'get')
      resolve(data)
    } else {
      // 未登录
      const str = window.localStorage.getItem(CHANNEL_KEY) || '[]'
      const localChannels = JSON.parse(str)
      // 本地未存储
      if (!localChannels.length) {
        // 获取数据
        const data = await request('/app/v1_0/user/channels', 'get')
        // 存储数据
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(data.channels))
        resolve(data)
      } else {
        resolve({ channels: localChannels })
      }
    }
  })
}

/**
 * 获取全部频道
 */
export const getAllChannels = () => {
  return request('/app/v1_0/channels', 'get')
}

/**
 * 删除频道
 * @param {Integer} channelId - 频道ID
 */
export const delChannel = (channelId) => {
  // 判断是否登录
  // 如果登录  调用接口进行删除
  // 如果没有登录  删除本地存储的频道中id对应的那一项
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
        // 登录
        await request(`/app/v1_0/user/channels/${channelId}`, 'delete')
        resolve()
      } else {
        // 未登录
        const str = window.localStorage.getItem(CHANNEL_KEY)
        const localChannels = JSON.parse(str)
        const index = localChannels.findIndex(item => item.id === channelId)
        localChannels.splice(index, 1)
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}

/**
 * 添加频道
 * @param {Array} orderChannels - 排序好的频道数组
 */
export const addChannel = (orderChannels) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { user } = store.state
      if (user.token) {
      // 后台添加
        await request('/app/v1_0/user/channels', 'put', {
          channels: orderChannels
        })
        resolve()
      } else {
      // 本地添加
        const str = window.localStorage.getItem(CHANNEL_KEY)
        const localChannels = JSON.parse(str)
        const { id, name } = orderChannels[orderChannels.length - 1]
        localChannels.push({ id, name })
        window.localStorage.setItem(CHANNEL_KEY, JSON.stringify(localChannels))
        resolve()
      }
    } catch (e) {
      reject(e)
    }
  })
}
