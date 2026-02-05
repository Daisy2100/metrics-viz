# 物件偵測評測模組 - 實作摘要

## 📦 已建立的完整模組

本次實作建立了一個完整的物件偵測評測模組，用於評估影像增強方法在 BDD100K 資料集上的效能。

## 🎯 核心理念

### Zero-Shot Evaluation (零樣本評估)
- **換圖不換標**: 使用相同的 YOLO 模型和標籤
- **預訓練模型**: 使用 COCO 預訓練權重作為「裁判」
- **公平比較**: 所有方法使用相同的評測標準

## 📁 完整檔案清單

### 1. 主要腳本 (Scripts)
| 檔案 | 功能 | 行數 |
|-----|------|------|
| `scripts/prepare_data.py` | 資料準備與驗證 | ~100 行 |
| `scripts/evaluate_yolo.py` | YOLO 評測主腳本 | ~350 行 |
| `scripts/visualize_results.py` | 結果視覺化與圖表生成 | ~280 行 |
| `scripts/run_example.sh` | 快速開始範例腳本 | ~90 行 |

### 2. 工具模組 (Utils)
| 檔案 | 功能 | 行數 |
|-----|------|------|
| `utils/data_processor.py` | 資料處理工具類別 | ~250 行 |
| `utils/metrics_calculator.py` | 指標計算與分析工具 | ~300 行 |
| `utils/__init__.py` | 模組初始化 | ~10 行 |

### 3. 配置與文檔
| 檔案 | 功能 |
|-----|------|
| `README.md` | 完整使用說明文檔 |
| `requirements.txt` | Python 依賴套件清單 |
| `.gitignore` | Git 忽略規則 |
| `config/yolo_configs/` | YAML 配置目錄（自動生成）|

### 4. 資料目錄
| 目錄 | 用途 |
|-----|------|
| `data/bdd100k_exp/` | 輸入資料集 |
| `data/bdd100k_exp/images/{raw,pwgcm,hsv}/` | 增強圖像 |
| `data/bdd100k_exp/labels/` | BDD100K 標籤 |
| `output/bdd100k_exp/{method}/` | 評測結果輸出 |

## 🔧 核心類別與函數

### DataProcessor 類別
```python
class DataProcessor:
    - prepare_dataset(): 準備資料集
    - verify_dataset(): 驗證資料完整性
    - print_verification_report(): 列印驗證報告
```

### YOLOEvaluator 類別
```python
class YOLOEvaluator:
    - create_yaml_config(): 動態生成 YAML 配置
    - evaluate(): 執行單一方法評測
    - evaluate_all(): 批次評測多種方法
```

### MetricsCalculator 類別
```python
class MetricsCalculator:
    - extract_yolo_metrics(): 提取 YOLO 指標
    - calculate_f1_score(): 計算 F1 分數
    - save_metrics(): 儲存指標到 JSON
    - create_comparison_table(): 建立比較表格
```

## 📊 支援的評測指標

### 主要指標
1. **mAP@0.5** - PASCAL VOC 標準
2. **mAP@0.5:0.95** - COCO 標準（論文首選）⭐
3. **mAP@0.75** - 嚴格 IoU 閾值

### 輔助指標
4. **Precision** - 精確率
5. **Recall** - 召回率
6. **F1-Score** - 調和平均

## 🚀 使用流程

### 步驟 1: 環境設定
```bash
cd object_detection
pip install -r requirements.txt
```

### 步驟 2: 準備資料
```bash
# 準備原始圖像
python scripts/prepare_data.py \
    --source /path/to/bdd100k/images \
    --method raw

# 準備 PWGCM 增強圖像
python scripts/prepare_data.py \
    --source /path/to/pwgcm/images \
    --method pwgcm

# 準備 HSV 增強圖像
python scripts/prepare_data.py \
    --source /path/to/hsv/images \
    --method hsv

# 驗證資料
python scripts/prepare_data.py --verify
```

### 步驟 3: 執行評測
```bash
# 評測所有方法
python scripts/evaluate_yolo.py \
    --model yolov8x.pt \
    --methods raw pwgcm hsv \
    --batch_size 16

# 使用 GPU
python scripts/evaluate_yolo.py \
    --model yolov8x.pt \
    --methods raw pwgcm hsv \
    --device 0
```

### 步驟 4: 視覺化結果
```bash
# 生成所有視覺化
python scripts/visualize_results.py \
    --results_dir ../output/bdd100k_exp \
    --output_dir ../visualizations \
    --all

# 只生成比較圖表
python scripts/visualize_results.py \
    --results_dir ../output/bdd100k_exp \
    --output comparison.png

# 生成雷達圖
python scripts/visualize_results.py \
    --results_dir ../output/bdd100k_exp \
    --radar

# 匯出 LaTeX 表格
python scripts/visualize_results.py \
    --results_dir ../output/bdd100k_exp \
    --latex
```

## 📈 輸出結果格式

### 1. JSON 格式指標
```json
{
  "model": "yolov8x",
  "method": "pwgcm",
  "metrics": {
    "mAP@0.5": 0.6542,
    "mAP@0.5:0.95": 0.4321,
    "mAP@0.75": 0.3456,
    "precision": 0.7234,
    "recall": 0.6891,
    "f1_score": 0.7058
  }
}
```

### 2. 文字摘要報告
```
============================================================
物件偵測評測結果摘要 (Object Detection Evaluation Summary)
============================================================

模型 (Model): yolov8x
方法 (Method): pwgcm
------------------------------------------------------------

主要指標 (Primary Metrics):
  mAP@0.5:0.95 (COCO):  0.4321
  mAP@0.5 (PASCAL VOC): 0.6542
  mAP@0.75:             0.3456

輔助指標 (Secondary Metrics):
  Precision:            0.7234
  Recall:               0.6891
  F1-Score:             0.7058
```

### 3. 比較表格 (CSV)
```csv
Method,Model,mAP@0.5,mAP@0.5:0.95,mAP@0.75,Precision,Recall,F1-Score
raw,yolov8x,0.6012,0.3845,0.3123,0.6789,0.6234,0.6500
pwgcm,yolov8x,0.6542,0.4321,0.3456,0.7234,0.6891,0.7058
hsv,yolov8x,0.6789,0.4567,0.3678,0.7456,0.7012,0.7226
```

## 🎨 視覺化輸出

### 1. 比較柱狀圖
- mAP@0.5 vs mAP@0.5:0.95 比較
- Precision vs Recall 比較
- F1-Score 比較
- 文字摘要

### 2. 雷達圖
- 5 個維度的綜合比較
- 標準化到 0-1 範圍
- 多方法疊加顯示

### 3. LaTeX 表格
- 論文級別的表格格式
- 可直接插入 LaTeX 文檔

## 🔍 關鍵特色

### 1. 模組化設計
- 清晰的職責分離
- 易於擴展和維護
- 可重用的工具類別

### 2. 自動化流程
- 一鍵評測所有方法
- 自動生成配置檔
- 自動比較和視覺化

### 3. 論文級輸出
- COCO 標準指標
- 專業視覺化圖表
- LaTeX 表格匯出

### 4. 錯誤處理
- 完整的資料驗證
- 友善的錯誤訊息
- 進度顯示

### 5. 文檔完整
- 詳細的 README
- 程式碼註解
- 使用範例

## 📝 使用範例

### 完整評測流程
```bash
#!/bin/bash
# 完整評測流程範例

# 1. 準備資料
python scripts/prepare_data.py --source /data/raw --method raw
python scripts/prepare_data.py --source /data/pwgcm --method pwgcm
python scripts/prepare_data.py --source /data/hsv --method hsv

# 2. 驗證資料
python scripts/prepare_data.py --verify

# 3. 執行評測
python scripts/evaluate_yolo.py \
    --model yolov8x.pt \
    --methods raw pwgcm hsv \
    --batch_size 16 \
    --device 0

# 4. 視覺化結果
python scripts/visualize_results.py \
    --results_dir ../output/bdd100k_exp \
    --output_dir ../visualizations \
    --all

echo "評測完成！結果已儲存至 ../output/bdd100k_exp/"
```

## 🎓 技術細節

### YOLO 配置
- 動態生成 YAML 配置檔
- 自動偵測圖像路徑
- 支援 BDD100K 10 類別

### 資料處理
- 支援符號連結和複製模式
- 自動驗證圖像-標籤配對
- 進度條顯示

### 指標計算
- 從 YOLO metrics 物件提取
- 自動計算 F1-Score
- 支援多次評測統計

## 🌟 總結

本模組提供了一個完整、專業的物件偵測評測解決方案，適用於：
- ✅ 影像增強方法的效能評估
- ✅ BDD100K 資料集的零樣本評測
- ✅ 論文級別的結果輸出
- ✅ 快速原型開發和實驗

總計 **~1,750 行程式碼**，包含完整的文檔、範例和工具。

---

**最後更新**: 2026-01-22  
**作者**: Daisy2100 (with GitHub Copilot)  
**授權**: MIT License
