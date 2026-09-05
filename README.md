# 🔮 八字排盘计算器

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey?style=flat-square)](LICENSE)

在线八字排盘工具，支持完整的四柱八字计算、大运流年分析、五行统计。

> **SaaS 方向产品**，含定价策略和合规研究。完整全栈应用：React 前端 + Node.js 后端 + Drizzle ORM + 数据库。

---

## ✨ 核心特性

### 📊 八字排盘
- 输入出生时间，自动计算年柱、月柱、日柱、时柱
- 支持真太阳时校正
- 农历/公历转换

### 🔍 五行分析
- 天干地支五行属性统计
- 五行强弱分析
- 缺失五行提示

### 📅 大运流年
- 大运排列和起运年龄
- 流年运势分析
- 十神关系解读

### 💰 SaaS 功能
- 用户账户系统
- 付费解锁高级功能
- 生成报告导出

---

## 🛠 技术栈

| 层级 | 技术 |
|---|---|
| 前端 | React 19 / TypeScript / Tailwind CSS |
| 后端 | Node.js / Express / tRPC |
| 数据库 | PostgreSQL / Drizzle ORM |
| 认证 | JWT / OAuth |
| 部署 | Vercel / Railway |

---

## 🚀 快速开始

### 前置要求
- Node.js 20+
- PostgreSQL（或使用 SQLite 开发）

### 安装

```bash
# 克隆
git clone https://github.com/wawa-03/bazi-chart-calculator.git
cd bazi-chart-calculator

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入数据库连接等配置

# 初始化数据库
pnpm db:push

# 启动开发服务器
pnpm dev
```

### 环境变量

```env
DATABASE_URL=postgresql://user:password@localhost:5432/bazi
JWT_SECRET=your-secret-key
VITE_APP_ID=your-app-id
```

---

## 📁 项目结构

```
bazi-chart-calculator/
├── client/                    # React 前端
│   ├── src/
│   │   ├── components/        # UI 组件
│   │   │   ├── AnnualManual   # 年运手册
│   │   │   ├── CitySearch     # 城市搜索
│   │   │   ├── AIChatBox      # AI 对话
│   │   │   └── ui/            # 基础 UI 组件
│   │   ├── lib/
│   │   │   ├── bazi.ts        # 八字计算核心逻辑
│   │   │   ├── baziExport.ts  # 导出功能
│   │   │   ├── fortuneContrast.ts  # 运势对比
│   │   │   ├── lifeThemes.ts  # 生命主题
│   │   │   └── themeReport.ts # 主题报告
│   │   ├── pages/
│   │   │   ├── Home.tsx       # 首页
│   │   │   ├── LandingPage.tsx # 落地页
│   │   │   ├── ConsultationPage.tsx  # 咨询页
│   │   │   ├── PricingPage.tsx # 定价页
│   │   │   └── AccountPage.tsx # 账户页
│   │   ├── contexts/          # React Context
│   │   └── hooks/             # 自定义 Hooks
│   └── public/                # 静态资源
├── server/                    # Node.js 后端
│   ├── _core/
│   │   ├── env.ts             # 环境变量管理
│   │   ├── db.ts              # 数据库连接
│   │   ├── llm.ts             # AI 集成
│   │   └── oauth.ts           # OAuth 认证
│   └── routers/               # API 路由
├── shared/                    # 前后端共享类型
├── drizzle/                   # 数据库迁移
├── drizzle.config.ts          # Drizzle 配置
├── package.json
└── tsconfig.json
```

---

## 🧮 八字计算逻辑

核心算法在 `client/src/lib/bazi.ts`：

1. **输入验证**：校验出生时间合法性
2. **真太阳时校正**：根据出生地经度调整
3. **四柱计算**：年柱、月柱、日柱、时柱
4. **五行统计**：天干地支五行属性汇总
5. **大运排列**：根据性别和月柱推算
6. **十神分析**：日主与其他干支的关系

---

## 💼 商业模式

### 定价策略
- **免费版**：基础排盘、简要分析
- **付费版**：详细大运流年、AI 解读、报告导出
- **咨询版**：一对一在线解读

### 合规研究
- 命理服务的法律边界
- 用户隐私保护
- 内容免责声明

---

## 📊 数据库设计

使用 Drizzle ORM 管理：

- **users**：用户账户
- **readings**：排盘记录
- **reports**：生成的报告
- **payments**：支付记录

---

## 🎯 产品亮点

1. **算法准确**：基于传统命理学规则，经过多轮验证
2. **界面友好**：非命理师也能看懂的可视化分析
3. **AI 增强**：集成 LLM 提供个性化解读
4. **SaaS 架构**：完整的用户系统、付费墙、数据持久化

---

## 🤝 Contributing

欢迎贡献！请 open issue 或提交 PR。

## 📄 License

[CC BY-NC-SA 4.0](LICENSE)

---

**Built by [Wawa](https://github.com/wawa-03)** — Full-stack developer specializing in AI automation and production-ready web applications.
