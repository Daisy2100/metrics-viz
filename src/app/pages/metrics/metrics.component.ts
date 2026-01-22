import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { MetricsService } from '../../services/metrics.service';
import { ImageMetric } from '../../models/metrics.model';

type ViewMode = 'table' | 'chart' | 'both';

interface ViewOption {
  label: string;
  value: ViewMode;
}

interface AveragedMetric {
  model: string;
  metrics: {
    psnr: number;
    ssim: number;
    niqe: number;
    brisque: number;
    loe: number;
    lpips: number;
    delta_e76_vs_original: { mean: number };
    delta_e76_vs_reference: { mean: number };
    ciede2000_vs_original: { mean: number };
    ciede2000_vs_reference: { mean: number };
    angular_error_vs_original: { mean: number };
    angular_error_vs_reference: { mean: number };
  };
}

@Component({
  selector: 'app-metrics',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    CardModule,
    ChartModule,
    ButtonModule,
    SelectButtonModule,
    FileUploadModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './metrics.component.html',
  styleUrl: './metrics.component.scss'
})
export class MetricsComponent implements OnInit {
  metrics: ImageMetric[] = [];
  averagedMetrics: AveragedMetric[] = [];
  loading: boolean = false;
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
  loeChartData: any;
  lpipsChartData: any;
  deltaE76OriginalChartData: any;
  deltaE76ReferenceChartData: any;
  ciede2000OriginalChartData: any;
  ciede2000ReferenceChartData: any;
  angularErrorOriginalChartData: any;
  angularErrorReferenceChartData: any;
  radarChartData: any;  // Image Quality
  radarColorOriginalChartData: any;  // Color vs Original
  radarColorReferenceChartData: any;  // Color vs Reference
  higherBetterAreaChartData: any;  // Area Chart
  chartOptions: any;
  radarChartOptions: any;
  higherBetterAreaChartOptions: any;

  constructor(
    private metricsService: MetricsService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    // Start with empty metrics
    this.loading = false;
    this.initChartOptions();
  }

  onUpload(event: any) {
    const file = event.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
            // Append new data instead of replacing
            this.metrics = [...this.metrics, ...json];
            this.prepareChartData();
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Data uploaded successfully' });
        } else {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Invalid JSON format: Expected an array' });
        }
      } catch (error) {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error parsing JSON file' });
        console.error('JSON parse error:', error);
      }
    };

    reader.readAsText(file);
  }

  clearData(): void {
    this.metrics = [];
    this.prepareChartData();
    this.messageService.add({ severity: 'info', summary: 'Cleared', detail: 'All data has been cleared' });
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

    this.radarChartOptions = {
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
        r: {
          beginAtZero: true,
          ticks: {
            stepSize: 0.2
          }
        }
      }
    };

    this.higherBetterAreaChartOptions = {
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
    if (this.metrics.length === 0) {
        // Reset chart data when no metrics are present
        this.psnrChartData = null;
        this.ssimChartData = null;
        this.niqeChartData = null;
        this.brisqueChartData = null;
        this.loeChartData = null;
        this.lpipsChartData = null;
        this.deltaE76OriginalChartData = null;
        this.deltaE76ReferenceChartData = null;
        this.ciede2000OriginalChartData = null;
        this.ciede2000ReferenceChartData = null;
        this.angularErrorOriginalChartData = null;
        this.angularErrorReferenceChartData = null;
        this.radarChartData = null;
        this.radarColorOriginalChartData = null;
        this.radarColorReferenceChartData = null;
        this.higherBetterAreaChartData = null;
        this.averagedMetrics = [];
        return;
    }

    // 1. Group metrics by model
    const groupedMetrics = this.metrics.reduce((acc, curr) => {
      if (!acc[curr.model]) {
        acc[curr.model] = [];
      }
      acc[curr.model].push(curr);
      return acc;
    }, {} as Record<string, ImageMetric[]>);

    const models = Object.keys(groupedMetrics);

    // 2. Calculate averages for each model
    this.averagedMetrics = models.map(model => {
      const metricsList = groupedMetrics[model];
      const count = metricsList.length;

      const sum = metricsList.reduce((acc, curr) => ({
        psnr: acc.psnr + curr.metrics.psnr,
        ssim: acc.ssim + curr.metrics.ssim,
        niqe: acc.niqe + curr.metrics.niqe,
        brisque: acc.brisque + curr.metrics.brisque,
        loe: acc.loe + curr.metrics.loe,
        lpips: acc.lpips + curr.metrics.lpips,
        delta_e76_vs_original: acc.delta_e76_vs_original + curr.metrics.delta_e76_vs_original.mean,
        delta_e76_vs_reference: acc.delta_e76_vs_reference + curr.metrics.delta_e76_vs_reference.mean,
        ciede2000_vs_original: acc.ciede2000_vs_original + curr.metrics.ciede2000_vs_original.mean,
        ciede2000_vs_reference: acc.ciede2000_vs_reference + curr.metrics.ciede2000_vs_reference.mean,
        angular_error_vs_original: acc.angular_error_vs_original + curr.metrics.angular_error_vs_original.mean,
        angular_error_vs_reference: acc.angular_error_vs_reference + curr.metrics.angular_error_vs_reference.mean,
      }), {
        psnr: 0, ssim: 0, niqe: 0, brisque: 0, loe: 0, lpips: 0,
        delta_e76_vs_original: 0, delta_e76_vs_reference: 0,
        ciede2000_vs_original: 0, ciede2000_vs_reference: 0,
        angular_error_vs_original: 0, angular_error_vs_reference: 0
      });

      return {
        model,
        metrics: {
          psnr: sum.psnr / count,
          ssim: sum.ssim / count,
          niqe: sum.niqe / count,
          brisque: sum.brisque / count,
          loe: sum.loe / count,
          lpips: sum.lpips / count,
          delta_e76_vs_original: { mean: sum.delta_e76_vs_original / count },
          delta_e76_vs_reference: { mean: sum.delta_e76_vs_reference / count },
          ciede2000_vs_original: { mean: sum.ciede2000_vs_original / count },
          ciede2000_vs_reference: { mean: sum.ciede2000_vs_reference / count },
          angular_error_vs_original: { mean: sum.angular_error_vs_original / count },
          angular_error_vs_reference: { mean: sum.angular_error_vs_reference / count }
        }
      };
    });

    const baseColors = [
      'rgba(59, 130, 246, 0.7)',   // Blue
      'rgba(16, 185, 129, 0.7)',   // Green
      'rgba(249, 115, 22, 0.7)',   // Orange
      'rgba(139, 92, 246, 0.7)',   // Purple
      'rgba(236, 72, 153, 0.7)',   // Pink
      'rgba(234, 179, 8, 0.7)',    // Yellow
      'rgba(6, 182, 212, 0.7)',    // Cyan
      'rgba(220, 38, 38, 0.7)',    // Red
    ];

    const getColors = (count: number) => Array(count).fill(0).map((_, i) => baseColors[i % baseColors.length]);
    const chartColors = getColors(models.length);
    const borderColors = chartColors.map(c => c.replace('0.7', '1'));

    // PSNR Chart (Higher is better)
    this.psnrChartData = {
      labels: models,
      datasets: [{
        label: 'PSNR (Avg)',
        data: this.averagedMetrics.map(m => m.metrics.psnr),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // SSIM Chart (Higher is better)
    this.ssimChartData = {
      labels: models,
      datasets: [{
        label: 'SSIM (Avg)',
        data: this.averagedMetrics.map(m => m.metrics.ssim),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // NIQE Chart (Lower is better)
    this.niqeChartData = {
      labels: models,
      datasets: [{
        label: 'NIQE (Avg)',
        data: this.averagedMetrics.map(m => m.metrics.niqe),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // BRISQUE Chart (Lower is better)
    this.brisqueChartData = {
      labels: models,
      datasets: [{
        label: 'BRISQUE (Avg)',
        data: this.averagedMetrics.map(m => m.metrics.brisque),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // LOE Chart (Lower is better)
    this.loeChartData = {
      labels: models,
      datasets: [{
        label: 'LOE (Avg)',
        data: this.averagedMetrics.map(m => m.metrics.loe),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // LPIPS Chart (Lower is better)
    this.lpipsChartData = {
      labels: models,
      datasets: [{
        label: 'LPIPS (Avg)',
        data: this.averagedMetrics.map(m => m.metrics.lpips),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // Delta E76 vs Original Chart (Lower is better)
    this.deltaE76OriginalChartData = {
      labels: models,
      datasets: [{
        label: 'Delta E76 vs Original (Avg Mean)',
        data: this.averagedMetrics.map(m => m.metrics.delta_e76_vs_original.mean),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // Delta E76 vs Reference Chart (Lower is better)
    this.deltaE76ReferenceChartData = {
      labels: models,
      datasets: [{
        label: 'Delta E76 vs Reference (Avg Mean)',
        data: this.averagedMetrics.map(m => m.metrics.delta_e76_vs_reference.mean),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // CIEDE2000 vs Original Chart (Lower is better)
    this.ciede2000OriginalChartData = {
      labels: models,
      datasets: [{
        label: 'CIEDE2000 vs Original (Avg Mean)',
        data: this.averagedMetrics.map(m => m.metrics.ciede2000_vs_original.mean),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // CIEDE2000 vs Reference Chart (Lower is better)
    this.ciede2000ReferenceChartData = {
      labels: models,
      datasets: [{
        label: 'CIEDE2000 vs Reference (Avg Mean)',
        data: this.averagedMetrics.map(m => m.metrics.ciede2000_vs_reference.mean),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // Angular Error vs Original Chart (Lower is better)
    this.angularErrorOriginalChartData = {
      labels: models,
      datasets: [{
        label: 'Angular Error vs Original (Avg Mean)',
        data: this.averagedMetrics.map(m => m.metrics.angular_error_vs_original.mean),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // Angular Error vs Reference Chart (Lower is better)
    this.angularErrorReferenceChartData = {
      labels: models,
      datasets: [{
        label: 'Angular Error vs Reference (Avg Mean)',
        data: this.averagedMetrics.map(m => m.metrics.angular_error_vs_reference.mean),
        backgroundColor: chartColors,
        borderColor: borderColors,
        borderWidth: 1
      }]
    };

    // Helper for Lower is Better: min / val (Efficiency relative to best observed)
    // If val is 0 (perfect), Score is 1. If val > 0, Score = min / val.
    // This ensures that the best model (== min) always gets 1.0 (Full Radar).
    // And worse models get < 1.0.
    const normalizeLowerBetter = (val: number, min: number) => {
        if (val <= 0) return 1; // 0 error is perfect score
        if (min === 0) return 0; // If best is 0, and current is > 0, score is 0
        return min / val;
    };

    // ============================================
    // 1️⃣ Area Chart - Higher is Better (PSNR & SSIM)
    // ============================================
    const areaDatasets = this.averagedMetrics.map((am, index) => {
        const color = baseColors[index % baseColors.length];
        const borderColor = color.replace('0.7', '1');
        const bgColor = color.replace('0.7', '0.3');

        return {
            label: am.model,
            data: [am.metrics.psnr, am.metrics.ssim],
            borderColor: borderColor,
            backgroundColor: bgColor,
            fill: true,
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });

    this.higherBetterAreaChartData = {
      labels: ['PSNR', 'SSIM'],
      datasets: areaDatasets
    };

    // ============================================
    // 2️⃣ Radar Chart - Image Quality (4 metrics)
    // ============================================
    const minValuesQuality = {
      niqe: Math.min(...this.averagedMetrics.map(m => m.metrics.niqe)),
      brisque: Math.min(...this.averagedMetrics.map(m => m.metrics.brisque)),
      loe: Math.min(...this.averagedMetrics.map(m => m.metrics.loe)),
      lpips: Math.min(...this.averagedMetrics.map(m => m.metrics.lpips))
    };

    const radarQualityDatasets = this.averagedMetrics.map((am, index) => {
        const color = baseColors[index % baseColors.length];
        const borderColor = color.replace('0.7', '1');
        const bgColor = color.replace('0.7', '0.2');

        return {
            label: am.model,
            data: [
                normalizeLowerBetter(am.metrics.niqe, minValuesQuality.niqe),
                normalizeLowerBetter(am.metrics.brisque, minValuesQuality.brisque),
                normalizeLowerBetter(am.metrics.loe, minValuesQuality.loe),
                normalizeLowerBetter(am.metrics.lpips, minValuesQuality.lpips)
            ],
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: 2
        };
    });

    this.radarChartData = {
      labels: ['NIQE ↓', 'BRISQUE ↓', 'LOE ↓', 'LPIPS ↓'],
      datasets: radarQualityDatasets
    };

    // ============================================
    // 3️⃣ Radar Chart - Color Accuracy (vs Original)
    // ============================================
    const minValuesColorOriginal = {
      deltaE: Math.min(...this.averagedMetrics.map(m => m.metrics.delta_e76_vs_original.mean)),
      ciede2000: Math.min(...this.averagedMetrics.map(m => m.metrics.ciede2000_vs_original.mean)),
      angularError: Math.min(...this.averagedMetrics.map(m => m.metrics.angular_error_vs_original.mean))
    };

    const radarColorOriginalDatasets = this.averagedMetrics.map((am, index) => {
        const color = baseColors[index % baseColors.length];
        const borderColor = color.replace('0.7', '1');
        const bgColor = color.replace('0.7', '0.2');

        return {
            label: am.model,
            data: [
                normalizeLowerBetter(am.metrics.delta_e76_vs_original.mean, minValuesColorOriginal.deltaE),
                normalizeLowerBetter(am.metrics.ciede2000_vs_original.mean, minValuesColorOriginal.ciede2000),
                normalizeLowerBetter(am.metrics.angular_error_vs_original.mean, minValuesColorOriginal.angularError)
            ],
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: 2
        };
    });

    this.radarColorOriginalChartData = {
      labels: ['Delta E ↓', 'CIEDE2000 ↓', 'Angular Error ↓'],
      datasets: radarColorOriginalDatasets
    };

    // ============================================
    // 4️⃣ Radar Chart - Color Accuracy (vs Reference)
    // ============================================
    const minValuesColorReference = {
      deltaE: Math.min(...this.averagedMetrics.map(m => m.metrics.delta_e76_vs_reference.mean)),
      ciede2000: Math.min(...this.averagedMetrics.map(m => m.metrics.ciede2000_vs_reference.mean)),
      angularError: Math.min(...this.averagedMetrics.map(m => m.metrics.angular_error_vs_reference.mean))
    };

    const radarColorReferenceDatasets = this.averagedMetrics.map((am, index) => {
        const color = baseColors[index % baseColors.length];
        const borderColor = color.replace('0.7', '1');
        const bgColor = color.replace('0.7', '0.2');

        return {
            label: am.model,
            data: [
                normalizeLowerBetter(am.metrics.delta_e76_vs_reference.mean, minValuesColorReference.deltaE),
                normalizeLowerBetter(am.metrics.ciede2000_vs_reference.mean, minValuesColorReference.ciede2000),
                normalizeLowerBetter(am.metrics.angular_error_vs_reference.mean, minValuesColorReference.angularError)
            ],
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: 2
        };
    });

    this.radarColorReferenceChartData = {
      labels: ['Delta E ↓', 'CIEDE2000 ↓', 'Angular Error ↓'],
      datasets: radarColorReferenceDatasets
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

  /**
   * Export a single chart as PNG image
   * @param chartElement The chart canvas element
   * @param filename The filename for the downloaded image
   */
  exportChart(chartElement: any, filename: string): void {
    if (!chartElement || !chartElement.chart) {
      console.error('Chart not found');
      return;
    }

    try {
      const chart = chartElement.chart;
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.download = `${filename}.png`;
      link.href = url;
      link.click();
    } catch (error) {
      console.error('Error exporting chart:', error);
    }
  }

  /**
   * Export all charts as PNG images
   */
  exportAllCharts(): void {
    // Get all chart canvas elements
    const charts = document.querySelectorAll('p-chart canvas');
    const chartNames = [
      'area-higher-is-better',
      'radar-image-quality',
      'radar-color-original',
      'radar-color-reference',
      'psnr-comparison',
      'ssim-comparison',
      'niqe-comparison',
      'brisque-comparison',
      'loe-comparison',
      'lpips-comparison',
      'delta-e76-original',
      'delta-e76-reference',
      'ciede2000-original',
      'ciede2000-reference',
      'angular-error-original',
      'angular-error-reference'
    ];

    charts.forEach((canvas: any, index: number) => {
      setTimeout(() => {
        try {
          const url = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${chartNames[index] || `chart-${index + 1}`}.png`;
          link.href = url;
          link.click();
        } catch (error) {
          console.error(`Error exporting chart ${index}:`, error);
        }
      }, index * 200); // Delay each download to avoid browser blocking
    });
  }
}
