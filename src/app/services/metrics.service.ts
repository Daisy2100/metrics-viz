import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ImageMetric } from '../models/metrics.model';

@Injectable({
  providedIn: 'root'
})
export class MetricsService {
  private dataUrl = 'assets/data/eval15-metrics.json';

  constructor(private http: HttpClient) { }

  /**
   * Load metrics data from JSON file
   */
  getMetrics(): Observable<ImageMetric[]> {
    return this.http.get<ImageMetric[]>(this.dataUrl);
  }

  /**
   * Get metrics by model name
   */
  getMetricsByModel(metrics: ImageMetric[], modelName: string): ImageMetric | undefined {
    return metrics.find(m => m.model === modelName);
  }

  /**
   * Get all unique model names
   */
  getModelNames(metrics: ImageMetric[]): string[] {
    return [...new Set(metrics.map(m => m.model))];
  }

  /**
   * Compare two models' metrics
   */
  compareModels(metrics: ImageMetric[], model1: string, model2: string): {
    model1: ImageMetric | undefined;
    model2: ImageMetric | undefined;
  } {
    return {
      model1: this.getMetricsByModel(metrics, model1),
      model2: this.getMetricsByModel(metrics, model2)
    };
  }
}
