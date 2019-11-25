<template>
  <div class="comment">
    <!-- 评论列表 -->
    <van-list @load="getComments()" :immediate-check="false" v-model="loading" :finished="finished" finished-text="没有更多了">
      <div
        class="item van-hairline--bottom van-hairline--top"
        v-for="item in comments"
        :key="item.com_id.toString()"
      >
        <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
        <div class="info">
          <p>
            <span class="name">{{item.aut_name}}</span>
            <span style="float:right">
              <span class="van-icon van-icon-good-job-o zan"></span>
              <span class="count">{{item.like_count}}</span>
            </span>
          </p>
          <p>{{item.content}}</p>
          <p>
            <span class="time">{{item.pubdate|relTime}}</span>&nbsp;
            <van-tag plain @click="openReplyDailog(item.com_id.toString())">{{item.reply_count}} 回复</van-tag>
          </p>
        </div>
      </div>
    </van-list>
    <!-- 底部输入框 -->
    <div class="reply-container van-hairline--top">
      <van-field v-model.trim="value" placeholder="写评论...">
        <van-loading v-if="submiting" slot="button" type="spinner" size="16px"></van-loading>
        <span class="submit" @click="submit()" v-else slot="button">提交</span>
      </van-field>
    </div>
    <!-- 回复的对话框 -->
    <van-action-sheet @close="commentId=null" v-model="showReply" class="reply_dailog" title="回复评论">
      <van-list @load="getReplys()" :immediate-check="false" v-model="reply.loading" :finished="reply.finished" finished-text="没有更多回复了">
        <div class="item van-hairline--bottom van-hairline--top" v-for="item in reply.list" :key="item.com_id.toString()">
          <van-image round width="1rem" height="1rem" fit="fill" :src="item.aut_photo" />
          <div class="info">
            <p><span class="name">{{item.aut_name}}</span></p>
            <p>{{item.content}}</p>
            <p><span class="time">{{item.pubdate|relTime}}</span></p>
          </div>
        </div>
      </van-list>
    </van-action-sheet>
  </div>
</template>

<script>
import { getCommentsOrReplys, commentOrReply } from '@/api/article'
export default {
  data () {
    return {
      // 输入的内容
      value: '',
      submiting: false,
      // --------------- 评论列表相关数据 ---------------
      loading: false,
      finished: false,
      offset: null,
      comments: [],
      showReply: false,
      // 点击回复按钮 记录的当前评论ID
      commentId: null,
      // --------------- 回复列表相关数据 ---------------
      reply: {
        loading: false,
        finished: false,
        offset: null,
        list: []
      }
    }
  },
  // 当前组件在Article组件使用，这个组件被缓存了。
  // 目的：每次进入文章的时候，拿到最新的评论数据。
  // 什么时候来加载评论数据？ activated钩子加载第一次数据
  // van-list 在初始化的时候主动触发一次 @load 事件
  activated () {
    // 重置数据
    this.comments = []
    this.loading = true
    this.finished = false
    // 加载频道列表
    this.getComments()
  },
  methods: {
    // 提交 评论 或者 回复
    async submit () {
      try {
        // 判断是否输入内容
        if (!this.value) return false
        // 开启提交效果
        this.submiting = true
        // 发请求 (评论 回复)
        if (this.commentId) {
        // 回复
          const data = await commentOrReply(this.commentId, this.value, this.$route.params.id)
          // 成功
          this.$toast.success('回复成功')
          // 回复列表顶部追加新的回复
          this.reply.list.unshift(data.new_obj)
          // 给当前频道的回复数量加1
          const currComment = this.comments.find(item => item.com_id.toString() === this.commentId)
          currComment.reply_count++
        } else {
        // 评论
          const data = await commentOrReply(this.$route.params.id, this.value)
          // 成功
          this.$toast.success('评论成功')
          // 回复评论顶部追加新的评论
          this.comments.unshift(data.new_obj)
        }
        // 结束提交中效果
        this.submiting = false
        this.value = ''
      } catch (e) {
        this.$toast.fail('操作失败')
        this.submiting = false
      }
    },
    // 打开回复对话框
    openReplyDailog (comId) {
      // 重置一些数据
      this.reply.list = []
      this.reply.loading = true
      this.reply.finished = false
      // 打开对话框
      this.showReply = true
      // 记录当前点击评论ID
      this.commentId = comId
      // 获取数据
      this.getReplys()
    },
    async getReplys () {
      await this.$sleep()
      // 获取回复列表数据
      const data = await getCommentsOrReplys({
        type: 'c',
        source: this.commentId,
        offset: this.reply.offset
      })
      // 追加数据
      this.reply.list.push(...data.results)
      // 结束加载中状态
      this.reply.loading = false
      // 判断是否还有数据
      if (data.last_id > data.end_id) {
        this.reply.offset = data.last_id
      } else {
        this.reply.finished = true
      }
    },
    // 获取评论
    async getComments () {
      await this.$sleep()
      const data = await getCommentsOrReplys({
        type: 'a',
        source: this.$route.params.id,
        offset: this.offset
      })
      this.comments.push(...data.results)
      // 结束加载中效果
      this.loading = false
      // 判断是否还有数据
      if (data.last_id > data.end_id) {
        // 加载下一页数据  需要上一次加载数据最后的ID
        this.offset = data.last_id
      } else {
        this.finished = true
      }
    }
  }
}
</script>

<style scoped lang='less'>
// 评论列表
.comment {
  margin-top: 10px;
  /deep/ .item {
    display: flex;
    padding: 10px 0;
    .info {
      flex: 1;
      padding-left: 10px;
      .name {
        color: #069;
      }
      .zan {
        vertical-align: middle;
        padding-right: 2px;
      }
      .count {
        vertical-align: middle;
        font-size: 10px;
        color: #666;
      }
      .time {
        color: #666;
      }
      p {
        padding: 5px 0;
        margin: 0;
      }
    }
  }
  /deep/ .van-button:active::before {
    background: transparent;
  }
}
// 输入框
.reply-container {
  position: fixed;
  left: 0;
  bottom: 0;
  height: 44px;
  width: 100%;
  background: #f5f5f5;
  z-index: 9999;
  .submit {
    font-size: 12px;
    color: #3296fa;
  }
}
// 回复
.van-popup--bottom{
  &.van-popup--round{
    border-radius: 0;
  }
}
.reply_dailog {
  height: 100%;
  max-height: 100%;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  .van-action-sheet__header {
    background: #3296fa;
    color: #fff;
    .van-icon-close {
      color: #fff;
    }
  }
  .van-action-sheet__content{
    flex: 1;
    overflow-y: auto;
    padding: 0 10px 44px;
  }
}
</style>
