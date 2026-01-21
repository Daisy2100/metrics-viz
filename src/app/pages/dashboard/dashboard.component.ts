import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ChartData, ChartOptions } from 'chart.js';
import { ImageMetric } from '../../models/image-metrics.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    FileUploadModule,
    ChartModule,
    TableModule,
    CardModule,
    ButtonModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  metricsData: ImageMetric[] = [];
  psnrChartData: ChartData<'bar'> | undefined;
  deltaEChartData: ChartData<'bar'> | undefined;
  chartOptions: ChartOptions<'bar'> | undefined;

  onFileUpload(event: FileSelectEvent): void {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const jsonData = JSON.parse(result);
            this.metricsData = jsonData.images || [];
            this.prepareChartData();
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error);
        }
      };
      reader.readAsText(file);
    }
  }

  prepareChartData(): void {
    if (this.metricsData.length === 0) return;

    // Group data by method
    const methodsMap = new Map<string, ImageMetric[]>();
    this.metricsData.forEach(metric => {
      if (!methodsMap.has(metric.method)) {
        methodsMap.set(metric.method, []);
      }
      methodsMap.get(metric.method)!.push(metric);
    });

    const methods = Array.from(methodsMap.keys());
    const imageNames = [...new Set(this.metricsData.map(m => m.imageName))];

    // PSNR Chart Data (Higher is better)
    const psnrDatasets = methods.map((method, index) => {
      const data = imageNames.map(imageName => {
        const metric = this.metricsData.find(m => m.imageName === imageName && m.method === method);
        return metric ? metric.psnr : 0;
      });
      return {
        label: method,
        data: data,
        backgroundColor: this.getChartColor(index)
      };
    });

    this.psnrChartData = {
      labels: imageNames,
      datasets: psnrDatasets
    };

    // DeltaE Chart Data (Lower is better)
    const deltaEDatasets = methods.map((method, index) => {
      const data = imageNames.map(imageName => {
        const metric = this.metricsData.find(m => m.imageName === imageName && m.method === method);
        return metric ? metric.deltaE : 0;
      });
      return {
        label: method,
        data: data,
        backgroundColor: this.getChartColor(index)
      };
    });

    this.deltaEChartData = {
      labels: imageNames,
      datasets: deltaEDatasets
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    };
  }

  getChartColor(index: number): string {
    const colors = [
      'rgba(59, 130, 246, 0.7)',  // Blue
      'rgba(16, 185, 129, 0.7)',  // Green
      'rgba(245, 158, 11, 0.7)',  // Amber
      'rgba(239, 68, 68, 0.7)',   // Red
      'rgba(139, 92, 246, 0.7)',  // Purple
      'rgba(236, 72, 153, 0.7)',  // Pink
    ];
    return colors[index % colors.length];
  }
}
