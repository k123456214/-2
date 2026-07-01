import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '../stores/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/dashboard',
    meta: { requiresAuth: true },
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '工作台' },
      },
      {
        path: 'products',
        name: 'Products',
        component: () => import('../views/Products.vue'),
        meta: { title: '商品管理' },
      },
      {
        path: 'products/category',
        name: 'ProductCategory',
        component: () => import('../views/ProductCategory.vue'),
        meta: { title: '分类管理' },
      },
      {
        path: 'stocks',
        name: 'Stocks',
        component: () => import('../views/Stocks.vue'),
        meta: { title: '库存管理' },
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/Orders.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'cashier',
        name: 'Cashier',
        component: () => import('../views/Cashier.vue'),
        meta: { title: '收银台' },
      },
      {
        path: 'members',
        name: 'Members',
        component: () => import('../views/Members.vue'),
        meta: { title: '会员管理' },
      },
      {
        path: 'members/levels',
        name: 'MemberLevels',
        component: () => import('../views/MemberLevels.vue'),
        meta: { title: '会员等级' },
      },
      {
        path: 'stores',
        name: 'Stores',
        component: () => import('../views/Stores.vue'),
        meta: { title: '门店管理' },
      },
      {
        path: 'suppliers',
        name: 'Suppliers',
        component: () => import('../views/Suppliers.vue'),
        meta: { title: '供应商管理' },
      },
      {
        path: 'purchases',
        name: 'Purchases',
        component: () => import('../views/Purchases.vue'),
        meta: { title: '采购管理' },
      },
      {
        path: 'loss',
        name: 'Loss',
        component: () => import('../views/Loss.vue'),
        meta: { title: '损耗管理' },
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/Users.vue'),
        meta: { title: '用户管理' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth !== false && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
