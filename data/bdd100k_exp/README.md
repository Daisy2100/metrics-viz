# BDD100K 實驗資料目錄

此目錄用於存放 BDD100K 資料集的圖像和標籤。

## 目錄結構

```
bdd100k_exp/
├── images/           # 圖像目錄
│   ├── raw/         # 原始圖像
│   ├── pwgcm/       # PWGCM 增強圖像
│   └── hsv/         # HSV 增強圖像
└── labels/          # 標籤目錄 (YOLO 格式)
    └── val/         # 驗證集標籤
```

## 使用方式

1. 將 BDD100K 標籤複製到 `labels/val/` 目錄
2. 使用 `prepare_data.py` 腳本準備圖像資料

詳細說明請參考 [object_detection/README.md](../../object_detection/README.md)。
