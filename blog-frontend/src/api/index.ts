import request from './request'

// ---- Types ----
export interface PageResult<T> {
  list: T[]
  total: number
  pageNum: number
  pageSize: number
}

export interface UserDTO {
  id: number
  username: string
  nickname: string
  avatar: string
  email: string
  role: number
  roleDesc: string
  status: number
  createTime: string
  /** 仅登录接口返回，其他接口为 null */
  token?: string | null
}

export interface TagDTO {
  id: number
  name: string
  articleCount: number
  createTime: string
}

export interface ArticleDTO {
  id: number
  title: string
  summary: string
  content: string | null
  cover: string
  categoryId: number
  categoryName: string
  authorId: number
  authorNickname: string
  status: number
  statusDesc: string
  isTop: number
  viewCount: number
  commentCount: number
  likeCount: number
  tags: TagDTO[]
  publishTime: string
  createTime: string
  updateTime: string
}

export interface CategoryDTO {
  id: number
  name: string
  description: string
  sort: number
  articleCount: number
  createTime: string
}

export interface NotificationDTO {
  id: number
  type: 'COMMENT' | 'REPLY' | 'LIKE' | 'SYSTEM'
  typeDesc: string
  title: string
  content: string
  sourceId: number
  sourceType: 'article' | 'comment'
  senderId: number
  senderNickname: string
  senderAvatar: string
  isRead: number
  createTime: string
}

export interface CommentDTO {
  id: number
  articleId: number
  articleTitle: string | null
  userId: number
  userNickname: string
  userAvatar: string
  parentId: number
  replyUserId: number | null
  replyUserNickname: string | null
  content: string
  status: number
  statusDesc: string
  children: CommentDTO[]
  createTime: string
}

export interface ArticleSaveDTO {
  /** 文章ID，新建时不传，编辑时必传 */
  id?: number
  title: string
  summary?: string
  content: string
  cover?: string
  categoryId: number
  tagIds?: number[]
  isTop?: number
  /** 0-草稿 1-已发布，默认 0 */
  status?: number
}

// ---- User APIs ----
export const userApi = {
  login: (data: { username: string; password: string }) =>
    request.post<any, UserDTO>('/user/login', data),
  register: (data: { username: string; password: string; nickname: string; email?: string }) =>
    request.post<any, number>('/user/register', data),
  logout: () => request.post('/user/logout'),
  info: () => request.get<any, UserDTO>('/user/info'),
  update: (data: {
    nickname?: string
    avatar?: string
    email?: string
    oldPassword?: string
    newPassword?: string
  }) => request.post('/user/update', data),
}

// ---- Article APIs ----
export const articleApi = {
  /** 公开文章列表（仅已发布） */
  list: (params?: {
    keyword?: string
    categoryId?: number
    tagId?: number
    pageNum?: number
    pageSize?: number
  }) => request.get<any, PageResult<ArticleDTO>>('/article/list', { params }),

  /** 文章详情（自动 +1 浏览量） */
  detail: (id: number) =>
    request.get<any, ArticleDTO>('/article/detail', { params: { id } }),

  /** 点赞文章 */
  like: (id: number) =>
    request.post('/article/like', null, { params: { id } }),

  /** 我的文章列表 🔒 */
  my: (params?: {
    keyword?: string
    status?: number
    pageNum?: number
    pageSize?: number
  }) => request.get<any, PageResult<ArticleDTO>>('/article/my', { params }),

  /** 新建 / 编辑我的文章 🔒（id 为空时新建，不为空时编辑） */
  save: (data: ArticleSaveDTO) =>
    request.post<any, number>('/article/save', data),

  /** 删除我的文章 🔒 */
  delete: (id: number) =>
    request.post('/article/delete', null, { params: { id } }),
}

// ---- Category APIs ----
export const categoryApi = {
  list: () => request.get<any, CategoryDTO[]>('/category/list'),
}

// ---- Tag APIs ----
export const tagApi = {
  list: () => request.get<any, TagDTO[]>('/tag/list'),
}

// ---- Notify APIs ----
export const notifyApi = {
  /** 获取未读通知数 🔒 */
  unreadCount: () =>
    request.get<any, number>('/notify/unread/count'),
  /** 通知列表（分页） 🔒 */
  list: (params?: { pageNum?: number; pageSize?: number }) =>
    request.get<any, PageResult<NotificationDTO>>('/notify/list', { params }),
  /** 标记单条已读 🔒 */
  read: (id: number) =>
    request.post('/notify/read', null, { params: { id } }),
  /** 全部标记已读 🔒 */
  readAll: () =>
    request.post('/notify/read/all'),
}

// ---- Comment APIs ----
export const commentApi = {
  list: (articleId: number) =>
    request.get<any, CommentDTO[]>('/comment/list', { params: { articleId } }),
  add: (data: {
    articleId: number
    parentId?: number
    replyUserId?: number
    content: string
  }) => request.post<any, number>('/comment/add', data),
}
