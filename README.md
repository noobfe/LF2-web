# LF2 Web

《小朋友齊打交（二）》（Little Fighter 2，LF2）的 Web 移植版，支援多平台瀏覽器遊玩。

## 線上遊玩

部署於 Cloudflare Pages，直接用瀏覽器開啟即可。

## 開發

```bash
npm install
npm run dev        # 本地開發服務器 http://localhost:3000
```

## 建置

```bash
npm run build      # 建置到 dist/
npm run zip        # 打包資料資源（data.zip / resources.zip / egg.zip）
npm run docs       # 產生 JSDoc 技術文件
```

## 部署（Cloudflare Pages）

1. 將程式碼推送到 GitHub
2. 在 Cloudflare Pages 連結 GitHub 倉庫
3. 設定如下：
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Node.js version**: 22

每次推送到 `main` 分支即自動部署。

## 系統需求

- 瀏覽器：Chrome / Edge / Firefox 最新版
- Node.js 22+（開發用）
