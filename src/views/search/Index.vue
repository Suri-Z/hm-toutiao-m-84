<template>
  <div class="container">
    <van-nav-bar title="搜索中心" left-arrow @click-left="$router.back()" />
    <van-search v-model.trim="q" placeholder="请输入搜索关键词" shape="round" @search="onSearch" />
    <!-- 词条 -->
    <van-cell-group class="suggest-box" v-if="q">
      <van-cell @click="onSearch(item.replace(`<span>${q}</span>`,q))" icon="search" v-for="item in options" :key="item">
        <p v-html="item"></p>
      </van-cell>
    </van-cell-group>
    <!-- 历史记录 -->
    <div class="history-box" v-else-if="historyList.length">
      <div class="head">
        <span>历史记录</span>
        <van-icon @click="clearHistory()" name="delete"></van-icon>
      </div>
      <van-cell-group>
        <van-cell v-for="key in historyList" :key="key">
          <a @click="toSearch(key)" class="word_btn">{{key}}</a>
          <van-icon @click="delHistory(key)" class="close_btn" slot="right-icon" name="cross" />
        </van-cell>
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { suggest } from '@/api/article'
// 约定本地存储的key    hm-toutiao-m-84-history-key
// 约定本地存储的value  '["电脑","手机"]'
const KEY = 'hm-toutiao-m-84-history-key'
export default {
  name: 'search-index',
  data () {
    return {
      // 搜索关键字  v-model.trim 自动剔除两侧的空字符
      q: '',
      // 搜索历史记录
      historyList: JSON.parse(window.localStorage.getItem(KEY) || '[]'),
      // 词条
      options: [],
      // 计时器
      timer: null
    }
  },
  watch: {
    q () {
      if (!this.q) return false

      // 优化：(函数防抖)
      // 1. 当你输入内容后，等待一些时间计时，如果用户没有改变内容，此时发送请求
      // 2. 当你输入内容后，在等待的过程中，用户改变了内容，重新计时
      window.clearTimeout(this.timer)
      this.timer = window.setTimeout(async () => {
        // 发请求获取词条
        const data = await suggest(this.q)
        this.options = data.options.map(item => {
          return item.toLowerCase().replace(this.q, `<span>${this.q}</span>`)
        })
      }, 300)
    }
  },
  methods: {
    onSearch (key) {
      // 触发条件：按下回车键触发，如果是手机点击虚拟键盘（输入法）中enter按钮，搜索按钮。
      // imput type="search"  这种类型的输入框在移动端调用出来的虚拟键盘（enter|搜索）
      if (!key.trim()) return false
      // 追加历史记录 (排除重复的key)
      const set = new Set(this.historyList)
      set.add(key)
      // 把set转为数组  Array.from(set)  [...set]
      this.historyList = [...set]
      // 保存在本地
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
      // 跳转到搜索结果 传参关键字
      this.$router.push({ path: '/search/result', query: { q: key } })
    },
    // 跳转去搜索
    toSearch (key) {
      this.$router.push({ path: '/search/result', query: { q: key } })
    },
    // 删除历史
    delHistory (key) {
      const index = this.historyList.findIndex(item => item === key)
      this.historyList.splice(index, 1)
      // 本地存储
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
    },
    // 清空历史
    clearHistory () {
      this.historyList = []
      // 本地存储
      window.localStorage.setItem(KEY, JSON.stringify(this.historyList))
    }
  }
}
</script>

<style scoped lang='less'>
.history-box {
  padding: 0 20px;
  .head {
    line-height: 36px;
    color: #999;
    .van-icon {
      font-size: 16px;
      float: right;
      margin-top: 10px;
    }
  }
  .van-cell {
    padding: 10px 0;
  }
  .word_btn {
    color: #3296fa;
  }
  .close_btn {
    margin-top: 5px;
    color: #999;
  }
}
.suggest-box{
  /deep/ .van-cell{
    padding: 10px 20px;
    color: #999;
    p{
      span{
        color: red;
      }
    }
  }
}
</style>
