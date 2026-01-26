# BDD100K 評測結果輸出目錄

此目錄用於存放物件偵測評測的結果。

## 目錄結構

評測完成後，此目錄會包含以下結構：

```
bdd100k_exp/
├── raw/                    # 原始圖像評測結果
│   ├── metrics.json       # 詳細指標 JSON
│   ├── metrics_summary.txt # 摘要文字報告
│   └── results/           # YOLO 評測詳細結果
├── pwgcm/                 # PWGCM 評測結果
│   ├── metrics.json
│   ├── metrics_summary.txt
│   └── results/
├── hsv/                   # HSV 評測結果
│   ├── metrics.json
│   ├── metrics_summary.txt
│   └── results/
└── comparison.csv         # 方法比較表格
```

## 生成結果

執行評測腳本後會自動生成：

```bash
cd object_detection/scripts
python3 evaluate_yolo.py --methods raw pwgcm hsv
```

詳細說明請參考 [object_detection/README.md](../../object_detection/README.md)。
