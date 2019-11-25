<template>
  <div class="container">
    <!-- swipeable开启手势切换功能 -->
    <van-tabs @change="changeChannel" swipeable v-model="activeIndex" :lazy-render="false">
      <van-tab :key="channel.id" v-for="channel in myChannels" :title="channel.name">
        <!-- 滚动容器 -->
        <div @scroll="remember($event)" ref="scroll-wrapper" class="scroll-wrapper">
          <van-pull-refresh
            v-model="activeChannel.downLoading"
            @refresh="onRefresh"
            :success-text="refreshSuccessText"
          >
            <van-list
              v-model="activeChannel.upLoading"
              :finished="activeChannel.finished"
              finished-text="没有更多了"
              @load="onLoad"
            >
              <van-cell :to="{name:'article',params:{id:item.art_id.toString()}}" v-for="item in activeChannel.articles" :key="item.art_id.toString()">
                <div class="article_item">
                  <h3 class="van-ellipsis">{{item.title}}</h3>
                  <div class="img_box" v-if="item.cover.type===3">
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[0]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[1]" />
                    <van-image lazy-load class="w33" fit="cover" :src="item.cover.images[2]" />
                  </div>
                  <div class="img_box" v-if="item.cover.type===1">
                    <van-image lazy-load class="w100" fit="cover" :src="item.cover.images[0]" />
                  </div>
                  <div class="info_box">
                    <span>{{item.aut_name}}</span>
                    <span>{{item.comm_count}}评论</span>
                    <span>{{item.pubdate|relTime}}</span>
                    <span
                      class="close"
                      @click.stop="openMoreAction(item.art_id.toString())"
                      v-if="user.token"
                    >
                      <van-icon name="cross"></van-icon>
                    </span>
                  </div>
                </div>
              </van-cell>
            </van-list>
          </van-pull-refresh>
        </div>
      </van-tab>
    </van-tabs>
    <!-- 频道按钮 -->
    <span class="bar_btn" @click="openChannelEdit" slot="nav-right">
      <van-icon name="wap-nav"></van-icon>
    </span>
    <!-- 使用组件：更多操作 -->
    <more-action
      v-if="user.token"
      v-model="showMoreAction"
      :articleId="articleId"
      @on-dislikes="removeArticle()"
      @on-report="removeArticle()"
    ></more-action>
    <!-- 使用组件：频道编辑 -->
    <channel-edit @on-delete="changeChannel()" v-model="showChannelEdit" :myChannels="myChannels" :activeIndex.sync="activeIndex" a.sync></channel-edit>
  </div>
</template>

<script>
import { getMyChannels } from '@/api/channel'
import { getArticles } from '@/api/article'
import { mapState } from 'vuex'
import MoreAction from './components/MoreAction'
import ChannelEdit from './components/ChannelEdit'
export default {
  name: 'home-index',
  components: { MoreAction, ChannelEdit },
  data () {
    return {
      // articles: [],
      // // 是不是正在加载中
      // upLoading: false,
      // // 是不是已经加载完毕全部数据
      // finished: false,
      // // 是不是正在刷新中
      // downLoading: false,
      // // 刷新完毕后提示文字（暂无更新|更新成功）
      refreshSuccessText: '',
      // ---------------------------------------
      // 我的频道数据
      myChannels: [],
      // 当前激活的频道索引
      activeIndex: 0,
      // 显示更多操作
      showMoreAction: false,
      // 当前点击文章ID
      articleId: null,
      // 显示频道编辑
      showChannelEdit: false
    }
  },
  computed: {
    // 获取当前激活的频道对象
    activeChannel () {
      return this.myChannels[this.activeIndex]
    },
    ...mapState(['user'])
  },
  watch: {
    user () {
      // 更新当前频道 (默认激活推荐)
      this.activeIndex = 0
      this.getMyChannels()
      this.onLoad()
    }
  },
  // 组件初始化
  created () {
    // 获取频道数据
    this.getMyChannels()
  },
  // 激活组件钩子（组件缓存） 初始化组件也会执行
  activated () {
    // 当前激活的频道的文章列表容器 scroll-wrapper 滚动之前记录的位置
    // scroll-wrapper 有几个频道就有几个容器 是一个数组[dom,dam,。。。]
    if (this.$refs['scroll-wrapper']) {
      const dom = this.$refs['scroll-wrapper'][this.activeIndex]
      dom.scrollTop = this.activeChannel.scrollTop
    }
  },
  methods: {
    // 打开频道管理
    openChannelEdit () {
      this.showChannelEdit = true
    },
    // 删除文章
    removeArticle () {
      const index = this.activeChannel.articles.findIndex(
        item => item.art_id.toString() === this.articleId
      )
      // splice(索引,删除几条)
      this.activeChannel.articles.splice(index, 1)
    },
    // 打开更多操作对话框
    openMoreAction (id) {
      this.showMoreAction = true
      this.articleId = id
    },
    // 记住滚动位置
    remember (e) {
      // 给当前频道记录阅读位置
      this.activeChannel.scrollTop = e.target.scrollTop
    },
    // 切换频道
    changeChannel () {
      // （当前频道无文章数据）自己来加载数据
      if (!this.activeChannel.articles.length) {
        // 显示加载中效果
        this.activeChannel.upLoading = true
        this.onLoad()
      } else {
        // 根据当前频道记录位置进行滚动（覆盖tab组件滚动到顶部功能）
        // 我们滚动的操作一定需要在tab组件滚动操作之后执行。

        // 我们自己操作滚动代码 (让代码在最后执行)
        // window.setTimeout(() => {
        //   const dom = this.$refs['scroll-wrapper'][this.activeIndex]
        //   dom.scrollTop = this.activeChannel.scrollTop
        // })
        // tab执行默认滚动的代码

        // vue项目中  使用 $nextTick() 下一帧
        // 情况1：当你同时操作dom时候，前面的操作效果生效
        // 情况2：当你修改数据驱动视图更新（慢）,后面操作dom可能失败
        this.$nextTick(() => {
          const dom = this.$refs['scroll-wrapper'][this.activeIndex]
          dom.scrollTop = this.activeChannel.scrollTop
        })
      }
    },
    async getMyChannels () {
      const data = await getMyChannels()
      // 渲染频道（标签页 tabs组件）
      // this.myChannels = data.channels
      // myChannels 每一项值包含 频道ID 频道名称
      // myChannels 每一项值包含 频道ID 频道名称 + 文章列表 + 正在加载 + 正在刷新 + 是否全部加载 + 时间戳
      this.myChannels = [] // 清除tabs组件的缓存
      this.$nextTick(() => {
        this.myChannels = data.channels.map(item => {
          return {
            id: item.id,
            name: item.name,
            articles: [],
            upLoading: false,
            downLoading: false,
            finished: false,
            timestamp: Date.now(),
            // 记录阅读位置
            scrollTop: 0
          }
        })
      })
    },
    async onRefresh () {
      // @refresh  在下拉的时候松手触发
      // window.setTimeout(() => {
      //   // 1. 结束正在刷新的效果
      //   this.downLoading = false
      //   // 2. 模拟数据
      //   const data = [1, 2, 3, 4]
      //   // const data = []
      //   // 判断是否有数据
      //   if (data.length) {
      //     // 3. 更新数据
      //     this.articles = data
      //     // 4. 给刷新后的提示
      //     this.refreshSuccessText = '更新成功'
      //     // 5. 有可能不满足一屏  主动加载一次数据
      //     this.onLoad()
      //     // 6. 重置加载全部数据是否完毕状态
      //     this.finished = false
      //   } else {
      //     // 3. 给刷新后的提示
      //     this.refreshSuccessText = '暂无更新'
      //   }
      // }, 1000)
      await this.$sleep()
      this.activeChannel.timestamp = Date.now()
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      this.activeChannel.downLoading = false
      if (data.results.length) {
        this.activeChannel.articles = data.results
        this.refreshSuccessText = '更新成功'
        this.activeChannel.finished = false
        // 更新当前频道下获取数据的时间戳
        this.activeChannel.timestamp = data.pre_timestamp
        this.onLoad()
      } else {
        this.refreshSuccessText = '暂无更新'
      }
    },
    async onLoad () {
      // @load特点：默认在组件初始化会加载一次。
      // @load特点：当加载的内容渲染后不足一屏，继续触发一次。
      // @load事件触发条件：往上滑动到底部触发。
      // 业务：获取列表数据进行渲染  现在是模拟
      // window.setTimeout(() => {
      //   // 数据加载成功
      //   // 1. 结束加载中效果
      //   this.upLoading = false
      //   // 2. 模拟下数据
      //   const data = []
      //   // 每次加载一次 往后生成十条数据 [1-10] [11-20] ...
      //   for (let i = this.articles.length; i < this.articles.length + 10; i++) {
      //     data.push(i + 1)
      //   }
      //   // 3. 追加数据
      //   this.articles.push(...data)
      //   // 4. 判断数据是否全部加载完毕  假设50条
      //   if (this.articles.length >= 50) {
      //     this.finished = true
      //   }
      // }, 1000)

      // 获取文章列表（组件初始化默认激活频道一定是：推荐）
      // 获取传参：当前频道的ID  时间戳
      await this.$sleep()
      const data = await getArticles(
        this.activeChannel.id,
        this.activeChannel.timestamp
      )
      this.activeChannel.upLoading = false
      this.activeChannel.articles.push(...data.results)
      if (!data.pre_timestamp) {
        this.activeChannel.finished = true
      } else {
        this.activeChannel.timestamp = data.pre_timestamp
      }
    }
  }
}
</script>

<style scoped lang='less'>
.van-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
  /deep/ .van-tabs__wrap {
    height: 36px;
    padding-right: 36px;
    .van-tab {
      line-height: 36px;
    }
    .van-tabs__line {
      background-color: #3296fa;
      height: 2px;
    }
  }
  /deep/ .van-tabs__content {
    flex: 1;
    overflow: hidden;
  }
  /deep/ .van-tab__pane {
    height: 100%;
    .scroll-wrapper {
      height: 100%;
      overflow-y: auto;
    }
  }
}
.bar_btn {
  width: 36px;
  height: 35px;
  position: absolute;
  top: 0;
  right: 0;
  &::before {
    content: "";
    width: 100%;
    height: 100%;
    position: absolute;
    z-index: 999;
    box-shadow: 0 0 10px #999;
    transform: scale(1, 0.6);
  }
  .van-icon-wap-nav {
    width: 100%;
    height: 100%;
    background: #fff;
    text-align: center;
    line-height: 35px;
    position: relative;
    z-index: 1000;
    &::before {
      font-size: 20px;
    }
  }
}
// 文章列表的样式
.article_item {
  h3 {
    font-weight: normal;
    line-height: 2;
  }
  .img_box {
    display: flex;
    justify-content: space-between;
    .w33 {
      width: 33%;
      height: 90px;
    }
    .w100 {
      width: 100%;
      height: 180px;
    }
  }
  .info_box {
    color: #999;
    line-height: 2;
    position: relative;
    font-size: 12px;
    span {
      padding-right: 10px;
      &.close {
        border: 1px solid #ddd;
        border-radius: 2px;
        line-height: 15px;
        height: 12px;
        width: 16px;
        text-align: center;
        padding-right: 0;
        font-size: 8px;
        position: absolute;
        right: 0;
        top: 7px;
      }
    }
  }
}
</style>
