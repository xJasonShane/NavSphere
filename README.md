# NavSphere

一个现代化的开源导航站，支持可视化管理后台、GitHub OAuth 登录、拖拽排序、暗黑模式等功能。基于 Next.js 15 + TypeScript + Tailwind CSS 构建。

## ✨ 特性

- 🎯 **可视化管理后台** - 通过图形界面管理导航分类和链接，无需手动编辑 JSON
- 🔐 **GitHub OAuth 登录** - 安全的身份认证，支持通过 GitHub 登录管理后台
- 📂 **多级分类支持** - 支持一级分类、二级子分类，灵活组织导航内容
- 🎨 **现代化 UI** - 基于 shadcn/ui 组件库，支持浅色/暗黑/系统主题切换
- 🔄 **拖拽排序** - 可视化拖拽调整分类和链接顺序
- 📱 **响应式设计** - 完美适配桌面端和移动端
- ☁️ **多平台部署** - 支持 Vercel、Cloudflare Pages、Docker 等多种部署方式
- 🔍 **搜索功能** - 快速查找导航链接
- 💾 **数据持久化** - 通过 GitHub API 同步数据到仓库，数据安全有保障

## 🛠️ 技术栈

- **框架**: [Next.js 15](https://nextjs.org/) (App Router)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **样式**: [Tailwind CSS 4](https://tailwindcss.com/)
- **UI 组件**: [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/)
- **认证**: [NextAuth.js 5](https://authjs.dev/) (GitHub OAuth)
- **拖拽**: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd)
- **数据获取**: [SWR](https://swr.vercel.app/) + [TanStack Query](https://tanstack.com/query)
- **表单**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **图标**: [Lucide React](https://lucide.dev/)
- **代码编辑器**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **部署**: Vercel / Cloudflare Pages / Docker

## 📋 前置要求

- Node.js >= 20.0.0
- pnpm / npm / yarn (推荐使用 pnpm)
- GitHub 账号 (用于 OAuth 认证和数据存储)

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/your-username/NavSphere.git
cd NavSphere
```

### 2. 安装依赖

```bash
pnpm install
# 或
npm install
# 或
yarn install
```

### 3. 配置环境变量

复制 `.env.example` 为 `.env.local` 并填写相关配置：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# GitHub OAuth App 配置
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# GitHub 仓库配置（用于存储导航数据）
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main

# NextAuth 配置
NEXTAUTH_URL=http://localhost:3000/api/auth
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**GitHub OAuth App 配置说明：**

1. 前往 GitHub Settings → Developer settings → OAuth Apps → New OAuth App
2. 填写应用信息：
   - Application name: NavSphere (或自定义名称)
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
3. 创建后获取 Client ID 和 Client Secret

### 4. 启动开发服务器

```bash
pnpm dev
# 或
npm run dev
# 或
yarn dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看前台页面，访问 [http://localhost:3000/admin](http://localhost:3000/admin) 进入管理后台。

## 📖 使用说明

### 前台页面

- 首页展示所有导航分类和链接
- 支持搜索功能快速查找
- 点击主题切换按钮切换浅色/暗黑模式
- 点击导航链接在新标签页打开（可配置）

### 管理后台

访问 `/admin` 路径进入管理后台（需要 GitHub 登录）：

1. **控制台** - 查看统计数据（分类数量、站点总数等）
2. **站点设置** - 配置网站标题、描述、Logo、Favicon、主题等
3. **导航管理** - 添加/编辑/删除分类和链接，支持拖拽排序
4. **资源管理** - 管理网站资源内容

### 数据结构

导航数据存储在 `navsphere/content/` 目录下：

- `navigation.json` - 导航分类和链接数据
- `site.json` - 站点配置信息
- `navigation-default.json` - 默认导航数据（备份）
- `resource-metadata.json` - 资源元数据

## 🏗️ 项目结构

```
NavSphere/
├── app/                    # Next.js App Router
│   ├── admin/             # 管理后台页面
│   │   ├── navigation/    # 导航管理
│   │   ├── resources/     # 资源管理
│   │   ├── site/          # 站点设置
│   │   └── page.tsx       # 管理后台首页
│   ├── api/               # API 路由
│   │   ├── admin/         # 管理后台 API
│   │   ├── auth/          # 认证 API (NextAuth)
│   │   ├── navigation/    # 导航数据 API
│   │   └── site/          # 站点配置 API
│   ├── auth/              # 认证页面
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 首页
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   └── ...               # 业务组件
├── config/               # 配置文件
│   └── site.ts           # 站点默认配置
├── hooks/                # 自定义 Hooks
├── lib/                  # 工具库
│   ├── auth.ts           # 认证配置
│   ├── github.ts         # GitHub API 封装
│   └── utils.ts          # 通用工具函数
├── navsphere/            # 数据目录
│   └── content/          # JSON 数据文件
├── public/               # 静态资源
├── services/             # 业务服务层
├── styles/               # 全局样式
├── types/                # TypeScript 类型定义
├── .env.example          # 环境变量示例
├── next.config.js        # Next.js 配置
├── tailwind.config.js    # Tailwind 配置
└── tsconfig.json         # TypeScript 配置
```

## 🚢 部署

### Vercel 部署（推荐）

1. Fork 本项目到你的 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量（与 `.env.example` 相同）
4. 部署完成后，在 GitHub OAuth App 中更新回调 URL 为你的 Vercel 域名

### Cloudflare Pages 部署

项目已配置 Cloudflare Pages 支持，参考 `wrangler.toml` 配置：

```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login

# 部署
npm run build
wrangler pages deploy .vercel/output/static
```

### Docker 部署

项目提供 Docker 支持：

```bash
# 构建镜像
npm run docker:build

# 开发环境启动
npm run docker:dev

# 生产环境启动
npm run docker:prod

# 停止服务
npm run docker:stop

# 查看日志
npm run docker:logs
```

### 静态部署

```bash
npm run build
# 产物在 .next 目录
```

## 🔧 可用脚本

```bash
pnpm dev          # 启动开发服务器
pnpm build        # 构建生产版本
pnpm start        # 启动生产服务器
pnpm lint         # 代码检查
pnpm clean        # 清理构建产物
```

## 🎨 自定义配置

### 修改默认站点信息

编辑 `config/site.ts` 文件修改默认的站点标题、描述、Logo 等。

### 添加自定义图标

1. 将图标文件放入 `public/assets/` 目录
2. 在管理后台添加/编辑链接时，选择上传图标或填写图标路径

### 修改主题色

编辑 `tailwind.config.js` 中的 CSS 变量来自定义主题色。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启一个 Pull Request

## 📄 许可证

MIT License

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 框架
- [shadcn/ui](https://ui.shadcn.com/) - UI 组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Lucide](https://lucide.dev/) - 图标库
- 所有开源贡献者
