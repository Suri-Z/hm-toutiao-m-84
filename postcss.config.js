module.exports = {
  plugins: {
    autoprefixer: {},
    // 只是 px to rem 的配置
    // 同时 是有一个插件 amfe-flexible 设置基准值
    'postcss-pxtorem': {
      // 换算rem的基准值 标准设备iPhone6  宽度375
      // 但是设计稿是750px
      rootValue: 37.5,
      propList: ['*']
    }
  }
}
