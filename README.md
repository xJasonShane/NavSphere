# NavSphere

AI 驱动的精选资源导航站，收录优质 AI 工具、开发资源、开源项目与效率神器。

基于 **Next.js 15** + **React 18** + **TypeScript** + **Tailwind CSS v4** 构建，采用 **GitHub 仓库作为数据存储后端**，无需数据库即可实现内容的持久化与管理。

---

## 功能特性

- **多层级分类导航** — 支持一级/二级分类，灵活组织海量网站资源
- **实时搜索** — 支持按标题、描述全文检索，快速定位目标站点
- **响应式布局** — 适配桌面端与移动端，侧边栏 + 主内容区双栏布局
- **暗黑 / 亮色主题** — 基于 `next-themes`，支持系统偏好自动切换
- **管理后台** — 开发环境下提供完整的可视化后台：站点设置、导航 CRUD、分类排序、拖拽管理
- **GitHub 数据持久化** — 所有导航数据通过 GitHub API 读写，版本可控、无需数据库
- **GitHub OAuth 登录** — 基于 NextAuth v5，安全便捷的认证体系
- **浏览器扩展支持** — 提供扩展 API，支持 Chrome / Firefox 插件集成
- **Docker / Cloudflare Pages 多平台部署**

---

## 技术栈

| 领域 | 技术 |
|------|------|
| 框架 | [Next.js 15](https://nextjs.org/) (App Router) |
| 语言 | [TypeScript](https://www.typescriptlang.org/) |
| 样式 | [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| 状态管理 | [TanStack Query](https://tanstack.com/query) / [SWR](https://swr.vercel.app/) |
| 认证 | [NextAuth.js v5 (beta)](https://authjs.dev/) + GitHub OAuth |
| 表单 | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| 数据存储 | GitHub API (JSON 文件) |
| 图标 | [Lucide React](https://lucide.dev/) |
| 部署 | Docker / Cloudflare Pages / Vercel |

---

## 项目结构

```
NavSphere/
├── app/                        # Next.js App Router
│   ├── (page routes)           # 前端页面：首页、认证页
│   ├── admin/                  # 管理后台（开发环境可用）
│   │   ├── page.tsx            # 控制台仪表盘
│   │   ├── navigation/         # 导航管理（CRUD、排序、拖拽）
│   │   ├── resources/          # 资源管理
│   │   └── site/               # 站点设置
│   └── api/                    # API 路由
│       ├── auth/[...nextauth]  # NextAuth 认证
│       ├── navigation/         # 导航数据读写（GitHub 同步）
│       ├── local/navigation    # 本地开发 API（仅限开发环境）
│       └── admin/stats         # 后台统计数据
├── components/                 # React 组件
│   ├── ui/                     # shadcn/ui 组件库（50+ 组件）
│   ├── navigation-content.tsx  # 导航主内容区
│   ├── sidebar.tsx             # 侧边栏导航
│   ├── search-bar.tsx          # 搜索栏
│   └── ...
├── navsphere/content/          # 本地 JSON 数据源
│   ├── navigation.json         # 导航数据
│   ├── site.json               # 站点配置
│   └── resource-metadata.json  # 资源元数据
├── types/                      # TypeScript 类型定义
├── lib/                        # 工具函数（auth、utils、api 等）
├── public/                     # 静态资源（图标、字体、图片）
├── config/site.ts              # 站点默认配置
└── middleware.ts               # 路由中间件（生产环境屏蔽后台）
```

---

## 快速开始

### 环境要求

- [Node.js](https://nodejs.org/) >= 20.0.0
- [pnpm](https://pnpm.io/)（推荐）或 npm

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

复制 `.env.example` 为 `.env.local`，并填写以下配置：

```env
# GitHub OAuth App 配置
# 前往 https://github.com/settings/developers 创建 OAuth App
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# GitHub 仓库配置（数据持久化目标仓库）
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000/api/auth
NEXT_PUBLIC_API_URL=http://localhost:3000
```

> **注意**：OAuth App 的 Authorization callback URL 需填写 `http://localhost:3000/api/auth/callback/github`

### 启动开发服务器

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可访问。

开发环境下，点击页面右上角的 **设置按钮** 或访问 `/admin` 进入管理后台。

---

## 部署

### Docker 部署

```bash
# 构建镜像
pnpm docker:build

# 开发环境启动
pnpm docker:dev

# 生产环境启动
pnpm docker:prod
```

> 项目已配置 `output: 'standalone'`，可生成独立的 Next.js 服务端部署包。

### Cloudflare Pages

项目已配置 `wrangler.toml`，支持 Cloudflare Pages 部署：

```bash
# 使用 wrangler 部署
npx wrangler pages deploy .vercel/output/static
```

### Vercel

直接导入 GitHub 仓库即可自动部署，记得在控制台配置环境变量。

---

## 数据管理

本项目采用 **GitHub 仓库作为无数据库后端**：

- 所有导航数据以 JSON 文件形式存储在 `navsphere/content/` 目录
- 生产环境下，数据读写通过 GitHub API 直接操作目标仓库
- 本地开发时，可通过 `/admin` 后台可视化编辑，修改后自动同步到 GitHub
- 支持版本回溯、多人协作、冲突合并（基于 Git 天然优势）

---

## 常用命令

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 运行 ESLint 检查
pnpm clean        # 清理 .next 构建缓存
```

---

## 许可证

[MIT](LICENSE)

---

## 相关链接

- 作者主页：[xshan.top](https://www.xshan.top/)
