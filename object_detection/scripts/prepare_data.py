#!/usr/bin/env python3
"""
資料準備腳本 (Data Preparation Script)

此腳本用於準備 BDD100K 評測資料，包括複製或連結增強圖像到指定位置。
"""

import argparse
import sys
from pathlib import Path

# 加入 utils 路徑
sys.path.insert(0, str(Path(__file__).parent.parent))

from utils.data_processor import DataProcessor


def main():
    """主函數"""
    parser = argparse.ArgumentParser(
        description="資料準備腳本 - 準備 BDD100K 評測資料",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
範例用法:
  # 準備 PWGCM 增強圖像
  python prepare_data.py \\
      --source /path/to/pwgcm/images \\
      --method pwgcm \\
      --data_root data/bdd100k_exp
  
  # 準備 HSV 增強圖像 (使用複製模式)
  python prepare_data.py \\
      --source /path/to/hsv/images \\
      --method hsv \\
      --copy
  
  # 準備原始圖像
  python prepare_data.py \\
      --source /path/to/bdd100k/images \\
      --method raw
  
  # 驗證資料集
  python prepare_data.py --verify --methods raw pwgcm hsv
        """
    )
    
    parser.add_argument(
        '--source',
        type=str,
        help='來源圖像目錄路徑'
    )
    
    parser.add_argument(
        '--method',
        type=str,
        choices=['raw', 'pwgcm', 'hsv'],
        help='方法名稱 (raw, pwgcm, hsv)'
    )
    
    parser.add_argument(
        '--data_root',
        type=str,
        default='data/bdd100k_exp',
        help='資料根目錄 (預設: data/bdd100k_exp)'
    )
    
    parser.add_argument(
        '--copy',
        action='store_true',
        help='使用複製模式 (預設使用符號連結)'
    )
    
    parser.add_argument(
        '--verify',
        action='store_true',
        help='驗證資料集完整性'
    )
    
    parser.add_argument(
        '--methods',
        nargs='+',
        default=['raw', 'pwgcm', 'hsv'],
        help='要驗證的方法列表 (與 --verify 一起使用)'
    )
    
    args = parser.parse_args()
    
    # 建立資料處理器
    processor = DataProcessor(data_root=args.data_root)
    
    # 驗證模式
    if args.verify:
        processor.print_verification_report(args.methods)
        return
    
    # 準備資料模式
    if not args.source or not args.method:
        parser.error("準備資料需要 --source 和 --method 參數")
    
    # 執行資料準備
    success = processor.prepare_dataset(
        source_images=args.source,
        method_name=args.method,
        copy_mode=args.copy
    )
    
    if success:
        print("\n" + "=" * 60)
        print("資料準備完成！")
        print("=" * 60)
        
        # 驗證準備結果
        result = processor.verify_dataset(args.method)
        
        print(f"\n驗證結果:")
        print(f"  方法: {result['method']}")
        print(f"  圖像數量: {result['image_count']}")
        print(f"  標籤數量: {result['label_count']}")
        print(f"  配對成功: {result['matched_count']}")
        
        if result['issues']:
            print(f"\n⚠ 警告:")
            for issue in result['issues']:
                print(f"  - {issue}")
        else:
            print(f"\n✓ 所有檢查通過")
        
        print("\n下一步: 執行 YOLO 評測")
        print(f"  python scripts/evaluate_yolo.py --methods {args.method}")
        print()
    else:
        print("\n✗ 資料準備失敗")
        sys.exit(1)


if __name__ == "__main__":
    main()
