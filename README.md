# CNSC Expert 部署说明

目标架构：
- 前端 React(Vite) 代码托管在 GitHub，部署到 Vercel。
- RAG 服务部署在 Mac mini 的 Dify(Docker)。
- LLM 在 Dify 内配置为 MiniMax。
- 前端不直连 Dify key，通过 Vercel Serverless `api/chat.ts` 代理调用。

## 目录
- 工作目录：`Code/cnsc-expert`
- 前端模板来源：`Code/cnsc-expert-ai`

## 1. 本地开发

前提：
- Node.js 20+
- npm 10+

命令：

```bash
cd Code/cnsc-expert
npm install
npm run dev
```

默认前端地址：`http://localhost:3000`

说明：
- 当前聊天调用路径为 `VITE_API_BASE_URL`（默认 `/api`）。
- 本地若要同时调试 Vercel Function，建议使用 `vercel dev`。

## 2. 环境变量

参考 `Code/cnsc-expert/.env.example`。

Vercel 需要设置以下变量：
- `DIFY_BASE_URL`：例如 `https://dify.your-domain.com`
- `DIFY_APP_API_KEY`：Dify 应用 API Key（`app-...`）
- `DIFY_TIMEOUT_MS`：可选，默认 `60000`

前端可选变量：
- `VITE_API_BASE_URL`：默认 `/api`

## 3. 推送到 GitHub

```bash
cd Code/cnsc-expert
git add .
git commit -m "feat: integrate vercel api proxy for dify chat"
git push origin main
```

## 4. 部署到 Vercel

### 方式 A：Vercel 控制台
1. Import GitHub 仓库 `baoqj/cnsc-expert`。
2. Framework 选择 Vite（通常自动识别）。
3. Build Command：`npm run build`
4. Output Directory：`dist`
5. 在 Project Settings -> Environment Variables 中配置：
   - `DIFY_BASE_URL`
   - `DIFY_APP_API_KEY`
   - `DIFY_TIMEOUT_MS`（可选）
6. 点击 Deploy。

### 方式 B：Vercel CLI
```bash
cd Code/cnsc-expert
npx vercel
```

仓库已提供 `vercel.json`，包含输出目录和 `api/**/*.ts` 函数配置。

## 5. Mac mini 部署 Dify(Docker)

在 Mac mini 上执行：

```bash
git clone https://github.com/langgenius/dify.git
cd dify/docker
cp .env.example .env
docker compose up -d
```

建议：
- 给 Dify 配置固定域名和 HTTPS（Nginx/Caddy 反向代理）。
- 确保 Vercel 可以访问 `DIFY_BASE_URL`。

## 6. 在 Dify 配置 MiniMax

1. 登录 Dify 管理后台。
2. 进入 `Settings -> Model Provider`。
3. 启用并配置 `MiniMax`（填写 API Key、Endpoint）。
4. 在你的 Chat App/Workflow 中选择 MiniMax 作为推理模型。
5. 发布应用并生成 API Key（`app-...`）。
6. 把该 Key 配置到 Vercel 的 `DIFY_APP_API_KEY`。

## 7. 聊天链路验证

部署后在前端提问，调用链路应为：

`Browser -> /api/chat (Vercel) -> Dify -> MiniMax + Knowledge Base -> Browser`

若失败，优先检查：
- `DIFY_BASE_URL` 是否可公网访问
- `DIFY_APP_API_KEY` 是否对应已发布应用
- Dify 知识库是否完成索引
