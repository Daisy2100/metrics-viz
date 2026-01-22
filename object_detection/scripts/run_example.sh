#!/bin/bash
#
# 快速開始範例腳本 (Quick Start Example Script)
#
# 此腳本示範如何使用物件偵測評測模組的完整流程
#

set -e  # 遇到錯誤立即停止

echo "============================================================"
echo "物件偵測評測 - 快速開始範例"
echo "Object Detection Evaluation - Quick Start Example"
echo "============================================================"
echo ""

# 步驟 1: 檢查環境
echo "步驟 1/4: 檢查環境..."
echo "------------------------------------------------------------"

if ! command -v python3 &> /dev/null; then
    echo "錯誤: 找不到 python3"
    exit 1
fi

echo "✓ Python 已安裝: $(python3 --version)"

# 檢查是否安裝了 ultralytics
if ! python3 -c "import ultralytics" 2>/dev/null; then
    echo "⚠ ultralytics 未安裝"
    echo "正在安裝依賴套件..."
    pip install -r ../requirements.txt
else
    echo "✓ ultralytics 已安裝"
fi

echo ""

# 步驟 2: 準備資料 (示範)
echo "步驟 2/4: 準備資料..."
echo "------------------------------------------------------------"
echo "此步驟需要您提供實際的圖像和標籤資料"
echo ""
echo "請執行以下命令準備您的資料:"
echo ""
echo "# 準備原始圖像"
echo "python3 prepare_data.py \\"
echo "    --source /path/to/bdd100k/val/images \\"
echo "    --method raw \\"
echo "    --data_root ../../data/bdd100k_exp"
echo ""
echo "# 準備 PWGCM 增強圖像"
echo "python3 prepare_data.py \\"
echo "    --source /path/to/pwgcm/enhanced/images \\"
echo "    --method pwgcm \\"
echo "    --data_root ../../data/bdd100k_exp"
echo ""
echo "# 準備 HSV 增強圖像"
echo "python3 prepare_data.py \\"
echo "    --source /path/to/hsv/enhanced/images \\"
echo "    --method hsv \\"
echo "    --data_root ../../data/bdd100k_exp"
echo ""
echo "# 複製 BDD100K 標籤到指定位置"
echo "cp -r /path/to/bdd100k/labels ../../data/bdd100k_exp/"
echo ""

read -p "資料是否已準備好? (按 Enter 繼續，或 Ctrl+C 取消) " dummy

echo ""

# 步驟 3: 驗證資料
echo "步驟 3/4: 驗證資料..."
echo "------------------------------------------------------------"
python3 prepare_data.py --verify --methods raw pwgcm hsv --data_root ../../data/bdd100k_exp
echo ""

# 步驟 4: 執行評測
echo "步驟 4/4: 執行評測..."
echo "------------------------------------------------------------"
echo "開始 YOLO 評測 (這可能需要一些時間)..."
echo ""

# 選擇模型
MODEL="yolov8x.pt"  # 可改為 yolov8m.pt 或 yolov8l.pt
BATCH_SIZE=16       # 根據您的 GPU 記憶體調整
DEVICE=""           # 留空自動選擇，或設定為 "0" 使用 GPU 0

echo "使用模型: $MODEL"
echo "批次大小: $BATCH_SIZE"
echo ""

python3 evaluate_yolo.py \
    --model "$MODEL" \
    --data_root ../../data/bdd100k_exp \
    --output_root ../../output/bdd100k_exp \
    --methods raw pwgcm hsv \
    --batch_size "$BATCH_SIZE" \
    --device "$DEVICE"

echo ""
echo "============================================================"
echo "評測完成！"
echo "============================================================"
echo ""
echo "結果已儲存至: ../../output/bdd100k_exp/"
echo ""
echo "下一步: 視覺化結果"
echo ""
echo "python3 visualize_results.py \\"
echo "    --results_dir ../../output/bdd100k_exp \\"
echo "    --output_dir ../../visualizations \\"
echo "    --all"
echo ""
echo "============================================================"
