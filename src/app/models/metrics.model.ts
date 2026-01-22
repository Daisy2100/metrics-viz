/**
 * Represents a metric value with statistical data
 */
export interface MetricValue {
  mean: number;
  std: number;
  max: number;
}

/**
 * Represents all metrics for an image
 * All fields are optional to support cases with partial metrics
 */
export interface Metrics {
  niqe?: number;
  brisque?: number;
  delta_e76_vs_original?: MetricValue;
  ciede2000_vs_original?: MetricValue;
  angular_error_vs_original?: MetricValue;
  loe?: number;
  psnr?: number;
  ssim?: number;
  lpips?: number;
  delta_e76_vs_reference?: MetricValue;
  ciede2000_vs_reference?: MetricValue;
  angular_error_vs_reference?: MetricValue;
}

/**
 * Represents image metrics data for a specific model and dataset
 */
export interface ImageMetric {
  dataset: string;
  filename: string;
  image_name: string;
  model: string;
  image_path: string;
  metrics: Metrics;
}
