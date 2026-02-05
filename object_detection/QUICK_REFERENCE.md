# 物件偵測評測 - 快速參考指南
# Object Detection Evaluation - Quick Reference Guide

## 🚀 5 分鐘快速開始

### 1. 安裝環境
```bash
cd object_detection
pip install -r requirements.txt
```

### 2. 準備資料
```bash
# 複製標籤檔案
cp -r /path/to/bdd100k/labels ../data/bdd100k_exp/

# 準備圖像 (選擇其一)
python scripts/prepare_data.py --source /path/to/images --method raw
python scripts/prepare_data.py --source /path/to/images --method pwgcm
python scripts/prepare_data.py --source /path/to/images --method hsv
```

### 3. 執行評測
```bash
# 基本用法
python scripts/evaluate_yolo.py --model yolov8x.pt --methods raw pwgcm hsv

# 使用 GPU
python scripts/evaluate_yolo.py --model yolov8x.pt --methods raw pwgcm hsv --device 0

# 調整批次大小
python scripts/evaluate_yolo.py --model yolov8x.pt --methods raw pwgcm hsv --batch_size 32
```

### 4. 視覺化結果
```bash
# 生成所有圖表
python scripts/visualize_results.py --results_dir ../output/bdd100k_exp --all

# 只生成比較圖
python scripts/visualize_results.py --results_dir ../output/bdd100k_exp --output comparison.png
```

---

## 📋 常用命令

### 資料準備命令
```bash
# 驗證資料完整性
python scripts/prepare_data.py --verify --methods raw pwgcm hsv

# 使用複製模式 (而非符號連結)
python scripts/prepare_data.py --source /path --method pwgcm --copy
```

### 評測命令
```bash
# 只評測單一方法
python scripts/evaluate_yolo.py --model yolov8x.pt --methods pwgcm

# 使用不同模型
python scripts/evaluate_yolo.py --model yolov8m.pt --methods raw pwgcm hsv
python scripts/evaluate_yolo.py --model yolov8l.pt --methods raw pwgcm hsv
```

### 視覺化命令
```bash
# 生成雷達圖
python scripts/visualize_results.py --results_dir ../output/bdd100k_exp --radar

# 匯出 LaTeX 表格
python scripts/visualize_results.py --results_dir ../output/bdd100k_exp --latex

# 指定輸出目錄
python scripts/visualize_results.py --results_dir ../output/bdd100k_exp --output_dir ../visualizations --all
```

---

## 📊 重要指標說明

| 指標 | 全名 | 說明 | 範圍 |
|-----|------|------|------|
| **mAP@0.5:0.95** | COCO mAP | 論文首選，最嚴格 | 0-1 |
| **mAP@0.5** | PASCAL VOC mAP | 較寬鬆的標準 | 0-1 |
| **Precision** | 精確率 | 檢測正確的比例 | 0-1 |
| **Recall** | 召回率 | 找到目標的比例 | 0-1 |
| **F1-Score** | F1 分數 | Precision 和 Recall 的調和平均 | 0-1 |

---

## 🎯 論文撰寫建議

### 表格範例
```latex
\begin{table}[htbp]
\centering
\caption{Object Detection Performance Comparison}
\begin{tabular}{lcccc}
\hline
Method & mAP@0.5 & mAP@0.5:0.95 & Precision & Recall \\
\hline
Baseline (Raw) & 0.6012 & 0.3845 & 0.6789 & 0.6234 \\
SOTA (PWGCM) & 0.6542 & 0.4321 & 0.7234 & 0.6891 \\
Ours (HSV) & \textbf{0.6789} & \textbf{0.4567} & \textbf{0.7456} & \textbf{0.7012} \\
\hline
\end{tabular}
\end{table}
```

### 結果描述範例
```
我們的方法在 BDD100K 驗證集上達到了 45.67% 的 mAP@0.5:0.95，
相較於原始圖像的 38.45%，提升了 7.22 個百分點（+18.8%）。
這證明了我們的影像增強方法能有效提升物件偵測的效能。
```

---

## 🔧 疑難排解

### Q: YOLO 模型下載很慢？
A: 可以手動下載後放到專案目錄：
```bash
wget https://github.com/ultralytics/assets/releases/download/v0.0.0/yolov8x.pt
python scripts/evaluate_yolo.py --model ./yolov8x.pt
```

### Q: 記憶體不足 (Out of Memory)？
A: 減少批次大小：
```bash
python scripts/evaluate_yolo.py --batch_size 8  # 或更小
```

### Q: 評測很慢？
A: 使用較小的模型或 GPU：
```bash
python scripts/evaluate_yolo.py --model yolov8m.pt --device 0
```

### Q: 找不到標籤檔案？
A: 確認標籤檔案結構：
```
data/bdd100k_exp/
└── labels/
    └── val/
        ├── 001.txt
        ├── 002.txt
        └── ...
```

---

## 📁 輸出檔案說明

### 評測結果目錄
```
output/bdd100k_exp/
├── raw/
│   ├── metrics.json           # 詳細指標 (JSON)
│   ├── metrics_summary.txt    # 摘要報告 (TXT)
│   └── results/               # YOLO 詳細結果
├── pwgcm/
│   ├── metrics.json
│   ├── metrics_summary.txt
│   └── results/
└── comparison.csv             # 比較表格
```

### 視覺化結果目錄
```
visualizations/
├── comparison.png             # 比較柱狀圖
├── radar.png                  # 雷達圖
└── table.tex                  # LaTeX 表格
```

---

## 🔗 相關資源

- **Ultralytics YOLO**: https://github.com/ultralytics/ultralytics
- **BDD100K Dataset**: https://www.bdd100k.com/
- **COCO Detection**: https://cocodataset.org/
- **完整文檔**: [README.md](README.md)
- **實作摘要**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## 💡 小技巧

1. **批次處理**: 使用 for 迴圈評測多個模型
   ```bash
   for model in yolov8m.pt yolov8l.pt yolov8x.pt; do
       python scripts/evaluate_yolo.py --model $model --methods raw pwgcm hsv
   done
   ```

2. **背景執行**: 使用 nohup 在背景執行長時間任務
   ```bash
   nohup python scripts/evaluate_yolo.py --model yolov8x.pt > log.txt 2>&1 &
   ```

3. **監控進度**: 使用 watch 命令監控輸出
   ```bash
   watch -n 10 tail -20 log.txt
   ```

---

**最後更新**: 2026-01-22  
**維護者**: Daisy2100
