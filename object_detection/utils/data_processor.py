"""
資料處理工具 (Data Processor Utilities)

此模組提供資料處理相關的工具函數，用於準備和轉換評測資料。
"""

import os
import shutil
from pathlib import Path
from typing import List, Dict, Optional
import cv2
import numpy as np
from tqdm import tqdm


class DataProcessor:
    """資料處理器類別"""
    
    def __init__(self, data_root: str = "data/bdd100k_exp"):
        """
        初始化資料處理器
        
        Args:
            data_root: 資料根目錄路徑
        """
        self.data_root = Path(data_root)
        self.images_dir = self.data_root / "images"
        self.labels_dir = self.data_root / "labels"
        
    def prepare_dataset(
        self,
        source_images: str,
        method_name: str,
        copy_mode: bool = False
    ) -> bool:
        """
        準備資料集：將增強圖像複製或連結到指定位置
        
        Args:
            source_images: 來源圖像目錄
            method_name: 方法名稱 (raw, pwgcm, hsv)
            copy_mode: 是否使用複製模式 (False 則使用符號連結)
            
        Returns:
            bool: 是否成功
        """
        target_dir = self.images_dir / method_name
        target_dir.mkdir(parents=True, exist_ok=True)
        
        source_path = Path(source_images)
        if not source_path.exists():
            print(f"錯誤: 來源目錄不存在 - {source_images}")
            return False
        
        # 取得所有圖像檔案
        image_files = self._get_image_files(source_path)
        
        if not image_files:
            print(f"警告: 在 {source_images} 中找不到圖像檔案")
            return False
        
        print(f"正在準備 {method_name} 資料集...")
        print(f"來源: {source_path}")
        print(f"目標: {target_dir}")
        print(f"檔案數量: {len(image_files)}")
        
        # 複製或連結檔案
        for img_file in tqdm(image_files, desc=f"處理 {method_name}"):
            target_file = target_dir / img_file.name
            
            if copy_mode:
                shutil.copy2(img_file, target_file)
            else:
                if target_file.exists():
                    target_file.unlink()
                os.symlink(img_file.absolute(), target_file)
        
        print(f"✓ {method_name} 資料集準備完成\n")
        return True
    
    def _get_image_files(self, directory: Path) -> List[Path]:
        """
        取得目錄中的所有圖像檔案
        
        Args:
            directory: 目錄路徑
            
        Returns:
            List[Path]: 圖像檔案路徑列表
        """
        image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif'}
        return [
            f for f in directory.rglob('*')
            if f.suffix.lower() in image_extensions and f.is_file()
        ]
    
    def verify_dataset(self, method_name: str) -> Dict[str, any]:
        """
        驗證資料集完整性
        
        Args:
            method_name: 方法名稱
            
        Returns:
            Dict: 驗證結果資訊
        """
        result = {
            'method': method_name,
            'images_exist': False,
            'labels_exist': False,
            'image_count': 0,
            'label_count': 0,
            'matched_count': 0,
            'issues': []
        }
        
        # 檢查圖像目錄
        images_dir = self.images_dir / method_name
        if not images_dir.exists():
            result['issues'].append(f"圖像目錄不存在: {images_dir}")
            return result
        
        result['images_exist'] = True
        image_files = self._get_image_files(images_dir)
        result['image_count'] = len(image_files)
        
        # 檢查標籤目錄
        labels_val_dir = self.labels_dir / "val"
        if not labels_val_dir.exists():
            result['issues'].append(f"標籤目錄不存在: {labels_val_dir}")
            return result
        
        result['labels_exist'] = True
        label_files = list(labels_val_dir.glob('*.txt'))
        result['label_count'] = len(label_files)
        
        # 檢查配對
        image_stems = {f.stem for f in image_files}
        label_stems = {f.stem for f in label_files}
        
        matched = image_stems & label_stems
        result['matched_count'] = len(matched)
        
        # 檢查未配對的檔案
        unmatched_images = image_stems - label_stems
        unmatched_labels = label_stems - image_stems
        
        if unmatched_images:
            result['issues'].append(
                f"有 {len(unmatched_images)} 個圖像沒有對應的標籤"
            )
        
        if unmatched_labels:
            result['issues'].append(
                f"有 {len(unmatched_labels)} 個標籤沒有對應的圖像"
            )
        
        return result
    
    def print_verification_report(self, method_names: List[str]):
        """
        列印驗證報告
        
        Args:
            method_names: 要驗證的方法名稱列表
        """
        print("=" * 60)
        print("資料集驗證報告 (Dataset Verification Report)")
        print("=" * 60)
        
        for method in method_names:
            result = self.verify_dataset(method)
            
            print(f"\n【{result['method'].upper()}】")
            print(f"  圖像目錄存在: {'✓' if result['images_exist'] else '✗'}")
            print(f"  標籤目錄存在: {'✓' if result['labels_exist'] else '✗'}")
            print(f"  圖像數量: {result['image_count']}")
            print(f"  標籤數量: {result['label_count']}")
            print(f"  配對成功: {result['matched_count']}")
            
            if result['issues']:
                print(f"  ⚠ 問題:")
                for issue in result['issues']:
                    print(f"    - {issue}")
            else:
                print(f"  ✓ 所有檢查通過")
        
        print("\n" + "=" * 60)


def apply_pwgcm_enhancement(image_path: str, output_path: str, **params):
    """
    應用 PWGCM 增強演算法
    
    Args:
        image_path: 輸入圖像路徑
        output_path: 輸出圖像路徑
        **params: PWGCM 參數
    """
    # 這是一個佔位函數，實際實作需要根據 PWGCM 論文
    # 或使用現有的 PWGCM 實作
    img = cv2.imread(image_path)
    
    # TODO: 實作 PWGCM 演算法
    # 目前只是簡單的複製
    enhanced_img = img.copy()
    
    cv2.imwrite(output_path, enhanced_img)


def apply_hsv_enhancement(
    image_path: str,
    output_path: str,
    h_shift: float = 0.0,
    s_scale: float = 1.0,
    v_scale: float = 1.0
):
    """
    應用 HSV 增強演算法
    
    Args:
        image_path: 輸入圖像路徑
        output_path: 輸出圖像路徑
        h_shift: 色相偏移量 (-180 to 180)
        s_scale: 飽和度縮放因子
        v_scale: 明度縮放因子
    """
    # 讀取圖像
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError(f"無法讀取圖像: {image_path}")
    
    # 轉換到 HSV 色彩空間
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV).astype(np.float32)
    
    # 調整 HSV 通道
    hsv[:, :, 0] = (hsv[:, :, 0] + h_shift) % 180  # Hue
    hsv[:, :, 1] = np.clip(hsv[:, :, 1] * s_scale, 0, 255)  # Saturation
    hsv[:, :, 2] = np.clip(hsv[:, :, 2] * v_scale, 0, 255)  # Value
    
    # 轉換回 BGR
    hsv = hsv.astype(np.uint8)
    enhanced_img = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)
    
    # 儲存結果
    cv2.imwrite(output_path, enhanced_img)


if __name__ == "__main__":
    # 測試資料處理器
    processor = DataProcessor()
    
    # 驗證範例
    processor.print_verification_report(['raw', 'pwgcm', 'hsv'])
