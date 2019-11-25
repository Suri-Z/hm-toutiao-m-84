import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

const Layout = () => import('@/views/Layout')
const Home = () => import('@/views/home/Index')
const Question = () => import('@/views/question/Index')
const Video = () => import('@/views/video/Index')
const User = () => import('@/views/user/Index')
const UserProfile = () => import('@/views/user/Profile')
const UserChat = () => import('@/views/user/Chat')
const Login = () => import('@/views/user/Login')
const Search = () => import('@/views/search/Index')
const SearchResult = () => import('@/views/search/Result')
const Article = () => import('@/views/home/Article')

Vue.use(VueRouter)

const routes = [
  // 公用布局相关的
  {
    path: '/',
    component: Layout,
    children: [
      { path: '/', name: 'home', component: Home, meta: { keepAlive: true } },
      { path: '/question', name: 'question', component: Question },
      { path: '/video', name: 'video', component: Video },
      { path: '/user', name: 'user', component: User }
    ]
  },
  { path: '/user/profile', name: 'user-profile', component: UserProfile },
  { path: '/user/chat', name: 'user-chat', component: UserChat },
  { path: '/login', name: 'login', component: Login },
  { path: '/search', name: 'search', component: Search },
  { path: '/search/result', name: 'search-result', component: SearchResult },
  { path: '/article/:id', name: 'article', component: Article, meta: { keepAlive: true } }
]

const router = new VueRouter({
  routes
})

// 访问权限控制（个人中心 /user，编辑资料 /user/profile，小智同学 /user/chat）
router.beforeEach((to, from, next) => {
  // 如果当前没有登录 且  访问的路径是以/user开头  拦截登录页面（回跳）
  const user = store.state.user
  if (!user.token && to.path.startsWith('/user')) {
    return next({ path: '/login', query: { redirectUrl: to.path } })
  }
  next()
})

export default router
