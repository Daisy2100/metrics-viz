# 物件偵測評測模組 (Object Detection Evaluation Module)

本模組用於評測影像增強方法在物件偵測任務上的效能，使用 Ultralytics YOLO 進行 Zero-Shot 評估。

## 📋 目錄

- [環境設定](#環境設定)
- [資料夾結構](#資料夾結構)
- [使用方式](#使用方式)
- [評測指標](#評測指標)
- [進階功能](#進階功能)

## 🔧 環境設定

### 1. 安裝依賴套件

```bash
cd object_detection
pip install -r requirements.txt
```

### 2. 下載 YOLO 模型權重

YOLO 模型會在首次執行時自動下載，或手動下載：

```bash
# YOLOv8x (推薦，精度最高)
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8x.pt

# YOLOv8l (平衡)
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8l.pt

# YOLOv8m (速度較快)
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8m.pt
```

## 📁 資料夾結構

```
object_detection/
├── README.md                    # 本文件
├── requirements.txt             # Python 依賴
├── scripts/                     # 執行腳本
│   ├── prepare_data.py         # 資料準備腳本
│   ├── evaluate_yolo.py        # YOLO 評測主腳本
│   └── visualize_results.py    # 結果視覺化
├── config/                      # 配置檔
│   └── yolo_configs/           # YOLO YAML 配置
└── utils/                       # 工具函數
    ├── data_processor.py       # 資料處理工具
    └── metrics_calculator.py   # 指標計算工具

data/bdd100k_exp/               # 資料集目錄
├── images/                     # 增強後的圖像
│   ├── raw/                   # 原始圖像 (基準線)
│   ├── pwgcm/                 # PWGCM 增強結果
│   └── hsv/                   # HSV 增強結果
└── labels/                     # BDD100K 標籤 (不可修改)
    └── val/
        ├── 001.txt
        └── ...

output/bdd100k_exp/             # 評測結果輸出
├── raw/                        # 原始圖像評測結果
├── pwgcm/                      # PWGCM 評測結果
└── hsv/                        # HSV 評測結果
```

## 🚀 使用方式

### 步驟 1: 準備資料

將您的增強圖像和標籤放置到正確位置：

```bash
# 1. 將 BDD100K 標籤複製到指定位置
cp -r /path/to/bdd100k/labels data/bdd100k_exp/

# 2. 準備增強圖像
python scripts/prepare_data.py \
    --source /path/to/enhanced/images \
    --method pwgcm \
    --output data/bdd100k_exp/images/pwgcm
```

### 步驟 2: 執行評測

使用統一的評測腳本評估所有方法：

```bash
# 評測所有方法 (raw, pwgcm, hsv)
python scripts/evaluate_yolo.py \
    --model yolov8x.pt \
    --data_root data/bdd100k_exp \
    --output_root output/bdd100k_exp \
    --methods raw pwgcm hsv \
    --batch_size 16

# 只評測特定方法
python scripts/evaluate_yolo.py \
    --model yolov8x.pt \
    --data_root data/bdd100k_exp \
    --output_root output/bdd100k_exp \
    --methods pwgcm hsv \
    --batch_size 16
```

### 步驟 3: 視覺化結果

生成論文級別的結果表格和圖表：

```bash
python scripts/visualize_results.py \
    --results_dir output/bdd100k_exp \
    --output results_comparison.png
```

## 📊 評測指標

本模組計算以下物件偵測指標：

### 主要指標

1. **mAP@0.5** (PASCAL VOC 標準)
   - IoU 閾值為 0.5 的平均精確度
   - 範圍: 0-1，越高越好
   - 常用於較寬鬆的評估

2. **mAP@0.5:0.95** (COCO 標準) ⭐ 論文首選
   - IoU 閾值從 0.5 到 0.95，步長 0.05 的平均值
   - 範圍: 0-1，越高越好
   - 更嚴格且全面的評估標準

### 輔助指標

3. **Precision** (精確率)
   - 檢測正確的比例
   
4. **Recall** (召回率)
   - 找到目標的比例

5. **F1-Score**
   - Precision 和 Recall 的調和平均

## 💡 核心理念

### Zero-Shot Evaluation (零樣本評估)

**關鍵概念**: 「換圖不換標」

- **不重新訓練**: 使用預訓練的 COCO 權重作為「裁判」
- **只換圖像**: 將原始圖像替換為增強圖像
- **標籤不變**: 保持 BDD100K 原始標籤
- **證明目標**: 增強後的圖像讓 YOLO 看得更清楚，檢測效能提升

### 為什麼這樣做有效？

1. **公平性**: 所有方法使用相同的「裁判」(同一個 YOLO 模型)
2. **實用性**: 展示增強方法的即時應用價值
3. **說服力**: mAP 提升直接證明影像品質改善

## 🎯 進階功能

### 1. 自訂 YAML 配置

修改 `config/yolo_configs/` 中的 YAML 檔案來自訂評測設定。

### 2. 批次評測

評測腳本支援批次處理多個資料集或模型：

```bash
# 評測多個 YOLO 模型
for model in yolov8m.pt yolov8l.pt yolov8x.pt; do
    python scripts/evaluate_yolo.py \
        --model $model \
        --data_root data/bdd100k_exp \
        --output_root output/bdd100k_exp/${model%.pt} \
        --methods raw pwgcm hsv
done
```

### 3. RetinaFace 評測 (Dark Face Dataset)

針對人臉偵測任務，請參考 `scripts/evaluate_retinaface.py`。

## 📝 輸出格式

評測完成後，會在 `output/bdd100k_exp/{method}/` 生成：

```
output/bdd100k_exp/pwgcm/
├── metrics.json              # 詳細指標 JSON
├── metrics_summary.txt       # 摘要文字報告
├── predictions/              # 預測結果
└── visualizations/           # 視覺化結果 (optional)
```

### metrics.json 範例

```json
{
  "model": "yolov8x",
  "method": "pwgcm",
  "metrics": {
    "mAP@0.5": 0.6542,
    "mAP@0.5:0.95": 0.4321,
    "precision": 0.7234,
    "recall": 0.6891,
    "f1_score": 0.7058
  },
  "per_class": {
    "car": {"mAP@0.5": 0.7123, "mAP@0.5:0.95": 0.5234},
    "person": {"mAP@0.5": 0.6234, "mAP@0.5:0.95": 0.4123}
  }
}
```

## 🔍 常見問題

### Q1: YOLO 模型下載很慢怎麼辦？

可以手動從 GitHub Releases 下載後放到 `~/.cache/ultralytics/` 目錄。

### Q2: 如何確保資料格式正確？

確保標籤格式為 YOLO 格式：`<class> <x_center> <y_center> <width> <height>`，
所有值都是歸一化到 0-1 的相對座標。

### Q3: 評測很慢怎麼辦？

- 調整 `--batch_size` 參數（預設 16）
- 使用較小的 YOLO 模型 (yolov8m 代替 yolov8x)
- 使用 GPU 加速

## 📚 參考文獻

1. Ultralytics YOLO: https://github.com/ultralytics/ultralytics
2. BDD100K Dataset: https://www.bdd100k.com/
3. COCO Detection Challenge: https://cocodataset.org/

## 📄 授權

本模組遵循 MIT 授權條款。

---

**最後更新**: 2026-01-22  
**維護者**: Daisy2100  
**聯絡方式**: [GitHub Issues](https://github.com/Daisy2100/metrics-viz/issues)
