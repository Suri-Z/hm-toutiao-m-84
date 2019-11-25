// 做为Vue的插件
// 作用：注册全局组件  注册原型函数  注册自定义指令  注册过滤器
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
dayjs.extend(relativeTime)

// 延时函数
const sleep = () => {
  return new Promise((resolve, reject) => {
    window.setTimeout(() => {
      resolve()
    }, 1000)
  })
}

// 获取相对事件  Vue.filter('过滤器名称',处理函数(value){})
// value 是使用过滤器管道符前的 js表达式执行结果
const relTime = (time) => {
  // 依赖一个dayjs的插件 RelativeTime
  // dayjs() 获取当前时间
  // .from(time) 获取相对时间
  // 语言本地化 local
  return dayjs().locale('zh-cn').from(time)
}

export default {
  install (Vue) {
    // 原型挂载
    Vue.prototype.$sleep = sleep
    // 过滤器
    Vue.filter('relTime', relTime)
  }
}
