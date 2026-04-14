# 接口文档

> Base URL: `http://localhost:8080`
>
> 所有接口响应均为 JSON，统一结构如下：
>
> ```json
> {
>   "code": 0,         // 0=成功，-1=失败（或其他自定义错误码）
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

## 目录

- [公共数据结构](#公共数据结构)
- [前台接口](#前台接口)
  - [用户](#前台---用户)
  - [文章](#前台---文章)
  - [分类](#前台---分类)
  - [标签](#前台---标签)
  - [评论](#前台---评论)
- [后台接口（Admin）](#后台接口admin)
  - [数据统计](#后台---数据统计)
  - [文章管理](#后台---文章管理)
  - [分类管理](#后台---分类管理)
  - [标签管理](#后台---标签管理)
  - [评论管理](#后台---评论管理)
  - [用户管理](#后台---用户管理)

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

### ArticleDTO 文章对象

| 字段 | 类型 | 说明 |
|------|------|------|
| id | Long | 文章ID |
| title | String | 标题 |
| summary | String | 摘要 |
| content | String | 内容（Markdown格式） |
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
| username | String | ✅ | 用户名，4-20位字母数字 |
| password | String | ✅ | 密码，6-20位 |
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
    "createTime": "2026-01-01T00:00:00.000+00:00"
  }
}
```

---

#### 退出登录

- **POST** `/api/user/logout`

**响应示例：**

```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

---

#### 获取当前登录用户信息

- **GET** `/api/user/info`

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

#### 修改个人信息

- **POST** `/api/user/update`
- **Content-Type:** `application/json`

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

### 前台 - 文章

#### 文章列表（分页，仅已发布）

- **GET** `/api/article/list`

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | ❌ | 关键词（标题搜索） |
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

> 文章不存在时返回 `{ "code": -1, "message": "文章不存在", "data": null }`

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
      "articleTitle": null,
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
          "userAvatar": "https://example.com/avatar2.jpg",
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

#### 发表评论（需登录）

- **POST** `/api/comment/add`
- **Content-Type:** `application/json`

**请求体：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| articleId | Long | ✅ | 文章ID |
| parentId | Long | ❌ | 父评论ID，顶层评论不传或传 0 |
| replyUserId | Long | ❌ | 被回复用户ID，顶层评论不传 |
| content | String | ✅ | 评论内容 |

**请求示例：**

```json
{
  "articleId": 1,
  "parentId": 0,
  "content": "这篇文章写得很好！"
}
```

**回复他人评论示例：**

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

> `data` 为新评论的 ID；评论发布后默认为**待审核**状态，需后台审核通过后才在前台展示。

---

## 后台接口（Admin）

> 路径前缀：`/admin`
>
> ⚠️ 后台接口需要管理员权限（实际项目中需鉴权，当前版本暂未强制验证）

---

### 后台 - 数据统计

#### 首页概览数据

- **GET** `/admin/dashboard/overview`

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

#### 文章列表（分页）

- **GET** `/admin/article/list`

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| keyword | String | ❌ | 关键词（标题搜索） |
| categoryId | Long | ❌ | 分类ID |
| tagId | Long | ❌ | 标签ID |
| status | Integer | ❌ | 状态：0-草稿 1-已发布 2-已下架，不传则查全部 |
| pageNum | Integer | ❌ | 当前页码，默认 1 |
| pageSize | Integer | ❌ | 每页条数，默认 10 |

**响应示例：** 同前台文章列表，区别是可返回所有状态的文章。

---

#### 文章详情

- **GET** `/admin/article/detail`

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | Long | ✅ | 文章ID |

**响应示例：** 同前台文章详情，不限制状态。

---

#### 新建 / 编辑文章

- **POST** `/admin/article/save`
- **Content-Type:** `application/json`

> `id` 为空时新建，`id` 不为空时编辑

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

**请求示例（编辑）：**

```json
{
  "id": 1,
  "title": "修改后的标题",
  "content": "# 修改后的内容\n\n...",
  "categoryId": 1,
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

#### 删除文章

- **POST** `/admin/article/delete`

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

#### 分类列表（全量）

- **GET** `/admin/category/list`

**响应示例：** 同前台分类列表。

---

#### 新建 / 编辑分类

- **POST** `/admin/category/save`
- **Content-Type:** `application/json`

> `id` 为空时新建，`id` 不为空时编辑

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

#### 删除分类

- **POST** `/admin/category/delete`

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

#### 标签列表（全量）

- **GET** `/admin/tag/list`

**响应示例：** 同前台标签列表。

---

#### 新建标签

- **POST** `/admin/tag/save`
- **Content-Type:** `application/json`

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

#### 删除标签

- **POST** `/admin/tag/delete`

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

#### 评论列表（分页）

- **GET** `/admin/comment/list`

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
        "userAvatar": "https://example.com/avatar.jpg",
        "parentId": 0,
        "replyUserId": null,
        "replyUserNickname": null,
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

#### 审核通过

- **POST** `/admin/comment/approve`

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

#### 审核拒绝

- **POST** `/admin/comment/reject`

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

#### 删除评论

- **POST** `/admin/comment/delete`

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

#### 用户列表（分页）

- **GET** `/admin/user/list`

**请求参数（Query String）：**

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| pageNum | Integer | ❌ | 当前页码，默认 1 |
| pageSize | Integer | ❌ | 每页条数，默认 10 |

**请求示例：**

```
GET /admin/user/list?pageNum=1&pageSize=10
```

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

#### 禁用 / 启用用户

- **POST** `/admin/user/status`

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

