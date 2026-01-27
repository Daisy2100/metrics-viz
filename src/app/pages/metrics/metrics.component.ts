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
    psnr?: number;
    ssim?: number;
    niqe?: number;
    brisque?: number;
    loe?: number;
    lpips?: number;
    delta_e76_vs_original?: { mean: number };
    delta_e76_vs_reference?: { mean: number };
    ciede2000_vs_original?: { mean: number };
    ciede2000_vs_reference?: { mean: number };
    angular_error_vs_original?: { mean: number };
    angular_error_vs_reference?: { mean: number };
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
    const files = Array.from(event.files || []) as File[];
    if (!files || files.length === 0) {
      return;
    }

    const filePromises = files.map(file => this.readFile(file));
    
    Promise.all(filePromises)
      .then(results => {
        const allMetrics: ImageMetric[] = [];
        let hasError = false;
        
        results.forEach((result) => {
          if (result.success && result.data) {
            allMetrics.push(...result.data);
          } else {
            hasError = true;
          }
        });
        
        if (allMetrics.length > 0) {
          // Append new data instead of replacing
          this.metrics = [...this.metrics, ...allMetrics];
          this.prepareChartData();
          
          if (!hasError) {
            this.messageService.add({ 
              severity: 'success', 
              summary: 'Success', 
              detail: `${files.length} file(s) uploaded successfully` 
            });
          } else {
            this.messageService.add({ 
              severity: 'warn', 
              summary: 'Partial Success', 
              detail: 'Some files were uploaded successfully, but some had errors' 
            });
          }
        } else if (hasError) {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: 'Failed to upload files. Please check the file format.' 
          });
        }
      })
      .catch(error => {
        console.error('Error processing files:', error);
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: 'An unexpected error occurred while processing files' 
        });
      });
  }

  private readFile(file: File): Promise<{ success: boolean; data?: ImageMetric[]; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e: any) => {
        try {
          const json = JSON.parse(e.target.result);
          if (Array.isArray(json)) {
            resolve({ success: true, data: json });
          } else {
            this.messageService.add({ 
              severity: 'error', 
              summary: 'Error', 
              detail: `Invalid JSON format in ${file.name}: Expected an array` 
            });
            resolve({ success: false, error: 'Invalid format' });
          }
        } catch (error) {
          this.messageService.add({ 
            severity: 'error', 
            summary: 'Error', 
            detail: `Error parsing ${file.name}` 
          });
          console.error('JSON parse error:', error);
          resolve({ success: false, error: (error as Error).message });
        }
      };
      
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' });
      };
      
      reader.readAsText(file);
    });
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

      // Helper function to safely average a metric
      const safeAverage = (getValue: (m: ImageMetric) => number | undefined): number | undefined => {
        const values = metricsList
          .map(getValue)
          .filter((v): v is number => v !== undefined && v !== null && !isNaN(v));
        
        if (values.length === 0) return undefined;
        return values.reduce((a, b) => a + b, 0) / values.length;
      };

      // Helper function to create mean metric object
      const createMeanMetric = (getValue: (m: ImageMetric) => number | undefined): { mean: number } | undefined => {
        const avg = safeAverage(getValue);
        return avg !== undefined ? { mean: avg } : undefined;
      };

      return {
        model,
        metrics: {
          psnr: safeAverage(m => m.metrics.psnr),
          ssim: safeAverage(m => m.metrics.ssim),
          niqe: safeAverage(m => m.metrics.niqe),
          brisque: safeAverage(m => m.metrics.brisque),
          loe: safeAverage(m => m.metrics.loe),
          lpips: safeAverage(m => m.metrics.lpips),
          delta_e76_vs_original: createMeanMetric(m => m.metrics.delta_e76_vs_original?.mean),
          delta_e76_vs_reference: createMeanMetric(m => m.metrics.delta_e76_vs_reference?.mean),
          ciede2000_vs_original: createMeanMetric(m => m.metrics.ciede2000_vs_original?.mean),
          ciede2000_vs_reference: createMeanMetric(m => m.metrics.ciede2000_vs_reference?.mean),
          angular_error_vs_original: createMeanMetric(m => m.metrics.angular_error_vs_original?.mean),
          angular_error_vs_reference: createMeanMetric(m => m.metrics.angular_error_vs_reference?.mean)
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

    // Helper function to check if any model has this metric
    const hasMetric = (getter: (m: AveragedMetric) => number | { mean: number } | undefined): boolean => {
      return this.averagedMetrics.some(m => {
        const val = getter(m);
        return val !== undefined && val !== null && (typeof val === 'number' ? !isNaN(val) : !isNaN(val.mean));
      });
    };

    // Helper function to get metric value safely
    const getMetricValue = (m: AveragedMetric, getter: (m: AveragedMetric) => number | { mean: number } | undefined): number | null => {
      const val = getter(m);
      if (val === undefined || val === null) return null;
      if (typeof val === 'number') return isNaN(val) ? null : val;
      return isNaN(val.mean) ? null : val.mean;
    };

    // PSNR Chart (Higher is better)
    if (hasMetric(m => m.metrics.psnr)) {
      this.psnrChartData = {
        labels: models,
        datasets: [{
          label: 'PSNR (Avg)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.psnr)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.psnrChartData = null;
    }

    // SSIM Chart (Higher is better)
    if (hasMetric(m => m.metrics.ssim)) {
      this.ssimChartData = {
        labels: models,
        datasets: [{
          label: 'SSIM (Avg)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.ssim)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.ssimChartData = null;
    }

    // NIQE Chart (Lower is better)
    if (hasMetric(m => m.metrics.niqe)) {
      this.niqeChartData = {
        labels: models,
        datasets: [{
          label: 'NIQE (Avg)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.niqe)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.niqeChartData = null;
    }

    // BRISQUE Chart (Lower is better)
    if (hasMetric(m => m.metrics.brisque)) {
      this.brisqueChartData = {
        labels: models,
        datasets: [{
          label: 'BRISQUE (Avg)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.brisque)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.brisqueChartData = null;
    }

    // LOE Chart (Lower is better)
    if (hasMetric(m => m.metrics.loe)) {
      this.loeChartData = {
        labels: models,
        datasets: [{
          label: 'LOE (Avg)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.loe)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.loeChartData = null;
    }

    // LPIPS Chart (Lower is better)
    if (hasMetric(m => m.metrics.lpips)) {
      this.lpipsChartData = {
        labels: models,
        datasets: [{
          label: 'LPIPS (Avg)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.lpips)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.lpipsChartData = null;
    }

    // Delta E76 vs Original Chart (Lower is better)
    if (hasMetric(m => m.metrics.delta_e76_vs_original)) {
      this.deltaE76OriginalChartData = {
        labels: models,
        datasets: [{
          label: 'Delta E76 vs Original (Avg Mean)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.delta_e76_vs_original)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.deltaE76OriginalChartData = null;
    }

    // Delta E76 vs Reference Chart (Lower is better)
    if (hasMetric(m => m.metrics.delta_e76_vs_reference)) {
      this.deltaE76ReferenceChartData = {
        labels: models,
        datasets: [{
          label: 'Delta E76 vs Reference (Avg Mean)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.delta_e76_vs_reference)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.deltaE76ReferenceChartData = null;
    }

    // CIEDE2000 vs Original Chart (Lower is better)
    if (hasMetric(m => m.metrics.ciede2000_vs_original)) {
      this.ciede2000OriginalChartData = {
        labels: models,
        datasets: [{
          label: 'CIEDE2000 vs Original (Avg Mean)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.ciede2000_vs_original)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.ciede2000OriginalChartData = null;
    }

    // CIEDE2000 vs Reference Chart (Lower is better)
    if (hasMetric(m => m.metrics.ciede2000_vs_reference)) {
      this.ciede2000ReferenceChartData = {
        labels: models,
        datasets: [{
          label: 'CIEDE2000 vs Reference (Avg Mean)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.ciede2000_vs_reference)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.ciede2000ReferenceChartData = null;
    }

    // Angular Error vs Original Chart (Lower is better)
    if (hasMetric(m => m.metrics.angular_error_vs_original)) {
      this.angularErrorOriginalChartData = {
        labels: models,
        datasets: [{
          label: 'Angular Error vs Original (Avg Mean)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.angular_error_vs_original)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.angularErrorOriginalChartData = null;
    }

    // Angular Error vs Reference Chart (Lower is better)
    if (hasMetric(m => m.metrics.angular_error_vs_reference)) {
      this.angularErrorReferenceChartData = {
        labels: models,
        datasets: [{
          label: 'Angular Error vs Reference (Avg Mean)',
          data: this.averagedMetrics.map(m => getMetricValue(m, m => m.metrics.angular_error_vs_reference)),
          backgroundColor: chartColors,
          borderColor: borderColors,
          borderWidth: 1
        }]
      };
    } else {
      this.angularErrorReferenceChartData = null;
    }

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
    const hasPsnrOrSsim = hasMetric(m => m.metrics.psnr) || hasMetric(m => m.metrics.ssim);
    if (hasPsnrOrSsim) {
      const labels: string[] = [];
      if (hasMetric(m => m.metrics.psnr)) labels.push('PSNR');
      if (hasMetric(m => m.metrics.ssim)) labels.push('SSIM');

      const areaDatasets = this.averagedMetrics.map((am, index) => {
        const color = baseColors[index % baseColors.length];
        const borderColor = color.replace('0.7', '1');
        const bgColor = color.replace('0.7', '0.3');

        const data: (number | null)[] = [];
        if (hasMetric(m => m.metrics.psnr)) data.push(getMetricValue(am, m => m.metrics.psnr));
        if (hasMetric(m => m.metrics.ssim)) data.push(getMetricValue(am, m => m.metrics.ssim));

        return {
            label: am.model,
            data: data,
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
        labels: labels,
        datasets: areaDatasets
      };
    } else {
      this.higherBetterAreaChartData = null;
    }

    // ============================================
    // 2️⃣ Radar Chart - Image Quality (4 metrics)
    // ============================================
    const qualityMetrics = ['niqe', 'brisque', 'loe', 'lpips'] as const;
    const hasQualityMetrics = qualityMetrics.some(metric => 
      hasMetric(m => m.metrics[metric])
    );

    if (hasQualityMetrics) {
      // Build labels and data dynamically based on available metrics
      const availableQualityMetrics = qualityMetrics.filter(metric => 
        hasMetric(m => m.metrics[metric])
      );
      
      const qualityLabels = availableQualityMetrics.map(metric => {
        const labelMap: Record<string, string> = {
          'niqe': 'NIQE ↓',
          'brisque': 'BRISQUE ↓',
          'loe': 'LOE ↓',
          'lpips': 'LPIPS ↓'
        };
        return labelMap[metric];
      });

      const minValuesQuality: Record<string, number> = {};
      availableQualityMetrics.forEach(metric => {
        const values = this.averagedMetrics
          .map(m => getMetricValue(m, m => m.metrics[metric]))
          .filter((v): v is number => v !== null);
        minValuesQuality[metric] = values.length > 0 ? Math.min(...values) : 0;
      });

      const radarQualityDatasets = this.averagedMetrics.map((am, index) => {
        const color = baseColors[index % baseColors.length];
        const borderColor = color.replace('0.7', '1');
        const bgColor = color.replace('0.7', '0.2');

        const data = availableQualityMetrics.map(metric => {
          const val = getMetricValue(am, m => m.metrics[metric]);
          return val !== null ? normalizeLowerBetter(val, minValuesQuality[metric]) : 0;
        });

        return {
            label: am.model,
            data: data,
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: 2
        };
      });

      this.radarChartData = {
        labels: qualityLabels,
        datasets: radarQualityDatasets
      };
    } else {
      this.radarChartData = null;
    }

    // ============================================
    // 3️⃣ Radar Chart - Color Accuracy (vs Original)
    // ============================================
    const colorOriginalMetrics = ['delta_e76_vs_original', 'ciede2000_vs_original', 'angular_error_vs_original'] as const;
    const hasColorOriginalMetrics = colorOriginalMetrics.some(metric => 
      hasMetric(m => m.metrics[metric])
    );

    if (hasColorOriginalMetrics) {
      const availableColorOriginalMetrics = colorOriginalMetrics.filter(metric => 
        hasMetric(m => m.metrics[metric])
      );
      
      const colorOriginalLabels = availableColorOriginalMetrics.map(metric => {
        const labelMap: Record<string, string> = {
          'delta_e76_vs_original': 'Delta E ↓',
          'ciede2000_vs_original': 'CIEDE2000 ↓',
          'angular_error_vs_original': 'Angular Error ↓'
        };
        return labelMap[metric];
      });

      const minValuesColorOriginal: Record<string, number> = {};
      availableColorOriginalMetrics.forEach(metric => {
        const values = this.averagedMetrics
          .map(m => getMetricValue(m, m => m.metrics[metric]))
          .filter((v): v is number => v !== null);
        minValuesColorOriginal[metric] = values.length > 0 ? Math.min(...values) : 0;
      });

      const radarColorOriginalDatasets = this.averagedMetrics.map((am, index) => {
        const color = baseColors[index % baseColors.length];
        const borderColor = color.replace('0.7', '1');
        const bgColor = color.replace('0.7', '0.2');

        const data = availableColorOriginalMetrics.map(metric => {
          const val = getMetricValue(am, m => m.metrics[metric]);
          return val !== null ? normalizeLowerBetter(val, minValuesColorOriginal[metric]) : 0;
        });

        return {
            label: am.model,
            data: data,
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: 2
        };
      });

      this.radarColorOriginalChartData = {
        labels: colorOriginalLabels,
        datasets: radarColorOriginalDatasets
      };
    } else {
      this.radarColorOriginalChartData = null;
    }

    // ============================================
    // 4️⃣ Radar Chart - Color Accuracy (vs Reference)
    // ============================================
    const colorReferenceMetrics = ['delta_e76_vs_reference', 'ciede2000_vs_reference', 'angular_error_vs_reference'] as const;
    const hasColorReferenceMetrics = colorReferenceMetrics.some(metric => 
      hasMetric(m => m.metrics[metric])
    );

    if (hasColorReferenceMetrics) {
      const availableColorReferenceMetrics = colorReferenceMetrics.filter(metric => 
        hasMetric(m => m.metrics[metric])
      );
      
      const colorReferenceLabels = availableColorReferenceMetrics.map(metric => {
        const labelMap: Record<string, string> = {
          'delta_e76_vs_reference': 'Delta E ↓',
          'ciede2000_vs_reference': 'CIEDE2000 ↓',
          'angular_error_vs_reference': 'Angular Error ↓'
        };
        return labelMap[metric];
      });

      const minValuesColorReference: Record<string, number> = {};
      availableColorReferenceMetrics.forEach(metric => {
        const values = this.averagedMetrics
          .map(m => getMetricValue(m, m => m.metrics[metric]))
          .filter((v): v is number => v !== null);
        minValuesColorReference[metric] = values.length > 0 ? Math.min(...values) : 0;
      });

      const radarColorReferenceDatasets = this.averagedMetrics.map((am, index) => {
        const color = baseColors[index % baseColors.length];
        const borderColor = color.replace('0.7', '1');
        const bgColor = color.replace('0.7', '0.2');

        const data = availableColorReferenceMetrics.map(metric => {
          const val = getMetricValue(am, m => m.metrics[metric]);
          return val !== null ? normalizeLowerBetter(val, minValuesColorReference[metric]) : 0;
        });

        return {
            label: am.model,
            data: data,
            backgroundColor: bgColor,
            borderColor: borderColor,
            borderWidth: 2
        };
      });

      this.radarColorReferenceChartData = {
        labels: colorReferenceLabels,
        datasets: radarColorReferenceDatasets
      };
    } else {
      this.radarColorReferenceChartData = null;
    }

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
   * Check if any averaged metric has a specific field
   */
  hasMetricColumn(metricName: keyof AveragedMetric['metrics']): boolean {
    return this.averagedMetrics.some(m => {
      const val = m.metrics[metricName];
      return val !== undefined && val !== null && 
        (typeof val === 'number' ? !isNaN(val) : !isNaN(val.mean));
    });
  }

  /**
   * Format metric value for display in the table
   * @param value The metric value (number or object with mean property)
   * @returns Formatted string or 'N/A' if value is undefined
   */
  formatMetricValue(value: number | { mean: number } | undefined): string {
    if (value === undefined || value === null) return 'N/A';
    
    const numValue = typeof value === 'number' ? value : value.mean;
    
    if (isNaN(numValue)) return 'N/A';
    
    return numValue.toFixed(4);
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
