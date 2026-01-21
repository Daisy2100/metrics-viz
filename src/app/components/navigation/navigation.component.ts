import { Component, OnInit, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarModule } from 'primeng/sidebar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { NavigationService, NavigationItem } from './navigation.service';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [RouterModule, SidebarModule, ButtonModule, MenuModule, CommonModule],
  templateUrl: './navigation.component.html',
  styleUrl: './navigation.component.scss'
})
export class NavigationComponent implements OnInit {
  @Input() logoText: string = 'DEMO'; // 可自定義的 Logo 文字

  sidebarVisible: boolean = false;
  navigationItems: NavigationItem[] = [];
  isLoading: boolean = true;

  constructor(private navigationService: NavigationService) {}

  ngOnInit() {
    this.loadNavigationItems();
  }
  /**
   * 載入導航選單項目
   */
  loadNavigationItems() {
    this.isLoading = true;
    this.navigationService.getNavigationItems().subscribe({
      next: (items) => {
        this.navigationItems = this.navigationService.sortNavigationItems(items);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load navigation items:', error);
        // 發生錯誤時使用預設項目
        this.navigationItems = this.navigationService.sortNavigationItems(
          this.navigationService.getDefaultNavigationItems()
        );
        this.isLoading = false;
      }
    });
  }

  /**
   * 重新載入導航選單項目
   */
  reloadNavigationItems() {
    this.loadNavigationItems();
  }

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  closeSidebar() {
    this.sidebarVisible = false;
  }

  /**
   * 追蹤函數，用於 *ngFor 優化
   */
  trackByNavItem(index: number, item: NavigationItem): string {
    return item.id;
  }

  /**
   * 檢查導航項目是否有子項目
   * @param item NavigationItem
   * @returns boolean
   */
  hasChildren(item: NavigationItem): boolean {
    return this.navigationService.hasChildren(item);
  }
}
