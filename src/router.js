import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/pictures',
      name: 'pictures',
      component: () => import(/* webpackChunkName: "about" */ './views/Pictures.vue')
    },
    {
      path: '/pictures/:id',
      name: 'picture',
      component: () => import(/* webpackChunkName: "about" */ './views/PictureDetails.vue')
    },
    {
      path: '/users/:id',
      name: 'user',
      component: () => import(/* webpackChunkName: "about" */ './views/UserDetails.vue')
    }
  ]
})
