import Vue from 'vue'
import Vuex from 'vuex'
import * as auth from '@/utils/auth'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 用户信息
    user: auth.getUser(),
    // 头像
    photo: null
  },
  mutations: {
    // 修改头像
    setPhoto (state, photo) {
      state.photo = photo
    },
    // 修改用户  user传参必须是对象
    setUser (state, user) {
      // 修改了vuex中的state , 如果刷新了页面重新获取本地的数据, 会丢失之前存储state
      // 所以：同时修改本地的用户信息
      state.user = user
      // 更新本地用户信息
      auth.setUser(user)
    },
    // 删除用户
    delUser (state) {
      state.user = {}
      // 删除本地用户信息
      auth.delUser()
    }
  },
  actions: {
  }
})
