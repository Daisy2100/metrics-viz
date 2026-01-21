import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { MetricsService } from '../../services/metrics.service';
import { ImageMetric } from '../../models/metrics.model';

type ViewMode = 'table' | 'chart' | 'both';

interface ViewOption {
  label: string;
  value: ViewMode;
}

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, CardModule, ChartModule, ButtonModule, SelectButtonModule],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent implements OnInit {
  metrics: ImageMetric[] = [];
  loading: boolean = true;
  viewMode: ViewMode = 'both';
  viewOptions: ViewOption[] = [
    { label: 'Table Only', value: 'table' },
    { label: 'Chart Only', value: 'chart' },
    { label: 'Both', value: 'both' }
  ];

  // Chart data
  psnrChartData: any;
  ssimChartData: any;
  niqeChartData: any;
  brisqueChartData: any;
  chartOptions: any;

  constructor(private metricsService: MetricsService) { }

  ngOnInit(): void {
    this.loadMetrics();
    this.initChartOptions();
  }

  loadMetrics(): void {
    this.loading = true;
    this.metricsService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading metrics:', error);
        this.loading = false;
      }
    });
  }

  initChartOptions(): void {
    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }

  prepareChartData(): void {
    if (this.metrics.length === 0) return;

    const models = this.metrics.map(m => m.model);
    const colors = [
      'rgba(59, 130, 246, 0.7)',  // Blue
      'rgba(16, 185, 129, 0.7)',  // Green
    ];

    // PSNR Chart (Higher is better)
    this.psnrChartData = {
      labels: models,
      datasets: [{
        label: 'PSNR',
        data: this.metrics.map(m => m.metrics.psnr),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // SSIM Chart (Higher is better)
    this.ssimChartData = {
      labels: models,
      datasets: [{
        label: 'SSIM',
        data: this.metrics.map(m => m.metrics.ssim),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // NIQE Chart (Lower is better)
    this.niqeChartData = {
      labels: models,
      datasets: [{
        label: 'NIQE',
        data: this.metrics.map(m => m.metrics.niqe),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // BRISQUE Chart (Lower is better)
    this.brisqueChartData = {
      labels: models,
      datasets: [{
        label: 'BRISQUE',
        data: this.metrics.map(m => m.metrics.brisque),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };
  }

  getModelNames(): string[] {
    return this.metricsService.getModelNames(this.metrics);
  }

  getMetricsByModel(modelName: string): ImageMetric | undefined {
    return this.metricsService.getMetricsByModel(this.metrics, modelName);
  }

  showTable(): boolean {
    return this.viewMode === 'table' || this.viewMode === 'both';
  }

  showCharts(): boolean {
    return this.viewMode === 'chart' || this.viewMode === 'both';
  }
}
