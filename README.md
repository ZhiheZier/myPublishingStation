# My Publishing Station

一个使用 Vue + Express + SQLite 构建的现代化博客系统，具有美观的界面设计和完整的功能。

## 技术栈

### 前端
- **Vue 3** - 现代化的前端框架
- **Vue Router** - 路由管理
- **Pinia** - 状态管理
- **Vite** - 快速的构建工具
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Axios** - HTTP 客户端
- **Quill Editor** - 富文本编辑器

### 后端
- **Node.js** - JavaScript 运行时
- **Express** - Web 应用框架
- **SQLite** - 轻量级嵌入式数据库
- **bcryptjs** - 密码加密
- **jsonwebtoken** - JWT 认证
- **CORS** - 跨域资源共享

## 功能特性

### 核心功能
- ✅ 文章列表展示（分页支持）
- ✅ 文章详情页
- ✅ **多标签系统**（替代单一分类）
- ✅ 全文搜索
- ✅ **富文本编辑器**（支持格式化、颜色、图片插入）
- ✅ 文章收藏
- ✅ 评论系统（带分页）
- ✅ 响应式设计（移动端友好）
- ✅ 现代化的 UI 设计（星空背景、透明效果）
- ✅ **主题切换系统**（去特效版/全特效版）
- ✅ **动态背景图片**（全特效版自动轮换背景）
- ✅ **小工具页面**（工具集合页面）

### 用户系统
- ✅ **用户注册/登录**
- ✅ **JWT 认证**
- ✅ **角色管理**（管理员/普通用户）
- ✅ **个人信息修改**（昵称、头像、密码）
- ✅ **忘记密码**（通过用户名和邮箱重置）

### 管理功能
- ✅ **文章管理**（创建、编辑、删除）
- ✅ **用户管理**（查看、修改角色、删除）
- ✅ 侧边栏（最新文章、最新留言、随机文章、分类标签）

### 技术特性
- ✅ RESTful API
- ✅ SQLite 数据库存储
- ✅ 密码加密存储
- ✅ Token 认证授权

## 项目结构

```
blog/
├── client/                 # 前端 Vue 应用
│   ├── src/
│   │   ├── components/    # Vue 组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Pinia 状态管理
│   │   ├── composables/   # Vue Composables
│   │   ├── api/           # API 客户端
│   │   └── router/        # 路由配置
│   ├── index.html
│   └── package.json
├── server/                # 后端 Express 服务器
│   ├── index.js          # 服务器主文件
│   ├── init-db.js        # 数据库初始化脚本
│   └── blog.db           # SQLite 数据库（运行后生成）
├── package.json          # 根 package.json
└── README.md
```

## 安装和运行

### 前置要求

- Node.js 16+ 
- npm 或 yarn

### 安装步骤

1. **安装根目录依赖**
```bash
npm install
```

2. **安装前端依赖**
```bash
cd client
npm install
cd ..
```

3. **初始化数据库**
```bash
npm run init-db
```

这将创建 SQLite 数据库并插入示例数据。

**⚠️ 重要提示：** 如果之前有旧数据库，请先删除：
```bash
# Windows PowerShell
Remove-Item server\blog.db

# Linux/Mac
rm server/blog.db
```

4. **启动开发服务器**

同时启动前端和后端：
```bash
npm run dev
```

或者分别启动：

启动后端服务器（端口 3001）：
```bash
npm run server
```

启动前端开发服务器（端口 3000）：
```bash
npm run client
```

5. **访问应用**

打开浏览器访问：http://localhost:3000

## API 接口

### 认证相关
```bash
# 注册
POST /api/auth/register
Body: { username, email, password }

# 登录
POST /api/auth/login
Body: { username, password }

# 获取当前用户
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

### 文章相关
```bash
# 获取文章列表（支持标签筛选）
GET /api/posts?tag=技术&page=1&limit=10&search=关键词

# 获取单篇文章（包含标签）
GET /api/posts/:id

# 获取随机文章
GET /api/posts/random?limit=5

# 创建文章（管理员）
POST /api/posts
Headers: Authorization: Bearer <token>
Body: { title, content, tags: ["标签1", "标签2"], cover_image }

# 更新文章（管理员）
PUT /api/posts/:id
Headers: Authorization: Bearer <token>
Body: { title, content, tags: ["标签1", "标签2"], cover_image }

# 删除文章（管理员）
DELETE /api/posts/:id
Headers: Authorization: Bearer <token>
```

### 标签相关
```bash
# 获取所有标签
GET /api/tags

# 获取分类列表（兼容旧 API）
GET /api/categories
```

### 用户相关
```bash
# 获取用户信息
GET /api/user/profile
Headers: Authorization: Bearer <token>

# 更新用户信息
PUT /api/user/profile
Headers: Authorization: Bearer <token>
Body: { username, avatar }

# 修改密码
POST /api/user/change-password
Headers: Authorization: Bearer <token>
Body: { currentPassword, newPassword }

# 重置密码
POST /api/user/reset-password
Body: { username, email, newPassword }
```

### 评论相关
```bash
# 获取文章评论
GET /api/posts/:id/comments?page=1&limit=10

# 添加评论
POST /api/posts/:id/comments
Headers: Authorization: Bearer <token>
Body: { content }

# 删除评论
DELETE /api/comments/:id
Headers: Authorization: Bearer <token>

# 获取最新评论
GET /api/comments/recent?limit=10
```

### 收藏相关
```bash
# 切换收藏状态
POST /api/posts/:id/favorite
Headers: Authorization: Bearer <token>
```

### 管理员相关
```bash
# 获取所有用户
GET /api/admin/users
Headers: Authorization: Bearer <token>

# 更新用户角色
PUT /api/admin/users/:id/role
Headers: Authorization: Bearer <token>
Body: { role: "admin" | "user" }

# 删除用户
DELETE /api/admin/users/:id
Headers: Authorization: Bearer <token>

# 获取所有文章（管理）
GET /api/admin/posts
Headers: Authorization: Bearer <token>
```

### 背景图片相关
```bash
# 获取背景图片（横屏图片，过滤404）
GET /api/background-images
Returns: { images: [{ url, width, height }] }
```

## 数据库结构

### users 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| username | TEXT | 用户名（唯一） |
| email | TEXT | 邮箱（唯一） |
| password | TEXT | 密码（加密） |
| avatar | TEXT | 头像 URL |
| role | TEXT | 角色（admin/user） |
| created_at | DATETIME | 注册时间 |

### posts 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| title | TEXT | 文章标题 |
| content | TEXT | 文章内容（富文本） |
| cover_image | TEXT | 封面图片 URL |
| favorites_count | INTEGER | 收藏数 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### tags 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| name | TEXT | 标签名称（唯一） |
| created_at | DATETIME | 创建时间 |

### post_tags 表（文章-标签关联）
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| post_id | INTEGER | 文章 ID |
| tag_id | INTEGER | 标签 ID |
| created_at | DATETIME | 创建时间 |

### favorites 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户 ID |
| post_id | INTEGER | 文章 ID |
| created_at | DATETIME | 收藏时间 |

### comments 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| post_id | INTEGER | 文章 ID |
| user_id | INTEGER | 用户 ID |
| content | TEXT | 评论内容 |
| created_at | DATETIME | 评论时间 |

## 开发说明

### 首次使用

1. **第一个注册的用户会自动成为管理员**
2. **管理员可以在后台创建、编辑、删除文章**
3. **管理员可以管理用户（修改角色、删除用户）**

### 添加新文章

管理员登录后可以通过以下方式添加文章：

1. **通过管理后台**（推荐）
   - 登录后访问 `/admin`
   - 点击"创建新文章"
   - 使用富文本编辑器编写内容
   - 添加标签
   - 保存发布

2. **使用 API**
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "title": "新文章标题",
    "content": "<p>文章内容（HTML格式）</p>",
    "tags": ["技术", "Vue"],
    "cover_image": "https://example.com/image.jpg"
  }'
```

3. **直接操作数据库**
```bash
sqlite3 server/blog.db
```

### 自定义样式

样式使用 Tailwind CSS，配置文件在 `client/tailwind.config.js`。你可以修改主题颜色和其他样式选项。

### 构建生产版本

```bash
npm run build
```

构建后的文件将在 `client/dist` 目录中。

## 特性展示

- 🎨 **现代化设计** - 星空背景、透明效果、流畅动画
- 📱 **响应式** - 完美适配桌面和移动设备
- 🔍 **搜索功能** - 支持标题和内容搜索
- 🏷️ **多标签系统** - 灵活的标签管理和筛选
- ✏️ **富文本编辑器** - 支持格式化、颜色、图片
- 👤 **用户系统** - 完整的认证和授权
- 💬 **评论互动** - 用户可以评论和收藏文章
- 👑 **角色管理** - 管理员和普通用户权限分离
- ⚡ **性能优化** - 使用 Vite 快速构建
- 🗄️ **轻量数据库** - SQLite 无需额外配置
- 🔒 **安全保障** - JWT 认证、密码加密

## 注意事项

1. **第一个注册的用户会自动成为管理员**
2. **JWT Token 有效期为 7 天**
3. **密码使用 bcrypt 加密存储**
4. **管理员不能删除自己**
5. **所有需要权限的操作都需要在请求头中携带 Token**
6. **数据库结构有重大更新，旧数据库需要删除后重新初始化**

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
