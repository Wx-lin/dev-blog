declare namespace API {
  interface Result<T = unknown> {
    code: number;
    message: string;
    data: T;
  }

  interface PageResult<T> {
    list: T[];
    total: number;
    pageNum: number;
    pageSize: number;
  }

  interface UserDTO {
    id: number;
    username: string;
    nickname: string;
    avatar: string;
    email: string;
    role: number;
    roleDesc: string;
    status: number;
    createTime: string;
    /** 仅登录接口返回，其他接口为 null */
    token?: string | null;
  }

  interface TagDTO {
    id: number;
    name: string;
    articleCount: number;
    createTime: string;
  }

  interface ArticleDTO {
    id: number;
    title: string;
    summary: string;
    content: string | null;
    cover: string;
    categoryId: number;
    categoryName: string;
    authorId: number;
    authorNickname: string;
    status: number;
    statusDesc: string;
    isTop: number;
    viewCount: number;
    commentCount: number;
    likeCount: number;
    tags: TagDTO[];
    publishTime: string;
    createTime: string;
    updateTime: string;
  }

  interface CategoryDTO {
    id: number;
    name: string;
    description: string;
    sort: number;
    articleCount: number;
    createTime: string;
  }

  interface CommentDTO {
    id: number;
    articleId: number;
    articleTitle: string | null;
    userId: number;
    userNickname: string;
    userAvatar: string;
    parentId: number;
    replyUserId: number | null;
    replyUserNickname: string | null;
    content: string;
    status: number;
    statusDesc: string;
    children: CommentDTO[];
    createTime: string;
  }

  interface NotificationDTO {
    id: number;
    type: string;
    typeDesc: string;
    title: string;
    content: string;
    sourceId: number | null;
    sourceType: string | null;
    senderId: number | null;
    senderNickname: string | null;
    senderAvatar: string | null;
    isRead: number;
    createTime: string;
  }

  interface DashboardDTO {
    totalArticles: number;
    publishedArticles: number;
    draftArticles: number;
    totalComments: number;
    pendingComments: number;
    totalUsers: number;
    totalCategories: number;
    totalTags: number;
    totalViewCount: number;
  }
}
