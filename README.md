# APRILab 實驗室網站

國立臺灣大學 先進產品實現與互動實驗室（APRILab）新版首頁。
風格參考 Google Material 3 Expressive：圓潤的有機形狀、彈簧動畫、由實驗室 logo 綠色推導的色階。

## 技術

- Angular 22（standalone components、signals、zoneless）
- Tailwind CSS v4
- [motion](https://motion.dev)（原生 JS API）負責彈簧、捲動與進場動畫
- [three.js](https://threejs.org) 作品區的 3D 頭盔（延遲載入，不影響首屏）

## 開發

```bash
npm install
npm start          # http://localhost:4200
npm start -- --host --port 5182   # 分享到區域網路
npm run build      # 輸出到 dist/aprilab-site-ng/browser
```

## 結構

```
src/app/
  app.ts                 頂部導覽列 + router-outlet + footer
  app.routes.ts          / 首頁、/members 實驗室成員
  data.ts                研究領域、影片、最新消息、連結
  members-data.ts        教授、在學生、畢業生、活動花絮照片（圖片走 Wix CDN）
  footer-wave.config.ts  頁尾點狀波浪的參數（速度、頻率、密度、顏色、透明度…）
  pages/                 home / members
  sections/              hero / showcase / research / projects / news / footer
  ui/
    morph.ts             會變形、旋轉的 M3 形狀（可裝圖片）
    reveal.ts            appReveal 指令：載入或捲入畫面時的彈簧進場
    rotating-text.ts     逐字輪播的膠囊文字
    count-up.ts          捲到時跳動的數字
    video-dialog.ts      YouTube 播放視窗（高度依視窗縮放，不會被切掉）
    photo-hand.ts        綠塊底部的活動花絮卡牌
    dot-wave.ts          頁尾點狀波浪（Canvas）
    icon.ts              Lucide 圖示
  lib/
    shapes.ts            極座標形狀庫（cookie、clover、flower…）
    anim.ts              彈簧、捲動速度等小工具
    i18n.ts              中 / 英切換
```

## 頁尾波浪調整

改 `src/app/footer-wave.config.ts`；或在網址後面加 `?wave`（例如 `http://localhost:4200/?wave`），
右下角會出現滑桿面板，調好後按「複製設定」貼回設定檔。

## 3D 頭盔模型

`public/models/headset.glb` 由 STL 轉出（約 74k 面、Meshopt 壓縮）。

模型來源：[“Apple Vision Pro 3D Model”](https://www.printables.com/model/868009-apple-vision-pro-3d-model) by Krazy_Kid59，授權 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)。依授權要求，網站作品區左下角有標示出處，修改後的 `headset.glb` 同樣以 CC BY-SA 4.0 釋出（詳見 `public/models/ATTRIBUTION.md`）。換模型時記得一併更新出處。

換模型時：

```bash
npm i --no-save @gltf-transform/core@4 @gltf-transform/extensions@4 @gltf-transform/functions@4 meshoptimizer
node tools/stl-to-glb.mjs 你的模型.stl public/models/headset.glb
```

網址加 `?model-debug` 會把每個零件上不同顏色，方便檢查分組；`?model-look` 可在 Console 用 `__headset.look([x,y,z],[tx,ty,tz])` 自由看模型。

## 部署注意

`/members` 是前端路由，靜態主機需要把找不到的路徑導回 `index.html`
（GitHub Pages 可複製一份 `index.html` 為 `404.html`）。

## 互動

- **滑鼠**：形狀依深度跟著游標視差、滑過會變形；研究卡片圓角膨脹；導覽列膠囊跟隨；照片堆被推開；按鈕按下時圓角變方。
- **滾輪**：首屏形狀散開淡出、捲越快轉越快；精選影片卡片放大成滿版；作品區像戴上 VR 頭盔一樣放大對焦成大螢幕（左右切換作品）；各區塊彈簧進場、數字跳動。

內容與影片縮圖來自實驗室現有網站與 YouTube 頻道 [@ntuaprilab8618](https://www.youtube.com/@ntuaprilab8618)。
