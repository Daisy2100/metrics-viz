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
  loeChartData: any;
  lpipsChartData: any;
  deltaE76OriginalChartData: any;
  deltaE76ReferenceChartData: any;
  ciede2000OriginalChartData: any;
  ciede2000ReferenceChartData: any;
  angularErrorOriginalChartData: any;
  angularErrorReferenceChartData: any;
  radarChartData: any;
  chartOptions: any;
  radarChartOptions: any;

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

    // LOE Chart (Lower is better)
    this.loeChartData = {
      labels: models,
      datasets: [{
        label: 'LOE',
        data: this.metrics.map(m => m.metrics.loe),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // LPIPS Chart (Lower is better)
    this.lpipsChartData = {
      labels: models,
      datasets: [{
        label: 'LPIPS',
        data: this.metrics.map(m => m.metrics.lpips),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // Delta E76 vs Original Chart (Lower is better)
    this.deltaE76OriginalChartData = {
      labels: models,
      datasets: [{
        label: 'Delta E76 vs Original (Mean)',
        data: this.metrics.map(m => m.metrics.delta_e76_vs_original.mean),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // Delta E76 vs Reference Chart (Lower is better)
    this.deltaE76ReferenceChartData = {
      labels: models,
      datasets: [{
        label: 'Delta E76 vs Reference (Mean)',
        data: this.metrics.map(m => m.metrics.delta_e76_vs_reference.mean),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // CIEDE2000 vs Original Chart (Lower is better)
    this.ciede2000OriginalChartData = {
      labels: models,
      datasets: [{
        label: 'CIEDE2000 vs Original (Mean)',
        data: this.metrics.map(m => m.metrics.ciede2000_vs_original.mean),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // CIEDE2000 vs Reference Chart (Lower is better)
    this.ciede2000ReferenceChartData = {
      labels: models,
      datasets: [{
        label: 'CIEDE2000 vs Reference (Mean)',
        data: this.metrics.map(m => m.metrics.ciede2000_vs_reference.mean),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // Angular Error vs Original Chart (Lower is better)
    this.angularErrorOriginalChartData = {
      labels: models,
      datasets: [{
        label: 'Angular Error vs Original (Mean)',
        data: this.metrics.map(m => m.metrics.angular_error_vs_original.mean),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // Angular Error vs Reference Chart (Lower is better)
    this.angularErrorReferenceChartData = {
      labels: models,
      datasets: [{
        label: 'Angular Error vs Reference (Mean)',
        data: this.metrics.map(m => m.metrics.angular_error_vs_reference.mean),
        backgroundColor: colors,
        borderColor: colors.map(c => c.replace('0.7', '1')),
        borderWidth: 1
      }]
    };

    // Radar Chart - Overall Capability Comparison
    // Normalize metrics to 0-1 scale for radar chart
    const pwgcm = this.metrics.find(m => m.model === 'PWGCM');
    const hsv = this.metrics.find(m => m.model === 'HSV_Improve');

    if (pwgcm && hsv) {
      // For "higher is better" metrics, use direct normalization
      // For "lower is better" metrics, invert the scale (1 - normalized value)
      const maxPSNR = Math.max(pwgcm.metrics.psnr, hsv.metrics.psnr);
      const maxSSIM = 1; // SSIM max is 1
      
      // For lower is better metrics, we'll use inverse normalization
      const maxNIQE = Math.max(pwgcm.metrics.niqe, hsv.metrics.niqe);
      const maxBRISQUE = Math.max(pwgcm.metrics.brisque, hsv.metrics.brisque);
      const maxLOE = Math.max(pwgcm.metrics.loe, hsv.metrics.loe);
      const maxLPIPS = Math.max(pwgcm.metrics.lpips, hsv.metrics.lpips);
      const maxDeltaE = Math.max(pwgcm.metrics.delta_e76_vs_original.mean, hsv.metrics.delta_e76_vs_original.mean);
      const maxAngularError = Math.max(pwgcm.metrics.angular_error_vs_original.mean, hsv.metrics.angular_error_vs_original.mean);

      this.radarChartData = {
        labels: ['PSNR ↑', 'SSIM ↑', 'NIQE ↓', 'BRISQUE ↓', 'LOE ↓', 'LPIPS ↓', 'Delta E ↓', 'Angular Error ↓'],
        datasets: [
          {
            label: 'PWGCM',
            data: [
              pwgcm.metrics.psnr / maxPSNR,
              pwgcm.metrics.ssim / maxSSIM,
              1 - (pwgcm.metrics.niqe / maxNIQE),
              1 - (pwgcm.metrics.brisque / maxBRISQUE),
              1 - (pwgcm.metrics.loe / maxLOE),
              1 - (pwgcm.metrics.lpips / maxLPIPS),
              1 - (pwgcm.metrics.delta_e76_vs_original.mean / maxDeltaE),
              1 - (pwgcm.metrics.angular_error_vs_original.mean / maxAngularError)
            ],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2
          },
          {
            label: 'HSV_Improve',
            data: [
              hsv.metrics.psnr / maxPSNR,
              hsv.metrics.ssim / maxSSIM,
              1 - (hsv.metrics.niqe / maxNIQE),
              1 - (hsv.metrics.brisque / maxBRISQUE),
              1 - (hsv.metrics.loe / maxLOE),
              1 - (hsv.metrics.lpips / maxLPIPS),
              1 - (hsv.metrics.delta_e76_vs_original.mean / maxDeltaE),
              1 - (hsv.metrics.angular_error_vs_original.mean / maxAngularError)
            ],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2
          }
        ]
      };
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
}
