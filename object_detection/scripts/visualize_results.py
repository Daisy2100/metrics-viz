#!/usr/bin/env python3
"""
結果視覺化腳本 (Results Visualization Script)

此腳本用於視覺化物件偵測評測結果，生成論文級別的圖表和表格。
"""

import argparse
import sys
from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd
import numpy as np

# 加入 utils 路徑
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.metrics_calculator import MetricsCalculator


def plot_comparison_bar_chart(df: pd.DataFrame, output_path: str):
    """
    繪製比較柱狀圖
    
    Args:
        df: 比較資料 DataFrame
        output_path: 輸出圖片路徑
    """
    if df.empty:
        print("沒有資料可繪製")
        return
    
    # 設定中文字體 (如果系統支援)
    plt.rcParams['font.sans-serif'] = ['Arial Unicode MS', 'SimHei', 'DejaVu Sans']
    plt.rcParams['axes.unicode_minus'] = False
    
    # 建立圖表
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    fig.suptitle('Object Detection Performance Comparison', fontsize=16, fontweight='bold')
    
    methods = df['Method'].tolist()
    x = np.arange(len(methods))
    width = 0.35
    
    # 1. mAP@0.5 和 mAP@0.5:0.95 比較
    ax1 = axes[0, 0]
    ax1.bar(x - width/2, df['mAP@0.5'], width, label='mAP@0.5', alpha=0.8)
    ax1.bar(x + width/2, df['mAP@0.5:0.95'], width, label='mAP@0.5:0.95', alpha=0.8)
    ax1.set_xlabel('Method')
    ax1.set_ylabel('mAP')
    ax1.set_title('Mean Average Precision Comparison')
    ax1.set_xticks(x)
    ax1.set_xticklabels(methods, rotation=45, ha='right')
    ax1.legend()
    ax1.grid(axis='y', alpha=0.3)
    
    # 2. Precision 和 Recall 比較
    ax2 = axes[0, 1]
    ax2.bar(x - width/2, df['Precision'], width, label='Precision', alpha=0.8)
    ax2.bar(x + width/2, df['Recall'], width, label='Recall', alpha=0.8)
    ax2.set_xlabel('Method')
    ax2.set_ylabel('Score')
    ax2.set_title('Precision and Recall Comparison')
    ax2.set_xticks(x)
    ax2.set_xticklabels(methods, rotation=45, ha='right')
    ax2.legend()
    ax2.grid(axis='y', alpha=0.3)
    
    # 3. F1-Score 比較
    ax3 = axes[1, 0]
    bars = ax3.bar(x, df['F1-Score'], alpha=0.8, color='steelblue')
    ax3.set_xlabel('Method')
    ax3.set_ylabel('F1-Score')
    ax3.set_title('F1-Score Comparison')
    ax3.set_xticks(x)
    ax3.set_xticklabels(methods, rotation=45, ha='right')
    ax3.grid(axis='y', alpha=0.3)
    
    # 在柱狀圖上顯示數值
    for bar in bars:
        height = bar.get_height()
        ax3.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:.4f}',
                ha='center', va='bottom')
    
    # 4. 綜合雷達圖
    ax4 = axes[1, 1]
    ax4.axis('off')
    
    # 在這個位置繪製文字摘要
    summary_text = "Performance Summary:\n\n"
    for idx, row in df.iterrows():
        summary_text += f"{row['Method']}:\n"
        summary_text += f"  mAP@0.5:0.95: {row['mAP@0.5:0.95']:.4f}\n"
        summary_text += f"  mAP@0.5: {row['mAP@0.5']:.4f}\n"
        summary_text += f"  F1-Score: {row['F1-Score']:.4f}\n\n"
    
    ax4.text(0.1, 0.9, summary_text, transform=ax4.transAxes,
            fontsize=11, verticalalignment='top',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.3),
            family='monospace')
    
    # 調整布局
    plt.tight_layout()
    
    # 儲存圖片
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ 圖表已儲存: {output_path}")
    
    # 顯示圖片 (可選)
    # plt.show()


def plot_radar_chart(df: pd.DataFrame, output_path: str):
    """
    繪製雷達圖
    
    Args:
        df: 比較資料 DataFrame
        output_path: 輸出圖片路徑
    """
    if df.empty or len(df) < 2:
        print("資料不足以繪製雷達圖")
        return
    
    # 選擇要比較的指標
    metrics = ['mAP@0.5', 'mAP@0.5:0.95', 'Precision', 'Recall', 'F1-Score']
    
    # 標準化數據到 0-1
    df_norm = df[metrics].copy()
    for col in metrics:
        max_val = df_norm[col].max()
        if max_val > 0:
            df_norm[col] = df_norm[col] / max_val
    
    # 設定角度
    angles = np.linspace(0, 2 * np.pi, len(metrics), endpoint=False).tolist()
    angles += angles[:1]  # 閉合圖形
    
    # 建立圖表
    fig, ax = plt.subplots(figsize=(10, 10), subplot_kw=dict(projection='polar'))
    
    # 繪製每個方法
    colors = plt.cm.Set2(np.linspace(0, 1, len(df)))
    
    for idx, (_, row) in enumerate(df.iterrows()):
        values = df_norm.iloc[idx].tolist()
        values += values[:1]  # 閉合圖形
        
        ax.plot(angles, values, 'o-', linewidth=2, 
                label=row['Method'], color=colors[idx])
        ax.fill(angles, values, alpha=0.15, color=colors[idx])
    
    # 設定標籤
    ax.set_xticks(angles[:-1])
    ax.set_xticklabels(metrics)
    ax.set_ylim(0, 1)
    ax.set_title('Object Detection Performance Radar Chart', 
                 size=16, fontweight='bold', pad=20)
    ax.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))
    ax.grid(True)
    
    # 儲存圖片
    plt.tight_layout()
    plt.savefig(output_path, dpi=300, bbox_inches='tight')
    print(f"✓ 雷達圖已儲存: {output_path}")


def export_latex_table(df: pd.DataFrame, output_path: str):
    """
    匯出 LaTeX 表格
    
    Args:
        df: 比較資料 DataFrame
        output_path: 輸出檔案路徑
    """
    if df.empty:
        print("沒有資料可匯出")
        return
    
    # 選擇要輸出的欄位
    df_export = df[['Method', 'mAP@0.5', 'mAP@0.5:0.95', 'Precision', 'Recall', 'F1-Score']].copy()
    
    # 格式化數值
    for col in df_export.columns[1:]:
        df_export[col] = df_export[col].apply(lambda x: f"{x:.4f}")
    
    # 生成 LaTeX
    latex_str = df_export.to_latex(index=False, escape=False)
    
    # 儲存
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(latex_str)
    
    print(f"✓ LaTeX 表格已儲存: {output_path}")


def main():
    """主函數"""
    parser = argparse.ArgumentParser(
        description="結果視覺化腳本 - 生成物件偵測評測結果圖表",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
範例用法:
  # 生成比較圖表
  python visualize_results.py \\
      --results_dir output/bdd100k_exp \\
      --output results_comparison.png
  
  # 生成所有圖表
  python visualize_results.py \\
      --results_dir output/bdd100k_exp \\
      --output_dir visualizations \\
      --all
        """
    )
    
    parser.add_argument(
        '--results_dir',
        type=str,
        default='output/bdd100k_exp',
        help='評測結果目錄 (預設: output/bdd100k_exp)'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        help='輸出圖片路徑'
    )
    
    parser.add_argument(
        '--output_dir',
        type=str,
        default='visualizations',
        help='輸出目錄 (使用 --all 時)'
    )
    
    parser.add_argument(
        '--all',
        action='store_true',
        help='生成所有類型的視覺化'
    )
    
    parser.add_argument(
        '--radar',
        action='store_true',
        help='生成雷達圖'
    )
    
    parser.add_argument(
        '--latex',
        action='store_true',
        help='匯出 LaTeX 表格'
    )
    
    args = parser.parse_args()
    
    # 建立指標計算器
    calculator = MetricsCalculator()
    
    # 讀取比較資料
    print("讀取評測結果...")
    df = calculator.create_comparison_table(args.results_dir)
    
    if df.empty:
        print("錯誤: 找不到評測結果")
        print(f"請確認 {args.results_dir} 目錄中有 metrics.json 檔案")
        sys.exit(1)
    
    # 顯示表格
    calculator.print_comparison_table(df)
    
    # 建立輸出目錄
    if args.all:
        output_dir = Path(args.output_dir)
        output_dir.mkdir(parents=True, exist_ok=True)
    
    # 生成圖表
    if args.output or args.all:
        output_path = args.output if args.output else str(Path(args.output_dir) / "comparison.png")
        plot_comparison_bar_chart(df, output_path)
    
    if args.radar or args.all:
        radar_path = str(Path(args.output_dir) / "radar.png") if args.all else "radar.png"
        plot_radar_chart(df, radar_path)
    
    if args.latex or args.all:
        latex_path = str(Path(args.output_dir) / "table.tex") if args.all else "table.tex"
        export_latex_table(df, latex_path)
    
    print("\n✓ 視覺化完成")


if __name__ == "__main__":
    main()
