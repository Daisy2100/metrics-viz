import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { MetricsService } from '../../services/metrics.service';
import { ImageMetric } from '../../models/metrics.model';

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent implements OnInit {
  metrics: ImageMetric[] = [];
  loading: boolean = true;

  constructor(private metricsService: MetricsService) { }

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.loading = true;
    this.metricsService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        this.loading = false;
      }
    });
  }

  getModelNames(): string[] {
    return this.metricsService.getModelNames(this.metrics);
  }

  getMetricsByModel(modelName: string): ImageMetric | undefined {
    return this.metricsService.getMetricsByModel(this.metrics, modelName);
  }
}
