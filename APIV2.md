# 接口文档

> Base URL: `http://localhost:8080`
>
> 所有接口响应均为 JSON，统一结构如下：
>
> ```json
> {
>   "code": 0,         // 0=成功，-1=失败，401=未登录
>   "message": "success",
>   "data": {}         // 业务数据，失败时为 null
> }
> ```
>
> 分页接口的 `data` 结构：
>
> ```json
> {
>   "list": [],
>   "total": 100,
>   "pageNum": 1,
>   "pageSize": 10
> }
> ```

---

## 鉴权说明

本系统采用 **JWT（JSON Web Token）机制**，流程如下：

1. 调用 `POST /api/user/login` 登录，响应 `data.token` 即为 JWT 登录凭证
2. 后续需要登录的接口，在请求 Header 中携带：
   ```
   Authorization: Bearer <token>
   ```
3. JWT 有效期为 **7 天**，过期后需重新登录
4. 调用 `POST /api/user/logout` 为客户端登出，**服务端不主动销毁 token**（JWT 无状态），前端自行清除本地保存的 token 即可

**未携带 Token 或 Token 无效时，接口返回：**
```json
{ "code": 401, "message": "未登录或登录已过期，请重新登录", "data": null }
```

> 接口说明中标注 🔒 的表示**需要登录**才能访问。

---

## 目录

- [公共数据结构](#公共数据结构)
- [前台接口](#前台接口)
  - [用户](#前台---用户)
  - [文章（公开）](#前台---文章公开)
  - [文章（需登录）](#前台---文章需登录)
  - [分类](#前台---分类)
  - [标签](#前台---标签)
  - [评论](#前台---评论)
  - [通知](#前台---通知)
- [后台接口（Admin）](#后台接口admin)
  - [数据统计](#后台---数据统计)
  - [文章管理](#后台---文章管理)
  - [分类管理](#后台---分类管理)
  - [标签管理](#后台---标签管理)
  - [评论管理](#后台---评论管理)
  - [用户管理](#后台---用户管理)
- [枚举值说明](#枚举值说明)

---

## 公共数据结构

### UserDTO 用户对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 用户ID |
| username | String | 用户名 |
| nickname | String | 昵称 |
| avatar | String | 头像URL |
| email | String | 邮箱 |
| role | Integer | 角色：1-管理员 2-普通用户 |
| roleDesc | String | 角色描述 |
| status | Integer | 状态：1-正常 0-禁用 |
| createTime | Date | 创建时间 |
| token | String | 登录 Token（**仅登录接口返回**，其他接口为 null） |

### ArticleDTO 文章对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 文章ID |
| title | String | 标题 |
| summary | String | 摘要 |
| content | String | 内容（Markdown格式，列表接口不返回） |
| cover | String | 封面图URL |
| categoryId | Long | 分类ID |
| categoryName | String | 分类名称 |
| authorId | Long | 作者ID |
| authorNickname | String | 作者昵称 |
| status | Integer | 状态：0-草稿 1-已发布 2-已下架 |
| statusDesc | String | 状态描述 |
| isTop | Integer | 是否置顶：0-否 1-是 |
| viewCount | Integer | 浏览量 |
| commentCount | Integer | 评论数 |
| likeCount | Integer | 点赞数 |
| tags | List\<TagDTO\> | 标签列表 |
| publishTime | Date | 发布时间 |
| createTime | Date | 创建时间 |
| updateTime | Date | 更新时间 |

### CategoryDTO 分类对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 分类ID |
| name | String | 分类名称 |
| description | String | 分类描述 |
| sort | Integer | 排序（越大越靠前） |
| articleCount | Integer | 文章数量 |
| createTime | Date | 创建时间 |

### TagDTO 标签对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 标签ID |
| name | String | 标签名称 |
| articleCount | Integer | 文章数量 |
| createTime | Date | 创建时间 |

### NotificationDTO 通知对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 通知ID |
| type | String | 通知类型：COMMENT / REPLY / LIKE / SYSTEM |
| typeDesc | String | 类型描述（中文）：评论了你 / 回复了你 / 赞了你的文章 / 系统通知 |
| title | String | 通知标题 |
| content | String | 通知正文 |
| sourceId | Long | 来源 ID（文章ID），可用于跳转 |
| sourceType | String | 来源类型：article / comment |
| senderId | Long | 发送人用户ID |
| senderNickname | String | 发送人昵称 |
| senderAvatar | String | 发送人头像URL |
| isRead | Integer | 是否已读：0-未读 1-已读 |
| createTime | DateTime | 创建时间 |

---

### CommentDTO 评论对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 评论ID |
| articleId | Long | 文章ID |
| articleTitle | String | 文章标题 |
| userId | Long | 评论用户ID |
| userNickname | String | 评论用户昵称 |
| userAvatar | String | 评论用户头像 |
| parentId | Long | 父评论ID，0表示顶层评论 |
| replyUserId | Long | 被回复用户ID |
| replyUserNickname | String | 被回复用户昵称 |
| content | String | 评论内容 |
| status | Integer | 状态：0-待审核 1-已通过 2-已拒绝 |
| statusDesc | String | 状态描述 |
| children | List\<CommentDTO\> | 子评论列表（树形） |
| createTime | Date | 创建时间 |

### DashboardDTO 统计数据对象

| 字段 | 类型 | 说明 |
|------|------|------|
| totalArticles | Integer | 文章总数 |
| publishedArticles | Integer | 已发布文章数 |
| draftArticles | Integer | 草稿文章数 |
| totalComments | Integer | 评论总数 |
| pendingComments | Integer | 待审核评论数 |
| totalUsers | Integer | 用户总数 |
| totalCategories | Integer | 分类总数 |
| totalTags | Integer | 标签总数 |
| totalViewCount | Long | 总浏览量 |

---

## 前台接口

> 路径前缀：`/api`

---

### 前台 - 用户

#### 注册

- **POST** `/api/user/register`
- **Content-Type:** `application/json`

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | ✅ | 用户名 |
| password | String | ✅ | 密码 |
| nickname | String | ✅ | 昵称 |
| email | String | ❌ | 邮箱 |

**请求示例：**

```json
{
  "username": "testuser",
  "password": "123456",
  "nickname": "测试用户",
  "email": "test@example.com"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": 1001
}
```

> `data` 为新注册用户的 ID

---

#### 登录

- **POST** `/api/user/login`
- **Content-Type:** `application/json`

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| username | String | ✅ | 用户名 |
| password | String | ✅ | 密码 |

**请求示例：**

```json
{
  "username": "testuser",
  "password": "123456"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": "https://example.com/avatar.jpg",
    "email": "test@example.com",
    "role": 2,
    "roleDesc": "普通用户",
    "status": 1,
    "createTime": "2026-01-01T00:00:00.000+00:00",
    "token": "a1b2c3d4e5f6..."
  }
}
```

> ⭐ `data.token` 是登录凭证，前端需保存并在后续需要登录的请求 Header 中携带：`Authorization: Bearer <token>`

---

#### 退出登录 🔒

- **POST** `/api/user/logout`
- **需要登录**

**请求 Header：**
```
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

> JWT 无状态，服务端不销毁 token；前端收到响应后自行清除本地存储的 token 即可

---

#### 获取当前登录用户信息 🔒

- **GET** `/api/user/info`
- **需要登录**

**请求 Header：**
```
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": "https://example.com/avatar.jpg",
    "email": "test@example.com",
    "role": 2,
    "roleDesc": "普通用户",
    "status": 1,
    "createTime": "2026-01-01T00:00:00.000+00:00"
  }
}
```

---

#### 修改个人信息 🔒

- **POST** `/api/user/update`
- **Content-Type:** `application/json`
- **需要登录**

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| nickname | String | ❌ | 昵称 |
| avatar | String | ❌ | 头像URL |
| email | String | ❌ | 邮箱 |
| oldPassword | String | ❌ | 旧密码（修改密码时必填） |
| newPassword | String | ❌ | 新密码（修改密码时必填） |

**请求示例：**

```json
{
  "nickname": "新昵称",
  "avatar": "https://example.com/new-avatar.jpg",
  "email": "new@example.com"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 前台 - 文章（公开）

> 以下接口无需登录，任何人可访问

---

#### 文章列表（分页，仅已发布）

- **GET** `/api/article/list`

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | ❌ | 关键词（标题/摘要搜索） |
| categoryId | Long | ❌ | 分类ID |
| tagId | Long | ❌ | 标签ID |
| pageNum | Integer | ❌ | 当前页码，默认 1 |
| pageSize | Integer | ❌ | 每页条数，默认 10 |

**请求示例：**

```
GET /api/article/list?keyword=Spring&categoryId=1&pageNum=1&pageSize=10
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "title": "Spring Boot 入门",
        "summary": "本文介绍 Spring Boot 基础...",
        "content": null,
        "cover": "https://example.com/cover.jpg",
        "categoryId": 1,
        "categoryName": "后端",
        "authorId": 1,
        "authorNickname": "admin",
        "status": 1,
        "statusDesc": "已发布",
        "isTop": 0,
        "viewCount": 100,
        "commentCount": 5,
        "likeCount": 20,
        "tags": [
          { "id": 1, "name": "Spring", "articleCount": 10, "createTime": "..." }
        ],
        "publishTime": "2026-01-01T00:00:00.000+00:00",
        "createTime": "2026-01-01T00:00:00.000+00:00",
        "updateTime": "2026-01-02T00:00:00.000+00:00"
      }
    ],
    "total": 50,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

#### 文章详情（自动+1浏览量）

- **GET** `/api/article/detail`

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 文章ID |

**请求示例：**

```
GET /api/article/detail?id=1
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "title": "Spring Boot 入门",
    "summary": "本文介绍 Spring Boot 基础...",
    "content": "# Spring Boot 入门\n\n正文 Markdown 内容...",
    "cover": "https://example.com/cover.jpg",
    "categoryId": 1,
    "categoryName": "后端",
    "authorId": 1,
    "authorNickname": "admin",
    "status": 1,
    "statusDesc": "已发布",
    "isTop": 0,
    "viewCount": 101,
    "commentCount": 5,
    "likeCount": 20,
    "tags": [
      { "id": 1, "name": "Spring", "articleCount": 10, "createTime": "..." }
    ],
    "publishTime": "2026-01-01T00:00:00.000+00:00",
    "createTime": "2026-01-01T00:00:00.000+00:00",
    "updateTime": "2026-01-02T00:00:00.000+00:00"
  }
}
```

> 文章不存在或未发布时返回 `{ "code": -1, "message": "文章不存在" }`

---

#### 点赞文章

- **POST** `/api/article/like`

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 文章ID |

**请求示例：**

```
POST /api/article/like?id=1
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 前台 - 文章（需登录）

> 以下接口均需要在 Header 中携带 Token：`Authorization: Bearer <token>`

---

#### 新建 / 编辑我的文章 🔒

- **POST** `/api/article/save`
- **Content-Type:** `application/json`
- **需要登录**

> `id` 为空时新建，`id` 不为空时编辑（只能编辑自己的文章，否则返回"无权操作他人文章"）

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ❌ | 文章ID，新建时不传，编辑时必传 |
| title | String | ✅ | 标题 |
| summary | String | ❌ | 摘要 |
| content | String | ✅ | 内容（Markdown格式） |
| cover | String | ❌ | 封面图URL |
| categoryId | Long | ✅ | 分类ID |
| tagIds | List\<Long\> | ❌ | 标签ID列表 |
| isTop | Integer | ❌ | 是否置顶：0-否 1-是，默认 0 |
| status | Integer | ❌ | 状态：0-草稿 1-已发布，默认 0 |

**请求示例（新建并发布）：**

```json
{
  "title": "我的第一篇文章",
  "summary": "文章摘要",
  "content": "# 标题\n\n正文内容...",
  "cover": "https://example.com/cover.jpg",
  "categoryId": 1,
  "tagIds": [1, 2],
  "isTop": 0,
  "status": 1
}
```

**请求示例（保存草稿）：**

```json
{
  "title": "草稿标题",
  "content": "# 未完成的内容...",
  "categoryId": 1,
  "status": 0
}
```

**请求示例（编辑）：**

```json
{
  "id": 10,
  "title": "修改后的标题",
  "content": "# 修改后内容...",
  "categoryId": 1,
  "status": 1
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": 10
}
```

> `data` 为文章ID；`authorId` 自动设为当前登录用户

---

#### 删除我的文章 🔒

- **POST** `/api/article/delete`
- **需要登录**

> 只能删除自己的文章，操作他人文章返回错误

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 文章ID |

**请求示例：**

```
POST /api/article/delete?id=10
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

**错误示例（操作他人文章）：**

```json
{
  "code": -1,
  "message": "无权操作他人文章",
  "data": null
}
```

---

#### 我的文章列表 🔒

- **GET** `/api/article/my`
- **需要登录**

> 只返回当前登录用户自己的文章，支持按状态筛选（草稿/已发布）

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | ❌ | 关键词（标题/摘要搜索） |
| status | Integer | ❌ | 状态：0-草稿 1-已发布，不传则查全部 |
| pageNum | Integer | ❌ | 当前页码，默认 1 |
| pageSize | Integer | ❌ | 每页条数，默认 10 |

**请求示例：**

```
GET /api/article/my?status=0&pageNum=1&pageSize=10
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10,
        "title": "草稿标题",
        "summary": "",
        "content": null,
        "status": 0,
        "statusDesc": "草稿",
        "authorId": 1001,
        "authorNickname": "测试用户",
        "viewCount": 0,
        "commentCount": 0,
        "likeCount": 0,
        "tags": [],
        "createTime": "2026-04-13T00:00:00.000+00:00",
        "updateTime": "2026-04-13T00:00:00.000+00:00"
      }
    ],
    "total": 3,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

### 前台 - 分类

#### 分类列表（全量）

- **GET** `/api/category/list`

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "后端",
      "description": "后端开发相关",
      "sort": 10,
      "articleCount": 20,
      "createTime": "2026-01-01T00:00:00.000+00:00"
    },
    {
      "id": 2,
      "name": "前端",
      "description": "前端开发相关",
      "sort": 9,
      "articleCount": 15,
      "createTime": "2026-01-01T00:00:00.000+00:00"
    }
  ]
}
```

---

### 前台 - 标签

#### 标签列表（全量，用于标签云）

- **GET** `/api/tag/list`

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 1,
      "name": "Spring",
      "articleCount": 10,
      "createTime": "2026-01-01T00:00:00.000+00:00"
    },
    {
      "id": 2,
      "name": "Vue",
      "articleCount": 8,
      "createTime": "2026-01-01T00:00:00.000+00:00"
    }
  ]
}
```

---

### 前台 - 评论

#### 获取文章评论（树形结构，仅已审核）

- **GET** `/api/comment/list`

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| articleId | Long | ✅ | 文章ID |

**请求示例：**

```
GET /api/comment/list?articleId=1
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": [
    {
      "id": 10,
      "articleId": 1,
      "userId": 1001,
      "userNickname": "测试用户",
      "userAvatar": "https://example.com/avatar.jpg",
      "parentId": 0,
      "replyUserId": null,
      "replyUserNickname": null,
      "content": "写的很好！",
      "status": 1,
      "statusDesc": "已通过",
      "children": [
        {
          "id": 11,
          "articleId": 1,
          "userId": 1002,
          "userNickname": "另一位用户",
          "parentId": 10,
          "replyUserId": 1001,
          "replyUserNickname": "测试用户",
          "content": "同意！",
          "status": 1,
          "statusDesc": "已通过",
          "children": [],
          "createTime": "2026-01-02T00:00:00.000+00:00"
        }
      ],
      "createTime": "2026-01-01T00:00:00.000+00:00"
    }
  ]
}
```

---

#### 发表评论 🔒

- **POST** `/api/comment/add`
- **Content-Type:** `application/json`
- **需要登录**

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| articleId | Long | ✅ | 文章ID |
| parentId | Long | ❌ | 父评论ID，顶层评论不传或传 0 |
| replyUserId | Long | ❌ | 被回复用户ID，顶层评论不传 |
| content | String | ✅ | 评论内容 |

**请求示例（顶层评论）：**

```json
{
  "articleId": 1,
  "content": "这篇文章写得很好！"
}
```

**请求示例（回复他人）：**

```json
{
  "articleId": 1,
  "parentId": 10,
  "replyUserId": 1001,
  "content": "同意你的观点！"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": 11
}
```

> `data` 为新评论 ID；评论**发出即可见**（免审核），含违禁词的评论会被直接拒绝并返回错误信息

**违禁词拒绝示例：**

```json
{
  "code": -1,
  "message": "评论内容含有违禁词，请修改后重新提交",
  "data": null
}
```

---

### 前台 - 通知

> 以下接口均需要在 Header 中携带 Token：`Authorization: Bearer <token>`

---

#### 获取未读通知数 🔒

- **GET** `/api/notify/unread/count`
- **需要登录**

> 用于顶栏小红点展示，返回当前用户未读通知总数

**请求 Header：**
```
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": 3
}
```

> `data` 为未读通知数，为 0 时不显示红点

---

#### 通知列表（分页，最新在前）🔒

- **GET** `/api/notify/list`
- **需要登录**

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | Integer | ❌ | 当前页码，默认 1 |
| pageSize | Integer | ❌ | 每页条数，默认 20 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "COMMENT",
        "typeDesc": "评论了你",
        "title": "王新林 评论了你的文章",
        "content": "王新林 评论了《Spring Boot 快速入门指南》：讲得非常清晰，收藏了！",
        "sourceId": 1,
        "sourceType": "article",
        "senderId": 5,
        "senderNickname": "王新林",
        "senderAvatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=wangxinlin",
        "isRead": 0,
        "createTime": "2026-04-14T16:43:40"
      }
    ],
    "total": 1,
    "pageNum": 1,
    "pageSize": 20
  }
}
```

---

#### 标记单条已读 🔒

- **POST** `/api/notify/read`
- **需要登录**

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 通知ID |

**请求示例：**

```
POST /api/notify/read?id=1
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

#### 全部标记已读 🔒

- **POST** `/api/notify/read/all`
- **需要登录**

**请求 Header：**
```
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

> 将当前登录用户的所有未读通知一次性标记为已读

---

## 后台接口（Admin）

> 路径前缀：`/admin`
>
> 🔒 **所有后台接口均需要登录**，请求 Header 中携带：`Authorization: Bearer <token>`
>
> ⚠️ 当前版本不校验 Token 对应用户是否为管理员角色，后续版本将加入角色校验

---

### 后台 - 数据统计

#### 首页概览数据 🔒

- **GET** `/admin/dashboard/overview`

**请求 Header：**
```
Authorization: Bearer <token>
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "totalArticles": 100,
    "publishedArticles": 80,
    "draftArticles": 20,
    "totalComments": 500,
    "pendingComments": 10,
    "totalUsers": 200,
    "totalCategories": 8,
    "totalTags": 30,
    "totalViewCount": 99999
  }
}
```

---

### 后台 - 文章管理

#### 文章列表（分页，所有状态） 🔒

- **GET** `/admin/article/list`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | ❌ | 关键词（标题搜索） |
| categoryId | Long | ❌ | 分类ID |
| tagId | Long | ❌ | 标签ID |
| status | Integer | ❌ | 状态：0-草稿 1-已发布，不传则查全部 |
| pageNum | Integer | ❌ | 当前页码，默认 1 |
| pageSize | Integer | ❌ | 每页条数，默认 10 |

**响应示例：** 同前台文章列表，区别是可返回所有状态（草稿/已发布/已删除）的文章。

---

#### 文章详情 🔒

- **GET** `/admin/article/detail`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 文章ID |

**响应示例：** 同前台文章详情，不限制文章状态。

---

#### 新建 / 编辑文章 🔒

- **POST** `/admin/article/save`
- **Content-Type:** `application/json`
- **需要登录**

> `id` 为空时新建，`id` 不为空时编辑；`authorId` 自动设为当前登录用户

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ❌ | 文章ID，新建时不传，编辑时必传 |
| title | String | ✅ | 标题 |
| summary | String | ❌ | 摘要 |
| content | String | ✅ | 内容（Markdown格式） |
| cover | String | ❌ | 封面图URL |
| categoryId | Long | ✅ | 分类ID |
| tagIds | List\<Long\> | ❌ | 标签ID列表 |
| isTop | Integer | ❌ | 是否置顶：0-否 1-是，默认 0 |
| status | Integer | ❌ | 状态：0-草稿 1-已发布，默认 0 |

**请求示例（新建）：**

```json
{
  "title": "新文章标题",
  "summary": "文章摘要",
  "content": "# 标题\n\n正文内容...",
  "cover": "https://example.com/cover.jpg",
  "categoryId": 1,
  "tagIds": [1, 2, 3],
  "isTop": 0,
  "status": 1
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": 1
}
```

> `data` 为文章ID

---

#### 删除文章 🔒

- **POST** `/admin/article/delete`
- **需要登录**

> 管理员可删除任何人的文章（无归属权校验）

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 文章ID |

**请求示例：**

```
POST /admin/article/delete?id=1
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 后台 - 分类管理

#### 分类列表（全量） 🔒

- **GET** `/admin/category/list`

**请求 Header：**
```
Authorization: Bearer <token>
```

**响应示例：** 同前台分类列表。

---

#### 新建 / 编辑分类 🔒

- **POST** `/admin/category/save`
- **Content-Type:** `application/json`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ❌ | 分类ID，新建时不传，编辑时必传 |
| name | String | ✅ | 分类名称 |
| description | String | ❌ | 分类描述 |
| sort | Integer | ❌ | 排序，越大越靠前 |

**请求示例：**

```json
{
  "name": "后端开发",
  "description": "后端相关技术文章",
  "sort": 10
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": 1
}
```

> `data` 为分类ID

---

#### 删除分类 🔒

- **POST** `/admin/category/delete`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 分类ID |

**请求示例：**

```
POST /admin/category/delete?id=1
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 后台 - 标签管理

#### 标签列表（全量） 🔒

- **GET** `/admin/tag/list`

**请求 Header：**
```
Authorization: Bearer <token>
```

**响应示例：** 同前台标签列表。

---

#### 新建 / 编辑标签 🔒

- **POST** `/admin/tag/save`
- **Content-Type:** `application/json`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ❌ | 标签ID，新建时不传，编辑时必传 |
| name | String | ✅ | 标签名称 |

**请求示例：**

```json
{
  "name": "Spring Boot"
}
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": 1
}
```

> `data` 为标签ID

---

#### 删除标签 🔒

- **POST** `/admin/tag/delete`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 标签ID |

**请求示例：**

```
POST /admin/tag/delete?id=1
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 后台 - 评论管理

#### 评论列表（分页） 🔒

- **GET** `/admin/comment/list`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| articleId | Long | ❌ | 文章ID，不传则查全部 |
| status | Integer | ❌ | 状态：0-待审核 1-已通过 2-已拒绝，不传则查全部 |
| pageNum | Integer | ❌ | 当前页码，默认 1 |
| pageSize | Integer | ❌ | 每页条数，默认 10 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10,
        "articleId": 1,
        "articleTitle": "Spring Boot 入门",
        "userId": 1001,
        "userNickname": "测试用户",
        "content": "写的很好！",
        "status": 0,
        "statusDesc": "待审核",
        "children": [],
        "createTime": "2026-01-01T00:00:00.000+00:00"
      }
    ],
    "total": 10,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

#### 审核通过 🔒

- **POST** `/admin/comment/approve`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 评论ID |

**请求示例：**

```
POST /admin/comment/approve?id=10
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

#### 审核拒绝 🔒

- **POST** `/admin/comment/reject`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 评论ID |

**请求示例：**

```
POST /admin/comment/reject?id=10
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

#### 删除评论 🔒

- **POST** `/admin/comment/delete`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 评论ID |

**请求示例：**

```
POST /admin/comment/delete?id=10
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

### 后台 - 用户管理

#### 用户列表（分页） 🔒

- **GET** `/admin/user/list`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | Integer | ❌ | 当前页码，默认 1 |
| pageSize | Integer | ❌ | 每页条数，默认 10 |

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1001,
        "username": "testuser",
        "nickname": "测试用户",
        "avatar": "https://example.com/avatar.jpg",
        "email": "test@example.com",
        "role": 2,
        "roleDesc": "普通用户",
        "status": 1,
        "createTime": "2026-01-01T00:00:00.000+00:00"
      }
    ],
    "total": 200,
    "pageNum": 1,
    "pageSize": 10
  }
}
```

---

#### 禁用 / 启用用户 🔒

- **POST** `/admin/user/status`

**请求 Header：**
```
Authorization: Bearer <token>
```

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| userId | Long | ✅ | 用户ID |
| status | Integer | ✅ | 状态：0-禁用 1-启用 |

**请求示例：**

```
POST /admin/user/status?userId=1001&status=0
```

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

## 枚举值说明

### 文章状态（status）

| 值 | 说明 |
|----|------|
| 0 | 草稿 |
| 1 | 已发布 |
| 2 | 已下架 |

### 评论状态（status）

| 值 | 说明 |
|----|------|
| 0 | 待审核 |
| 1 | 已通过 |
| 2 | 已拒绝 |

### 用户角色（role）

| 值 | 说明 |
|----|------|
| 1 | 管理员 |
| 2 | 普通用户 |

### 用户状态（status）

| 值 | 说明 |
|----|------|
| 0 | 禁用 |
| 1 | 正常 |

### 通知类型（type）

| 值 | 说明 | 触发时机 |
|----|------|----------|
| COMMENT | 评论了你 | 有人评论你的文章 |
| REPLY | 回复了你 | 有人回复你的评论 |
| LIKE | 赞了你的文章 | 有人（登录状态）点赞你的文章 |
| SYSTEM | 系统通知 | 管理员发布公告等 |

