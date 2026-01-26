"""
指標計算工具 (Metrics Calculator Utilities)

此模組提供物件偵測指標的計算和分析工具。
"""

import json
from pathlib import Path
from typing import Dict, List, Optional
import pandas as pd
import numpy as np


class MetricsCalculator:
    """指標計算器類別"""
    
    def __init__(self):
        """初始化指標計算器"""
        self.metrics_history = []
    
    def extract_yolo_metrics(self, metrics_obj) -> Dict[str, float]:
        """
        從 YOLO 的 metrics 物件中提取關鍵指標
        
        Args:
            metrics_obj: YOLO val() 返回的 metrics 物件
            
        Returns:
            Dict: 提取的指標字典
        """
        try:
            return {
                'mAP@0.5': float(metrics_obj.box.map50),
                'mAP@0.5:0.95': float(metrics_obj.box.map),
                'mAP@0.75': float(metrics_obj.box.map75) if hasattr(metrics_obj.box, 'map75') else 0.0,
                'precision': float(metrics_obj.box.mp) if hasattr(metrics_obj.box, 'mp') else 0.0,
                'recall': float(metrics_obj.box.mr) if hasattr(metrics_obj.box, 'mr') else 0.0,
            }
        except Exception as e:
            print(f"警告: 提取指標時發生錯誤 - {e}")
            return {
                'mAP@0.5': 0.0,
                'mAP@0.5:0.95': 0.0,
                'mAP@0.75': 0.0,
                'precision': 0.0,
                'recall': 0.0,
            }
    
    def calculate_f1_score(self, precision: float, recall: float) -> float:
        """
        計算 F1 分數
        
        Args:
            precision: 精確率
            recall: 召回率
            
        Returns:
            float: F1 分數
        """
        if precision + recall == 0:
            return 0.0
        return 2 * (precision * recall) / (precision + recall)
    
    def save_metrics(
        self,
        metrics: Dict[str, float],
        method_name: str,
        model_name: str,
        output_path: str
    ):
        """
        儲存指標到 JSON 檔案
        
        Args:
            metrics: 指標字典
            method_name: 方法名稱
            model_name: 模型名稱
            output_path: 輸出路徑
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 計算 F1 分數
        f1 = self.calculate_f1_score(
            metrics.get('precision', 0.0),
            metrics.get('recall', 0.0)
        )
        metrics['f1_score'] = f1
        
        # 建立完整的結果物件
        result = {
            'model': model_name,
            'method': method_name,
            'metrics': metrics
        }
        
        # 儲存為 JSON
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        
        print(f"✓ 指標已儲存至: {output_path}")
        
        # 加入歷史記錄
        self.metrics_history.append(result)
    
    def save_metrics_summary(
        self,
        metrics: Dict[str, float],
        method_name: str,
        model_name: str,
        output_path: str
    ):
        """
        儲存指標摘要為文字檔
        
        Args:
            metrics: 指標字典
            method_name: 方法名稱
            model_name: 模型名稱
            output_path: 輸出路徑
        """
        output_path = Path(output_path)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # 計算 F1 分數
        f1 = self.calculate_f1_score(
            metrics.get('precision', 0.0),
            metrics.get('recall', 0.0)
        )
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write("=" * 60 + "\n")
            f.write("物件偵測評測結果摘要 (Object Detection Evaluation Summary)\n")
            f.write("=" * 60 + "\n\n")
            f.write(f"模型 (Model): {model_name}\n")
            f.write(f"方法 (Method): {method_name}\n")
            f.write("-" * 60 + "\n\n")
            
            f.write("主要指標 (Primary Metrics):\n")
            f.write(f"  mAP@0.5:0.95 (COCO):  {metrics.get('mAP@0.5:0.95', 0.0):.4f}\n")
            f.write(f"  mAP@0.5 (PASCAL VOC): {metrics.get('mAP@0.5', 0.0):.4f}\n")
            f.write(f"  mAP@0.75:             {metrics.get('mAP@0.75', 0.0):.4f}\n\n")
            
            f.write("輔助指標 (Secondary Metrics):\n")
            f.write(f"  Precision:            {metrics.get('precision', 0.0):.4f}\n")
            f.write(f"  Recall:               {metrics.get('recall', 0.0):.4f}\n")
            f.write(f"  F1-Score:             {f1:.4f}\n\n")
            
            f.write("=" * 60 + "\n")
        
        print(f"✓ 摘要已儲存至: {output_path}")
    
    def create_comparison_table(self, results_dir: str) -> pd.DataFrame:
        """
        建立不同方法的比較表格
        
        Args:
            results_dir: 結果目錄路徑
            
        Returns:
            pd.DataFrame: 比較表格
        """
        results_path = Path(results_dir)
        
        # 收集所有方法的結果
        data = []
        
        for method_dir in results_path.iterdir():
            if not method_dir.is_dir():
                continue
            
            metrics_file = method_dir / "metrics.json"
            if not metrics_file.exists():
                continue
            
            # 讀取指標
            with open(metrics_file, 'r', encoding='utf-8') as f:
                result = json.load(f)
            
            # 提取資料
            metrics = result.get('metrics', {})
            f1 = self.calculate_f1_score(
                metrics.get('precision', 0.0),
                metrics.get('recall', 0.0)
            )
            
            data.append({
                'Method': result.get('method', method_dir.name),
                'Model': result.get('model', 'Unknown'),
                'mAP@0.5': metrics.get('mAP@0.5', 0.0),
                'mAP@0.5:0.95': metrics.get('mAP@0.5:0.95', 0.0),
                'mAP@0.75': metrics.get('mAP@0.75', 0.0),
                'Precision': metrics.get('precision', 0.0),
                'Recall': metrics.get('recall', 0.0),
                'F1-Score': f1
            })
        
        # 建立 DataFrame
        df = pd.DataFrame(data)
        
        # 按照 mAP@0.5:0.95 排序
        if not df.empty:
            df = df.sort_values('mAP@0.5:0.95', ascending=False)
        
        return df
    
    def print_comparison_table(self, df: pd.DataFrame):
        """
        列印比較表格
        
        Args:
            df: 比較表格 DataFrame
        """
        if df.empty:
            print("沒有可用的比較資料")
            return
        
        print("\n" + "=" * 100)
        print("物件偵測方法比較 (Object Detection Methods Comparison)")
        print("=" * 100)
        print(df.to_string(index=False))
        print("=" * 100)
        
        # 計算並顯示相對改善
        if len(df) > 1:
            print("\n相對改善 (Relative Improvement):")
            baseline_map = df.iloc[-1]['mAP@0.5:0.95']  # 最後一個作為基準
            
            for idx, row in df.iterrows():
                if row['mAP@0.5:0.95'] != baseline_map:
                    improvement = (
                        (row['mAP@0.5:0.95'] - baseline_map) / baseline_map * 100
                    )
                    print(f"  {row['Method']:15s}: {improvement:+.2f}%")
            print()
    
    def calculate_statistics(
        self,
        metrics_list: List[Dict[str, float]]
    ) -> Dict[str, Dict[str, float]]:
        """
        計算多次評測的統計資料
        
        Args:
            metrics_list: 指標列表
            
        Returns:
            Dict: 統計資料 (mean, std, min, max)
        """
        if not metrics_list:
            return {}
        
        # 取得所有指標名稱
        metric_names = list(metrics_list[0].keys())
        
        stats = {}
        for name in metric_names:
            values = [m.get(name, 0.0) for m in metrics_list]
            stats[name] = {
                'mean': float(np.mean(values)),
                'std': float(np.std(values)),
                'min': float(np.min(values)),
                'max': float(np.max(values))
            }
        
        return stats


if __name__ == "__main__":
    # 測試指標計算器
    calculator = MetricsCalculator()
    
    # 測試範例
    test_metrics = {
        'mAP@0.5': 0.654,
        'mAP@0.5:0.95': 0.432,
        'precision': 0.723,
        'recall': 0.689
    }
    
    f1 = calculator.calculate_f1_score(
        test_metrics['precision'],
        test_metrics['recall']
    )
    print(f"F1-Score: {f1:.4f}")
