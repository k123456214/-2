<template>
  <el-container class="layout-container">
    <!-- 侧边栏 -->
    <el-aside width="220px" class="layout-aside">
      <div style="height: 60px; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 600; background: #263445;">
        <el-icon style="margin-right: 8px;"><Apple /></el-icon>
        生鲜管理系统
      </div>
      <el-menu
        :default-active="activeMenu"
        :router="true"
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#67C23A"
        collapse-transition="false"
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataAnalysis /></el-icon>
          <span>工作台</span>
        </el-menu-item>

        <el-menu-item index="/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>

        <el-menu-item index="/stocks">
          <el-icon><Box /></el-icon>
          <span>库存管理</span>
        </el-menu-item>

        <el-menu-item index="/cashier">
          <el-icon><ShoppingCart /></el-icon>
          <span>收银台</span>
        </el-menu-item>

        <el-menu-item index="/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>

        <el-menu-item index="/members">
          <el-icon><UserFilled /></el-icon>
          <span>会员管理</span>
        </el-menu-item>

        <el-menu-item index="/stores">
          <el-icon><OfficeBuilding /></el-icon>
          <span>门店管理</span>
        </el-menu-item>

        <el-menu-item index="/suppliers">
          <el-icon><Van /></el-icon>
          <span>供应商管理</span>
        </el-menu-item>

        <el-menu-item index="/purchases">
          <el-icon><ShoppingBag /></el-icon>
          <span>采购管理</span>
        </el-menu-item>

        <el-menu-item index="/loss">
          <el-icon><Warning /></el-icon>
          <span>损耗管理</span>
        </el-menu-item>

        <el-sub-menu index="system">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>系统管理</span>
          </template>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </el-aside>

    <!-- 右侧内容区 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="layout-header">
        <div class="header-left">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/dashboard' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentRoute.meta?.title">
              {{ currentRoute.meta.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" @command="handleCommand">
            <span style="cursor: pointer; display: flex; align-items: center; gap: 6px;">
              <el-icon><UserFilled /></el-icon>
              <span>{{ userStore.userName || '管理员' }}</span>
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                <el-dropdown-item command="logout" divided>退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="layout-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useUserStore } from '../stores/user'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const activeMenu = computed(() => {
  return route.path
})

const currentRoute = computed(() => route)

function handleCommand(command) {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(() => {
      userStore.logout()
    }).catch(() => {})
  }
}
</script>

<style scoped>
</style>
