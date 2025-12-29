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
- ✅ 文章收藏和收藏夹页面
- ✅ **评论系统**（支持多级回复、带分页）
- ✅ **问答专区**（管理员可编辑的 Q&A 文章）
- ✅ **留言板**（用户留言和回复功能）
- ✅ **公告栏**（管理员可编辑的首页公告）
- ✅ 响应式设计（移动端友好）
- ✅ 现代化的 UI 设计（星空背景、透明效果）
- ✅ **主题切换系统**（去特效版/全特效版）
- ✅ **动态背景图片**（全特效版自动轮换，支持本地图片）
- ✅ **小工具页面**（工具集合页面）
- ✅ **图片查看器**（支持缩放、拖动、幻灯片、导航）
- ✅ **返回顶部按钮**（滚动时自动显示）

### 用户系统
- ✅ **用户注册/登录**（支持邮箱或用户名登录）
- ✅ **JWT 认证**
- ✅ **角色管理**（管理员/普通用户）
- ✅ **个人信息修改**（昵称、头像、密码）
- ✅ **忘记密码**（通过用户名和邮箱重置）
- ✅ **收藏夹管理**（查看收藏的文章）

### 管理功能
- ✅ **文章管理**（创建、编辑、删除、搜索、分页）
- ✅ **用户管理**（查看、修改角色、删除）
- ✅ **公告栏管理**（编辑首页公告）
- ✅ **问答专区管理**（编辑 Q&A 文章）
- ✅ 侧边栏（最新文章、最新留言/评论、随机文章、分类标签）

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
│   ├── backgrounds/      # 背景图片目录（全特效版）
│   └── publishStation.db # SQLite 数据库（运行后生成）
├── ecosystem.config.cjs  # PM2 进程管理配置文件
├── .env.example          # 环境变量配置示例
├── .gitignore           # Git 忽略文件
├── package.json         # 根 package.json
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
Remove-Item server\publishStation.db

# Linux/Mac
rm server/publishStation.db
```

4. **启动开发服务器**

同时启动前端和后端：
```bash
npm run dev
```

或者分别启动：

启动后端服务器（端口 3003）：
```bash
npm run server
```

启动前端开发服务器（端口 5174）：
```bash
npm run client
```

5. **访问应用**

打开浏览器访问：http://localhost:5174

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

# 获取最新评论（包含所有文章评论和留言板消息）
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

### 公告栏相关
```bash
# 获取公告
GET /api/announcement

# 更新公告（管理员）
PUT /api/announcement
Headers: Authorization: Bearer <token>
Body: { content }
```

### 问答专区相关
```bash
# 获取问答文章
GET /api/qa

# 更新问答文章（管理员）
PUT /api/qa
Headers: Authorization: Bearer <token>
Body: { title, content }
```

### 留言板相关
```bash
# 获取留言列表
GET /api/guestbook?page=1&limit=10

# 添加留言
POST /api/guestbook
Headers: Authorization: Bearer <token>
Body: { content }

# 删除留言（管理员或本人）
DELETE /api/guestbook/:id
Headers: Authorization: Bearer <token>
```

### 收藏相关
```bash
# 切换收藏状态
POST /api/posts/:id/favorite
Headers: Authorization: Bearer <token>

# 获取用户收藏的文章列表
GET /api/user/favorites?page=1&limit=10
Headers: Authorization: Bearer <token>
```

### 背景图片相关
```bash
# 获取背景图片列表（本地图片）
GET /api/background-images
Returns: { images: [url1, url2, ...] }
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
| parent_id | INTEGER | 父评论 ID（回复时使用，NULL 为根评论） |
| created_at | DATETIME | 评论时间 |

### announcement 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| content | TEXT | 公告内容（HTML格式） |
| updated_at | DATETIME | 更新时间 |

### qa 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| title | TEXT | Q&A 标题 |
| content | TEXT | Q&A 内容（HTML格式） |
| updated_at | DATETIME | 更新时间 |

### guestbook 表
| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| user_id | INTEGER | 用户 ID |
| content | TEXT | 留言内容 |
| parent_id | INTEGER | 父留言 ID（回复时使用，NULL 为根留言） |
| created_at | DATETIME | 留言时间 |

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
curl -X POST http://localhost:3003/api/posts \
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
sqlite3 server/publishStation.db
```

### 自定义样式

样式使用 Tailwind CSS，配置文件在 `client/tailwind.config.js`。你可以修改主题颜色和其他样式选项。

### 构建生产版本

```bash
npm run build
```

构建后的文件将在 `client/dist` 目录中。

## 特性展示

- 🎨 **现代化设计** - 星空背景、透明效果、流畅动画、自定义滚动条
- 📱 **响应式** - 完美适配桌面和移动设备
- 🔍 **搜索功能** - 支持标题和内容搜索
- 🏷️ **多标签系统** - 灵活的标签管理和筛选
- ✏️ **富文本编辑器** - 支持格式化、颜色、图片、标题样式
- 👤 **用户系统** - 完整的认证和授权（支持邮箱或用户名登录）
- 💬 **评论互动** - 多级评论回复、留言板、问答专区
- 📸 **图片功能** - 图片查看器（缩放、拖动、幻灯片）、文章图片悬浮放大
- 🎯 **收藏系统** - 文章收藏、收藏夹页面
- 👑 **角色管理** - 管理员和普通用户权限分离
- 📢 **公告系统** - 管理员可编辑首页公告
- ⚡ **性能优化** - 使用 Vite 快速构建
- 🗄️ **轻量数据库** - SQLite 无需额外配置
- 🔒 **安全保障** - JWT 认证、密码加密、级联删除
- 🔝 **用户体验** - 返回顶部按钮、自动滚动、页面刷新机制

## 注意事项

1. **第一个注册的用户会自动成为管理员**
2. **默认管理员账号**（初始化数据库时创建）：
   - 用户名：`admin`
   - 邮箱：`admin@admin`
   - 密码：`123456`
3. **JWT Token 有效期为 7 天**
4. **密码使用 bcrypt 加密存储**
5. **管理员不能删除自己**
6. **所有需要权限的操作都需要在请求头中携带 Token**
7. **数据库文件为 `publishStation.db`**（位于 `server/` 目录）
8. **背景图片**：全特效版的背景图片位于 `server/backgrounds/` 目录，支持本地图片
9. **评论和留言支持多级回复**，删除根评论/留言会自动级联删除所有回复
10. **初始化数据库**：运行 `npm run init-db` 会创建示例数据（11篇文章、管理员和普通用户、问答内容、留言板消息、评论和回复）

## Linux 服务器部署

### 前置要求

- Linux 服务器（Ubuntu 20.04+ / CentOS 7+ / Debian 10+）
- Root 或 sudo 权限
- 域名（可选，用于配置 HTTPS）

### 快速部署步骤

#### 1. 服务器环境准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
sudo yum update -y  # CentOS/RHEL

# 安装 Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs  # Ubuntu/Debian

# 安装 PM2
sudo npm install -g pm2

# 安装 Nginx（可选，用于反向代理）
sudo apt install nginx -y
```

#### 2. 上传项目

```bash
# 方式一：使用 Git（推荐）
git clone https://github.com/ZhiheZier/myPublishingStation.git ~/blog
cd ~/blog

# 方式二：使用 SCP（在本地执行）
# scp -r . user@server-ip:~/blog
```

#### 3. 安装依赖和构建

```bash
cd ~/blog

# 删除 node_modules（如果从其他平台复制过来的）
rm -rf node_modules client/node_modules

# 安装编译工具（如果需要）
sudo apt install build-essential python3 -y  # Ubuntu/Debian

# 安装依赖
npm install
cd client && npm install && cd ..

# 构建前端
cd client && npm run build && cd ..
```

#### 4. 配置环境变量

```bash
# 复制示例文件
cp .env.example .env

# 编辑 .env 文件，修改 JWT_SECRET（重要！）
nano .env

# 或使用命令生成 JWT_SECRET
sed -i "s/JWT_SECRET=.*/JWT_SECRET=$(openssl rand -base64 32)/" .env
```

#### 5. 初始化数据库

```bash
npm run init-db
```

#### 6. 启动应用

```bash
# 创建日志目录
mkdir -p logs

# 使用 PM2 启动
pm2 start ecosystem.config.cjs

# 查看状态
pm2 status
pm2 logs myPublishingStation

# 设置开机自启
pm2 save
pm2 startup
```

#### 7. 配置 Nginx 反向代理（可选但推荐）

```bash
# Ubuntu/Debian
sudo nano /etc/nginx/sites-available/blog

# CentOS/RHEL
sudo nano /etc/nginx/conf.d/blog.conf
```

添加配置：
```nginx
server {
    listen 80;
    server_name _;

    access_log /var/log/nginx/blog_access.log;
    error_log /var/log/nginx/blog_error.log;
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

启用配置：
```bash
# Ubuntu/Debian
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # 删除默认配置
sudo nginx -t
sudo systemctl reload nginx

# CentOS/RHEL
sudo mv /etc/nginx/conf.d/default.conf /etc/nginx/conf.d/default.conf.backup
sudo nginx -t
sudo systemctl reload nginx
```

#### 8. 配置防火墙

```bash
# Ubuntu/Debian
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

**重要**：如果使用云服务器，还需要在云控制台配置安全组规则开放端口 80 和 443。

#### 9. 访问应用

- **有 Nginx**：`http://your-server-ip` 或 `http://your-domain.com`
- **无 Nginx**：`http://your-server-ip:3003`

### 常见问题

**Q: sqlite3 模块错误（invalid ELF header）**

A: 删除 node_modules 重新安装：
```bash
rm -rf node_modules client/node_modules
sudo apt install build-essential python3 -y
npm install
```

**Q: 访问 80 端口显示 "Welcome to nginx!"**

A: 删除默认 Nginx 配置并重新加载：
```bash
sudo rm /etc/nginx/sites-enabled/default  # Ubuntu/Debian
sudo systemctl reload nginx
```

**Q: PM2 启动失败**

A: 检查是否在项目根目录，配置文件为 `ecosystem.config.cjs`：
```bash
cd ~/blog
pm2 start ecosystem.config.cjs
```

### 更新应用

```bash
cd ~/blog
git pull origin main  # 如果使用 Git
npm install
cd client && npm install && npm run build && cd ..
pm2 restart myPublishingStation
```

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！
