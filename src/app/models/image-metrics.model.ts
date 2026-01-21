export interface ImageMetric {
  imageName: string;
  method: string;
  psnr: number;
  ssim: number;
  deltaE: number;
}

export interface MetricsData {
  images: ImageMetric[];
}
