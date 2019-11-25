<template>
  <div class="container">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="小智同学"></van-nav-bar>
    <div class="chat-list" ref="list">
      <div class="chat-item" :class="{left:item.name==='xz',right:item.name==='self'}"  v-for="(item,i) in list" :key="i">
        <van-image v-if="item.name==='xz'" fit="cover" round :src="xzAvatar" />
        <div class="chat-pao">{{item.msg}}</div>
        <van-image v-if="item.name==='self'" fit="cover" round :src="photo||'https://img.yzcdn.cn/vant/cat.jpeg'" />
      </div>
    </div>
    <div class="reply-container van-hairline--top">
      <van-field v-model="value" placeholder="说点什么...">
        <van-loading v-if="loading" slot="button" type="spinner" size="16px"></van-loading>
        <span v-else @click="send()" slot="button" style="font-size:12px;color:#999">提交</span>
      </van-field>
    </div>
  </div>
</template>

<script>
import xzAvatar from '../../assets/xz.png'
import io from 'socket.io-client'
import { mapState } from 'vuex'
export default {
  name: 'user-chat',
  computed: {
    ...mapState(['photo', 'user'])
  },
  beforeDestroy () {
    this.socket.close()
  },
  data () {
    return {
      value: '',
      loading: false,
      xzAvatar,
      // 聊天记录
      // 小智：｛name:'xz',msg:''｝
      // 我的：｛name:'self',msg:''｝
      list: [],
      // socket实例对象
      socketIo: null
    }
  },
  created () {
    // 建立连接
    this.socketIo = io('http://ttapi.research.itcast.cn', {
      query: {
        token: this.user.token
      }
    })
    // 监听是否连接成
    this.socketIo.on('connect', () => {
      // 和小智通讯连接成功  小智默认打招呼
      this.list.push({ name: 'xz', msg: '亲，想知道点啥？' })
    })
    // 接收消息
    this.socketIo.on('message', (data) => {
      this.list.push({ name: 'xz', msg: data.msg })
      this.scrollBottom()
    })
  },
  methods: {
    scrollBottom () {
      // 操作dom  需要：把scrollTop 设置成可以卷曲最大高度
      this.$nextTick(() => {
        this.$refs.list.scrollTop = this.$refs.list.scrollHeight
      })
    },
    send () {
      if (!this.value) return false
      this.loading = true
      // 发消息
      this.socketIo.emit('message', { msg: this.value, timestamp: Date.now() })
      // 存聊天记录
      this.list.push({ name: 'self', msg: this.value })
      this.loading = false
      this.value = ''
      this.scrollBottom()
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  background:#fafafa;
  padding: 46px 0 50px 0;
  .chat-list {
    height: 100%;
    overflow-y: scroll;
    .chat-item{
      padding: 10px;
      .van-image{
        vertical-align: top;
        width: 40px;
        height: 40px;
      }
      .chat-pao{
        vertical-align: top;
        display: inline-block;
        min-width: 40px;
        max-width: 70%;
        min-height: 40px;
        line-height: 38px;
        border: 0.5px solid #c2d9ea;
        border-radius: 4px;
        position: relative;
        padding: 0 10px;
        background-color: #e0effb;
        word-break: break-all;
        font-size: 14px;
        color: #333;
        &::before{
          content: "";
          width: 10px;
          height: 10px;
          position: absolute;
          top: 12px;
          border-top:0.5px solid #c2d9ea;
          border-right:0.5px solid #c2d9ea;
          background: #e0effb;
        }
      }
    }
  }
}
.chat-item.right{
  text-align: right;
  .chat-pao{
    margin-left: 0;
    margin-right: 15px;
    &::before{
      right: -6px;
      transform: rotate(45deg);
    }
  }
}
.chat-item.left{
  text-align: left;
  .chat-pao{
    margin-left: 15px;
    margin-right: 0;
    &::before{
      left: -5px;
      transform: rotate(-135deg);
    }
  }
}
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
}
</style>
