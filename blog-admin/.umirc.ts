import { defineConfig } from '@umijs/max';

export default defineConfig({
  antd: {},
  access: {},
  model: {},
  initialState: {},
  request: {
    dataField: '',
  },
  layout: {
    title: 'DevBlog 管理后台',
    logo: false,
  },
  routes: [
    {
      path: '/login',
      component: './login',
      layout: false,
      name: '登录',
    },
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      name: '仪表盘',
      path: '/dashboard',
      component: './dashboard',
      icon: 'DashboardOutlined',
    },
    {
      name: '文章管理',
      path: '/articles',
      component: './articles',
      icon: 'FileTextOutlined',
    },
    {
      name: '分类管理',
      path: '/categories',
      component: './categories',
      icon: 'AppstoreOutlined',
    },
    {
      name: '标签管理',
      path: '/tags',
      component: './tags',
      icon: 'TagsOutlined',
    },
    {
      name: '评论管理',
      path: '/comments',
      component: './comments',
      icon: 'MessageOutlined',
    },
    {
      name: '系统通知',
      path: '/notifications',
      component: './notifications',
      icon: 'NotificationOutlined',
    },
    {
      name: '用户管理',
      path: '/users',
      component: './users',
      icon: 'TeamOutlined',
    },
  ],
  npmClient: 'pnpm',
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
    '/admin': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    },
  },
});
