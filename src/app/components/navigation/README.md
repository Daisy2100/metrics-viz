# 動態導航元件使用說明

這個導航元件使用假資料提供導航選單項目，可以輕鬆自訂和擴展。

## 功能特色

- 📱 響應式設計（桌面版和手機版）
- ⚡ 載入狀態指示器
- 🎨 現代化的樣式設計
- 🏷️ 可自定義 Logo 文字
- 🔗 活動狀態顯示
- 🛠️ 易於自訂選單項目

## 使用方式

### 基本使用

```html
<app-navigation [logoText]="'我的網站'"></app-navigation>
```

### 使用 API 載入

```html
<app-navigation 
  [apiUrl]="'https://your-api.com/navigation'"
  [logoText]="'YOUR BRAND'">
</app-navigation>
```

### 在父元件中使用

```typescript
// parent.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-parent',
  template: `
    <app-navigation 
      [apiUrl]="navigationApiUrl"
      [logoText]="brandName">
    </app-navigation>
    <main>
      <!-- 您的內容 -->
    </main>
  `
})
export class ParentComponent {
  navigationApiUrl = 'https://api.example.com/menu';
  brandName = 'MY COMPANY';
}
```

## API 格式

您的 API 應該返回以下格式的 JSON 陣列：

```json
[
  {
    "id": "home",
    "displayName": "首頁",
    "path": "/",
    "order": 1,
    "isActive": false
  },
  {
    "id": "about",
    "displayName": "關於我們",
    "path": "/about",
    "order": 2,
    "isActive": false
  },
  {
    "id": "services",
    "displayName": "服務項目",
    "path": "/services",
    "order": 3,
    "isActive": true
  }
]
```

### 欄位說明

- `id` (必填): 唯一識別碼
- `displayName` (必填): 顯示名稱
- `path` (必填): 路由路徑
- `order` (可選): 排序順序，數字越小越前面
- `isActive` (可選): 是否為活動狀態

## 重新載入導航項目

如果需要在運行時重新載入導航項目，可以透過模板引用調用：

```html
<app-navigation #nav [apiUrl]="apiUrl"></app-navigation>
<button (click)="nav.reloadNavigationItems()">重新載入選單</button>
```

## 錯誤處理

當 API 載入失敗時，元件會自動退回到預設的導航項目，確保使用者仍然可以正常導航。

## 樣式自定義

元件使用 SCSS 變數系統，您可以透過修改 `src/scss/_variables.scss` 來自定義樣式：

```scss
// 自定義顏色
$color-black: #333333;
$color-gray-600: #666666;

// 自定義字體
$font-family-primary: "Your Custom Font", sans-serif;
```

## 載入狀態

元件會在載入 API 資料時顯示載入指示器：
- 桌面版：顯示動畫骨架
- 手機版：顯示載入文字

## 注意事項

1. 確保您的 API 端點支援 CORS
2. API 回應時間建議控制在 3 秒內以提供良好的使用者體驗
3. 建議為 API 提供快取機制以提升載入速度
