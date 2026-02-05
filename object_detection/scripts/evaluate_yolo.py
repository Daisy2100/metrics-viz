#!/usr/bin/env python3
"""
YOLO 物件偵測評測腳本 (YOLO Object Detection Evaluation Script)

此腳本使用 Ultralytics YOLO 進行 Zero-Shot 物件偵測評測。
支援評測多種影像增強方法 (raw, pwgcm, hsv) 在 BDD100K 資料集上的效能。
"""

import argparse
import sys
from pathlib import Path
import yaml
from datetime import datetime

# 加入 utils 路徑
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.metrics_calculator import MetricsCalculator

try:
    from ultralytics import YOLO
except ImportError:
    print("錯誤: 無法導入 ultralytics 套件")
    print("請執行: pip install ultralytics")
    sys.exit(1)


class YOLOEvaluator:
    """YOLO 評測器類別"""
    
    def __init__(
        self,
        model_path: str = "yolov8x.pt",
        data_root: str = "data/bdd100k_exp",
        output_root: str = "output/bdd100k_exp"
    ):
        """
        初始化 YOLO 評測器
        
        Args:
            model_path: YOLO 模型權重路徑
            data_root: 資料根目錄
            output_root: 輸出根目錄
        """
        self.model_path = model_path
        self.data_root = Path(data_root)
        self.output_root = Path(output_root)
        self.metrics_calculator = MetricsCalculator()
        
        # 載入 YOLO 模型
        print(f"載入 YOLO 模型: {model_path}")
        try:
            self.model = YOLO(model_path)
            print(f"✓ 模型載入成功")
        except Exception as e:
            print(f"錯誤: 無法載入模型 - {e}")
            sys.exit(1)
    
    def create_yaml_config(self, method_name: str) -> str:
        """
        動態生成 YOLO 評測用的 YAML 配置檔
        
        Args:
            method_name: 方法名稱 (raw, pwgcm, hsv)
            
        Returns:
            str: YAML 配置檔路徑
        """
        # 配置檔路徑
        config_dir = Path(__file__).parent.parent / "config" / "yolo_configs"
        config_dir.mkdir(parents=True, exist_ok=True)
        config_path = config_dir / f"bdd100k_{method_name}.yaml"
        
        # 設定路徑（使用絕對路徑）
        data_root_abs = self.data_root.absolute()
        images_path = data_root_abs / "images" / method_name
        labels_path = data_root_abs / "labels"
        
        # YAML 配置內容
        config = {
            'path': str(data_root_abs),
            'train': None,  # 不需要訓練集
            'val': str(images_path / 'val') if (images_path / 'val').exists() else str(images_path),
            'test': None,
            
            # BDD100K 類別 (完整版本有 10 個類別)
            'names': {
                0: 'pedestrian',
                1: 'rider',
                2: 'car',
                3: 'truck',
                4: 'bus',
                5: 'train',
                6: 'motorcycle',
                7: 'bicycle',
                8: 'traffic light',
                9: 'traffic sign'
            }
        }
        
        # 儲存 YAML
        with open(config_path, 'w', encoding='utf-8') as f:
            yaml.dump(config, f, default_flow_style=False, allow_unicode=True)
        
        print(f"✓ YAML 配置檔已生成: {config_path}")
        return str(config_path)
    
    def evaluate(
        self,
        method_name: str,
        batch_size: int = 16,
        imgsz: int = 640,
        conf: float = 0.001,
        iou: float = 0.6,
        device: str = ''
    ) -> dict:
        """
        執行 YOLO 評測
        
        Args:
            method_name: 方法名稱
            batch_size: 批次大小
            imgsz: 圖像大小
            conf: 信心度閾值
            iou: IoU 閾值
            device: 裝置 ('', 'cpu', '0', '0,1', etc.)
            
        Returns:
            dict: 評測指標
        """
        print("\n" + "=" * 60)
        print(f"開始評測: {method_name.upper()}")
        print("=" * 60)
        
        # 生成 YAML 配置
        yaml_path = self.create_yaml_config(method_name)
        
        # 輸出目錄
        output_dir = self.output_root / method_name
        output_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # 執行驗證
            print(f"\n執行 YOLO 驗證...")
            print(f"  資料集: {yaml_path}")
            print(f"  批次大小: {batch_size}")
            print(f"  圖像大小: {imgsz}")
            print(f"  信心度閾值: {conf}")
            print(f"  IoU 閾值: {iou}")
            print(f"  裝置: {device if device else 'auto'}\n")
            
            metrics = self.model.val(
                data=yaml_path,
                split='val',
                batch=batch_size,
                imgsz=imgsz,
                conf=conf,
                iou=iou,
                device=device,
                plots=False,  # 不生成圖表以加速
                save_json=True,  # 儲存 JSON 結果
                project=str(output_dir),
                name='results',
                exist_ok=True
            )
            
            # 提取指標
            extracted_metrics = self.metrics_calculator.extract_yolo_metrics(metrics)
            
            # 顯示結果
            print("\n" + "-" * 60)
            print("評測結果:")
            print("-" * 60)
            for key, value in extracted_metrics.items():
                print(f"  {key:20s}: {value:.4f}")
            print("-" * 60)
            
            # 儲存指標
            model_name = Path(self.model_path).stem
            
            self.metrics_calculator.save_metrics(
                metrics=extracted_metrics,
                method_name=method_name,
                model_name=model_name,
                output_path=str(output_dir / "metrics.json")
            )
            
            self.metrics_calculator.save_metrics_summary(
                metrics=extracted_metrics,
                method_name=method_name,
                model_name=model_name,
                output_path=str(output_dir / "metrics_summary.txt")
            )
            
            print(f"\n✓ {method_name.upper()} 評測完成")
            print(f"  結果儲存於: {output_dir}")
            print("=" * 60 + "\n")
            
            return extracted_metrics
            
        except Exception as e:
            print(f"\n✗ 評測失敗: {e}")
            import traceback
            traceback.print_exc()
            return {}
    
    def evaluate_all(
        self,
        methods: list = None,
        batch_size: int = 16,
        imgsz: int = 640,
        conf: float = 0.001,
        iou: float = 0.6,
        device: str = ''
    ):
        """
        評測所有方法
        
        Args:
            methods: 要評測的方法列表
            batch_size: 批次大小
            imgsz: 圖像大小
            conf: 信心度閾值
            iou: IoU 閾值
            device: 裝置
        """
        if methods is None:
            methods = ['raw', 'pwgcm', 'hsv']
        
        print("\n" + "=" * 60)
        print("批次評測開始")
        print(f"評測方法: {', '.join(methods)}")
        print(f"模型: {self.model_path}")
        print(f"開始時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # 評測每個方法
        results = {}
        for method in methods:
            metrics = self.evaluate(
                method_name=method,
                batch_size=batch_size,
                imgsz=imgsz,
                conf=conf,
                iou=iou,
                device=device
            )
            results[method] = metrics
        
        # 生成比較表格
        print("\n" + "=" * 60)
        print("生成比較報告...")
        print("=" * 60)
        
        df = self.metrics_calculator.create_comparison_table(str(self.output_root))
        self.metrics_calculator.print_comparison_table(df)
        
        # 儲存比較表格
        if not df.empty:
            comparison_path = self.output_root / "comparison.csv"
            df.to_csv(comparison_path, index=False)
            print(f"\n✓ 比較表格已儲存: {comparison_path}")
        
        print("\n" + "=" * 60)
        print("批次評測完成")
        print(f"結束時間: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60 + "\n")


def main():
    """主函數"""
    parser = argparse.ArgumentParser(
        description="YOLO 物件偵測評測腳本",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
範例用法:
  # 評測所有方法
  python evaluate_yolo.py --model yolov8x.pt --methods raw pwgcm hsv
  
  # 只評測特定方法
  python evaluate_yolo.py --model yolov8x.pt --methods pwgcm hsv
  
  # 使用 GPU
  python evaluate_yolo.py --model yolov8x.pt --device 0
  
  # 調整批次大小
  python evaluate_yolo.py --model yolov8x.pt --batch_size 32
        """
    )
    
    parser.add_argument(
        '--model',
        type=str,
        default='yolov8x.pt',
        help='YOLO 模型權重路徑 (預設: yolov8x.pt)'
    )
    
    parser.add_argument(
        '--data_root',
        type=str,
        default='data/bdd100k_exp',
        help='資料根目錄 (預設: data/bdd100k_exp)'
    )
    
    parser.add_argument(
        '--output_root',
        type=str,
        default='output/bdd100k_exp',
        help='輸出根目錄 (預設: output/bdd100k_exp)'
    )
    
    parser.add_argument(
        '--methods',
        nargs='+',
        default=['raw', 'pwgcm', 'hsv'],
        help='要評測的方法列表 (預設: raw pwgcm hsv)'
    )
    
    parser.add_argument(
        '--batch_size',
        type=int,
        default=16,
        help='批次大小 (預設: 16)'
    )
    
    parser.add_argument(
        '--imgsz',
        type=int,
        default=640,
        help='圖像大小 (預設: 640)'
    )
    
    parser.add_argument(
        '--conf',
        type=float,
        default=0.001,
        help='信心度閾值 (預設: 0.001)'
    )
    
    parser.add_argument(
        '--iou',
        type=float,
        default=0.6,
        help='IoU 閾值 (預設: 0.6)'
    )
    
    parser.add_argument(
        '--device',
        type=str,
        default='',
        help='裝置 (預設: auto, 選項: cpu, 0, 0,1, etc.)'
    )
    
    args = parser.parse_args()
    
    # 建立評測器
    evaluator = YOLOEvaluator(
        model_path=args.model,
        data_root=args.data_root,
        output_root=args.output_root
    )
    
    # 執行評測
    evaluator.evaluate_all(
        methods=args.methods,
        batch_size=args.batch_size,
        imgsz=args.imgsz,
        conf=args.conf,
        iou=args.iou,
        device=args.device
    )


if __name__ == "__main__":
    main()
