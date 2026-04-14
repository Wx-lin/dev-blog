import { request } from '@umijs/max';

// ---- Auth ----
export const authLogin = (data: { username: string; password: string }) =>
  request<API.Result<API.UserDTO>>('/api/user/login', { method: 'POST', data });

export const authLogout = () =>
  request('/api/user/logout', { method: 'POST' });

export const authInfo = () =>
  request<API.Result<API.UserDTO>>('/api/user/info', { method: 'GET' });

// ---- Dashboard ----
export const getDashboardOverview = () =>
  request<API.Result<API.DashboardDTO>>('/admin/dashboard/overview', { method: 'GET' });

// ---- Articles ----
export const getArticleList = (params?: {
  keyword?: string;
  categoryId?: number;
  tagId?: number;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}) => request<API.Result<API.PageResult<API.ArticleDTO>>>('/admin/article/list', { method: 'GET', params });

export const getArticleDetail = (id: number) =>
  request<API.Result<API.ArticleDTO>>('/admin/article/detail', { method: 'GET', params: { id } });

export const saveArticle = (data: {
  id?: number;
  title: string;
  summary?: string;
  content: string;
  cover?: string;
  categoryId: number;
  tagIds?: number[];
  isTop?: number;
  status?: number;
}) => request<API.Result<number>>('/admin/article/save', { method: 'POST', data });

export const deleteArticle = (id: number) =>
  request('/admin/article/delete', { method: 'POST', params: { id } });

// ---- Categories ----
export const getCategoryList = () =>
  request<API.Result<API.CategoryDTO[]>>('/admin/category/list', { method: 'GET' });

export const saveCategory = (data: { id?: number; name: string; description?: string; sort?: number }) =>
  request<API.Result<number>>('/admin/category/save', { method: 'POST', data });

export const deleteCategory = (id: number) =>
  request('/admin/category/delete', { method: 'POST', params: { id } });

// ---- Tags ----
export const getTagList = () =>
  request<API.Result<API.TagDTO[]>>('/admin/tag/list', { method: 'GET' });

export const saveTag = (data: { id?: number; name: string }) =>
  request<API.Result<number>>('/admin/tag/save', { method: 'POST', data });

export const deleteTag = (id: number) =>
  request('/admin/tag/delete', { method: 'POST', params: { id } });

// ---- Comments ----
export const getCommentList = (params?: {
  articleId?: number;
  status?: number;
  pageNum?: number;
  pageSize?: number;
}) => request<API.Result<API.PageResult<API.CommentDTO>>>('/admin/comment/list', { method: 'GET', params });

export const approveComment = (id: number) =>
  request('/admin/comment/approve', { method: 'POST', params: { id } });

export const rejectComment = (id: number) =>
  request('/admin/comment/reject', { method: 'POST', params: { id } });

export const deleteComment = (id: number) =>
  request('/admin/comment/delete', { method: 'POST', params: { id } });

// ---- Notifications ----
export const sendNotification = (data: {
  targetType: 'all' | 'user';
  userId?: number;
  title: string;
  content: string;
}) => request<API.Result<number>>('/admin/notify/send', { method: 'POST', data });

// ---- Users ----
export const getUserList = (params?: { pageNum?: number; pageSize?: number }) =>
  request<API.Result<API.PageResult<API.UserDTO>>>('/admin/user/list', { method: 'GET', params });

export const setUserStatus = (userId: number, status: number) =>
  request('/admin/user/status', { method: 'POST', params: { userId, status } });
