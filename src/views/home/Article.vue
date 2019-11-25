<template>
  <div class='container' ref="container" @scroll="remember($event)">
    <van-nav-bar fixed left-arrow @click-left="$router.back()" title="文章详情"></van-nav-bar>
    <div class="detail">
      <h3 class="title">{{article.title}}</h3>
      <div class="author">
        <van-image round width="1rem" height="1rem" fit="fill" :src="article.aut_photo" />
        <div class="text">
          <p class="name">{{article.aut_name}}</p>
          <p class="time">{{article.pubdate|relTime}}</p>
        </div>
        <van-button @click="followed" round size="small" type="info">
           {{article.is_followed?'已关注':'+ 关注'}}
        </van-button>
      </div>
      <div class="content" v-html="article.content"></div>
      <div class="zan">
        <van-button @click="updateStatus(1)" round size="small" :class="{active:article.attitude===1}" plain icon="like-o">点赞</van-button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <van-button @click="updateStatus(0)" round size="small" :class="{active:article.attitude===0}" plain icon="delete">不喜欢</van-button>
      </div>
      <!-- 评论与回复的组件 -->
      <comment></comment>
    </div>
  </div>
</template>

<script>
import Comment from './components/Comment'
import { followed, unFollowed } from '@/api/user'
import { getArticleDetail, disLikes, unDisLikes, likings, unLikings } from '@/api/article'
// 原生html元素  article 标签  组件的名字不能和html标签重名
export default {
  name: 'article-index',
  components: { Comment },
  // 当前文章详情组件已经被缓存 在激活组件获取文章详情
  // 需求：如果激活组件的时候文章ID和上一次激活组件的ID相同加载文章了
  data () {
    return {
      // 文章详情 （ art_id 文章ID）
      article: {
        // 防止第一次获取ID报错
        art_id: ''
      },
      scrollTop: 0
    }
  },
  activated () {
    // 当前访问的ID  this.$route.params.id
    // 之前访问的ID  this.article.art_id
    if (this.$route.params.id !== this.article.art_id.toString()) {
      this.getArticle()
      // 重置 记忆的位置
      this.scrollTop = 0
    } else {
      // 滚动 记忆的位置
      this.$refs['container'].scrollTop = this.scrollTop
    }
  },
  methods: {
    // 点赞 取消点赞 不喜欢 取消不喜欢
    async updateStatus (btnType) {
      try {
        // btnType 1 点赞按钮  0 不喜欢按钮
        if (btnType === 1) {
          if (this.article.attitude === 1) {
            // 取消点赞
            await unLikings(this.article.art_id)
            this.article.attitude = -1
          } else {
            // 点赞
            await likings(this.article.art_id)
            this.article.attitude = 1
          }
        } else {
          if (this.article.attitude === 0) {
            // 取消不喜欢
            await unDisLikes(this.article.art_id)
            this.article.attitude = -1
          } else {
            // 不喜欢
            await disLikes(this.article.art_id)
            this.article.attitude = 0
          }
        }
        this.$toast.success('操作成功')
      } catch (e) {
        if (e.response.status !== 401) {
          this.$toast.fail('操作失败')
        }
      }
    },
    // 关注与取消关注
    async followed () {
      try {
        if (this.article.is_followed) {
        // 操作：取消关注
          await unFollowed(this.article.aut_id)
          this.$toast.success('取消关注成功')
          // 更新状态
          this.article.is_followed = false
        } else {
          // 操作：添加关注
          await followed(this.article.aut_id)
          this.$toast.success('添加关注成功')
          this.article.is_followed = true
        }
      } catch (e) {
        if (e.response.status !== 401) {
          this.$toast.fail('操作失败')
        }
      }
    },
    // 记住滚动位置
    remember (e) {
      this.scrollTop = e.target.scrollTop
    },
    // 获取文章详情
    async getArticle () {
      const data = await getArticleDetail(this.$route.params.id)
      this.article = data
    }
  }
}
</script>

<style scoped lang='less'>
.container {
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
}
.detail {
  padding: 46px 10px 44px;
  // height: 1000%;
  .title {
    font-size: 18px;
    line-height: 2;
  }
  .zan{
    text-align: center;
    padding: 10px 0;
    .active{
      border-color:red;
      color: red;
    }
  }
  .author {
    padding: 10px 0;
    display: flex;
    .text {
      flex: 1;
      padding-left: 10px;
      line-height: 1.5;
      .name {
        font-size: 14px;
        margin: 0;
      }
      .time {
        margin: 0;
        font-size: 12px;
        color: #999;
      }
    }
  }
  // 作用于 文章的内容（包含html结构）
  .content {
    padding: 20px 0;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    /deep/ img{
      max-width:100%;
      background: #f9f9f9;
    }
    /deep/ code{
      white-space: pre-wrap;
    }
  }
}
</style>
