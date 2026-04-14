import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useThemeStore } from './store/useThemeStore'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'
import Articles from './pages/Articles'
import ArticleDetail from './pages/ArticleDetail'
import Categories from './pages/Categories'
import Tags from './pages/Tags'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import WriteArticle from './pages/WriteArticle'
import MyArticles from './pages/MyArticles'

export default function App() {
  const { dark } = useThemeStore()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <BrowserRouter>
      <Routes>
        {/* 全屏写文章页（独立布局，不带 Navbar） */}
        <Route path="write" element={<WriteArticle />} />

        {/* 带 Navbar 的主布局 */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="articles" element={<Articles />} />
          <Route path="article/:id" element={<ArticleDetail />} />
          <Route path="categories" element={<Categories />} />
          <Route path="tags" element={<Tags />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="profile" element={<Profile />} />
          <Route path="my-articles" element={<MyArticles />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
