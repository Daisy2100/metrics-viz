# Footer Component

這是一個基於 Angular 19 和 PrimeNG 19 設計的響應式 Footer 元件。

## 功能特色

- 響應式設計，支援桌面和行動裝置
- 包含公司資訊、快速連結、服務項目和社群媒體連結
- 使用現代 SCSS 語法
- 支援深色模式
- 完全可自訂的內容

## 結構說明

Footer 包含以下區域：
1. **公司資訊區域** - 顯示公司名稱、描述和聯絡資訊
2. **快速連結** - 網站主要頁面的連結
3. **服務項目** - 公司提供的服務連結
4. **社群媒體** - 社群平台連結
5. **版權資訊** - 版權聲明和法律連結

## 自訂配置

### 修改公司資訊

在 `footer.component.ts` 中修改以下屬性：

```typescript
companyName = '您的公司名稱';
companyDescription = '您的公司描述';

contactInfo: ContactInfo = {
  address: '您的地址',
  phone: '您的電話',
  email: '您的電子郵件'
};
```

### 修改連結

修改 `quickLinks`、`services` 和 `socialLinks` 陣列來自訂連結：

```typescript
quickLinks: LinkItem[] = [
  { label: '首頁', path: '/' },
  // 添加更多連結
];
```

### 樣式自訂

在 `footer.component.scss` 中可以自訂樣式，使用預定義的 SCSS 變數來保持一致性。

## 樣式變數

使用 `_variables.scss` 中的預定義變數：
- 顏色：`$color-primary`、`$color-gray-*` 系列
- 間距：`$spacing-*` 系列
- 字型：`$font-size-*`、`$font-weight-*` 系列
- 轉場效果：`$transition-*` 系列

## 使用方式

Footer 已自動加入到 `app.component.html` 中，會在每個頁面的底部顯示。

如需隱藏 Footer 在特定頁面，可以使用 Angular 的條件顯示：

```html
<app-footer *ngIf="showFooter"></app-footer>
```

## 響應式設計

- 桌面版：4 欄網格布局
- 平板版：2 欄網格布局
- 手機版：單欄布局

## 依賴項目

- Angular 19
- Angular Router
- PrimeIcons (用於圖示)
- CommonModule (用於 Angular 指令)
