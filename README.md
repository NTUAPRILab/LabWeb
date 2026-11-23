# APRILab 實驗室網站

國立臺灣大學 先進產品實現與互動實驗室（APRILab）新版首頁。
風格參考 Google Material 3 Expressive：圓潤的有機形狀、彈簧動畫、由實驗室 logo 綠色推導的色階。

## 技術

- Angular 22（standalone components、signals、zoneless）
- Tailwind CSS v4
- [motion](https://motion.dev)（原生 JS API）負責彈簧、捲動與進場動畫

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
  app.ts               頂部導覽列（捲動後縮成膠囊）+ 頁面組合
  data.ts              所有內容：研究領域、影片、最新消息、連結
  sections/            hero / showcase / research / projects / news / footer
  ui/
    morph.ts           會變形、旋轉的 M3 形狀（可裝圖片）
    reveal.ts          appReveal 指令：載入或捲入畫面時的彈簧進場
    rotating-text.ts   逐字輪播的膠囊文字
    count-up.ts        捲到時跳動的數字
    bounce-cards.ts    滑鼠靠近會推開的照片堆
    cards-carousel.ts  作品卡片輪播 + YouTube 彈窗
    icon.ts            Lucide 圖示
  lib/
    shapes.ts          極座標形狀庫（cookie、clover、flower…）
    anim.ts            彈簧、捲動速度等小工具
```

## 互動

- **滑鼠**：形狀依深度跟著游標視差、滑過會變形；研究卡片圓角膨脹；導覽列膠囊跟隨；照片堆被推開；按鈕按下時圓角變方。
- **滾輪**：首屏形狀散開淡出、捲越快轉越快；精選影片卡片放大成滿版；頂部列縮成懸浮膠囊；各區塊彈簧進場、數字跳動。

內容與影片縮圖來自實驗室現有網站與 YouTube 頻道 [@ntuaprilab8618](https://www.youtube.com/@ntuaprilab8618)。
