# LF2 Web

《小朋友齐打交（二）》（Little Fighter 2，LF2）的 Web 移植版，支援多平台浏览器游玩。

## 线上游玩

部署于 Cloudflare Pages，直接用浏览器开启即可。

## 开发

```bash
npm install
npm run dev        # 本地开发服务器 http://localhost:3000
```

## 建置

```bash
npm run build      # 建置到 dist/
npm run zip        # 打包资料资源（data.zip / resources.zip / egg.zip）
npm run docs       # 产生 JSDoc 技术文件
```

## 部署（Cloudflare Pages）

1. 将程式码推送到 GitHub
2. 在 Cloudflare Pages 连结 GitHub 仓库
3. 设定如下：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: 22

每次推送到 `main` 分支即自动部署。

## 系统需求

- 浏览器：Chrome / Edge / Firefox 最新版
- Node.js 22+（开发用）
