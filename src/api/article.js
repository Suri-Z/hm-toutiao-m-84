// 导出  文章相关的API函数
import request from '@/utils/request'

/**
 * 获取文章列表
 * @param {Integer} channelId - 频道ID
 * @param {Integer} timestamp - 时间戳
 */
export const getArticles = (channelId, timestamp) => {
  return request('/app/v1_1/articles', 'get', {
    channel_id: channelId,
    timestamp,
    with_top: 1
  })
}
/**
 * 对文章不喜欢
 * @param {String} articleId - 文章ID
 */
export const disLikes = (articleId) => {
  return request('/app/v1_0/article/dislikes', 'post', {
    target: articleId
  })
}
/**
 * 取消对文章不喜欢
 * @param {String} articleId - 文章ID
 */
export const unDisLikes = (articleId) => {
  return request('/app/v1_0/article/dislikes/' + articleId, 'delete')
}
/**
 * 对文章点赞
 * @param {String} articleId - 文章ID
 */
export const likings = (articleId) => {
  return request('/app/v1_0/article/likings', 'post', {
    target: articleId
  })
}
/**
 * 取消对文章点赞
 * @param {String} articleId - 文章ID
 */
export const unLikings = (articleId) => {
  return request('/app/v1_0/article/likings/' + articleId, 'delete')
}

/**
 * 举报文章
 * @param {String} articleId - 文章ID
 * @param {Integer} type - 举报类型
 */
export const report = (articleId, type) => {
  return request('/app/v1_0/article/reports', 'post', {
    target: articleId,
    type
  })
}

/**
 * 联想建议的词条
 * @param {String} q - 搜索关键字
 */
export const suggest = (q) => {
  return request('/app/v1_0/suggestion', 'get', { q })
}

/**
 * 获取搜索结果
 * @param {Integer} page - 页码
 * @param {String} q - 搜索关键字
 * @param {Integer} perPage - 每页条数
 */
export const searchArticles = ({ page, perPage = 20, q }) => {
  // perPage = 20 指定是 给定默认值
  return request('/app/v1_0/search', 'get', {
    page,
    per_page: perPage,
    q
  })
}

/**
 * 获取文章详情
 * @param {String} articleId - 文章ID
 */
export const getArticleDetail = (articleId) => {
  return request(`/app/v1_0/articles/${articleId}`, 'get')
}

/**
 * 获取评论或回复
 * @param {String} type - a 评论列表  c  回复列表
 * @param {String} source - 评论列表 文章ID   回复列表  评论ID
 * @param {String} offset - 上一次数据最后一个ID
 * @param {Integer} limit - 每次加载的数据条数，默认是10条
 */
export const getCommentsOrReplys = ({ type, source, offset, limit = 10 }) => {
  return request('/app/v1_0/comments', 'get', {
    type, source, offset, limit
  })
}

/**
 * 提交评论或者回复
 * @param {String} target - 当你是评论操作：文章ID  当你是回复操作：评论ID
 * @param {*} content - 内容
 * @param {*} artId - 文章ID (当你是回复操作)
 */
export const commentOrReply = (target, content, artId = null) => {
  return request('/app/v1_0/comments', 'post', {
    target,
    content,
    art_id: artId
  })
}
