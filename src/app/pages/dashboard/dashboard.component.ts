import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
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
    ButtonModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  metricsData: ImageMetric[] = [];
  psnrChartData: ChartData<'bar'> | undefined;
  deltaEChartData: ChartData<'bar'> | undefined;
  chartOptions: ChartOptions<'bar'> | undefined;

  constructor(private messageService: MessageService) {}

  onFileUpload(event: FileSelectEvent): void {
    const files = Array.from(event.files || []);
    if (files && files.length > 0) {
      const filePromises = files.map(file => this.readFile(file));
      
      Promise.all(filePromises)
        .then(results => {
          const allMetricsData: ImageMetric[] = [];
          let hasError = false;
          
          results.forEach((result) => {
            if (result.success && result.data) {
              allMetricsData.push(...result.data);
            } else {
              hasError = true;
            }
          });
          
          if (allMetricsData.length > 0) {
            this.metricsData = allMetricsData;
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
  }

  private readFile(file: File): Promise<{ success: boolean; data?: ImageMetric[]; error?: string }> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const jsonData = JSON.parse(result);
            const images = jsonData.images || [];
            resolve({ success: true, data: images });
          } else {
            resolve({ success: false, error: 'Invalid file content' });
          }
        } catch (error) {
          console.error(`Error parsing JSON file ${file.name}:`, error);
          resolve({ success: false, error: (error as Error).message });
        }
      };
      
      reader.onerror = () => {
        resolve({ success: false, error: 'Failed to read file' });
      };
      
      reader.readAsText(file);
    });
  }

  prepareChartData(): void {
    if (this.metricsData.length === 0) return;

    // Group data by method
    const methodsMap = new Map<string, ImageMetric[]>();
    this.metricsData.forEach(metric => {
      if (!methodsMap.has(metric.method)) {
        methodsMap.set(metric.method, []);
      }
      const methodMetrics = methodsMap.get(metric.method);
      if (methodMetrics) {
        methodMetrics.push(metric);
      }
    });

    const methods = Array.from(methodsMap.keys());
    const imageNames = [...new Set(this.metricsData.map(m => m.imageName))];

    // PSNR Chart Data (Higher is better)
    const psnrDatasets = methods.map((method, index) => {
      const data = imageNames.map(imageName => {
        const metric = this.findMetric(imageName, method);
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
        const metric = this.findMetric(imageName, method);
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

  private findMetric(imageName: string, method: string): ImageMetric | undefined {
    return this.metricsData.find(m => m.imageName === imageName && m.method === method);
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
