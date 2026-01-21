import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface NavigationItem {
  id: string;
  displayName: string;
  path: string;
  order?: number;
  isActive?: boolean;
  children?: NavigationItem[];
  hasChildren?: boolean;
  parentId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor() { }
  /**
   * 取得導航選單項目
   * @returns Observable<NavigationItem[]>
   */
  getNavigationItems(): Observable<NavigationItem[]> {
    // 直接回傳預設的導航項目
    return of(this.getDefaultNavigationItems());
  }  /**
   * 取得預設的導航項目
   * @returns NavigationItem[]
   */
  getDefaultNavigationItems(): NavigationItem[] {
    return [
      {
        id: 'home',
        displayName: '首頁',
        path: '/',
        order: 0
      },
      {
        id: 'about',
        displayName: '關於我們',
        path: '/about',
        order: 1
      },
      {
        id: 'news',
        displayName: '最新消息',
        path: '/news',
        order: 2,
        hasChildren: true,
        children: [
          {
            id: 'news-company',
            displayName: '公司動態',
            path: '/news/company',
            order: 0,
            parentId: 'news'
          },
          {
            id: 'news-product',
            displayName: '產品資訊',
            path: '/news/product',
            order: 1,
            parentId: 'news'
          },
          {
            id: 'news-industry',
            displayName: '行業新聞',
            path: '/news/industry',
            order: 2,
            parentId: 'news'
          },
          {
            id: 'news-company',
            displayName: '公司動態',
            path: '/news/company',
            order: 0,
            parentId: 'news'
          },
          {
            id: 'news-product',
            displayName: '產品資訊',
            path: '/news/product',
            order: 1,
            parentId: 'news'
          },
          {
            id: 'news-industry',
            displayName: '行業新聞',
            path: '/news/industry',
            order: 2,
            parentId: 'news'
          },
          {
            id: 'news-company',
            displayName: '公司動態',
            path: '/news/company',
            order: 0,
            parentId: 'news'
          },
          {
            id: 'news-product',
            displayName: '產品資訊',
            path: '/news/product',
            order: 1,
            parentId: 'news'
          },
          {
            id: 'news-industry',
            displayName: '行業新聞',
            path: '/news/industry',
            order: 2,
            parentId: 'news'
          }
        ]
      },
      {
        id: 'contact',
        displayName: '聯絡我們',
        path: '/contact',
        order: 3
      }
    ];
  }

  /**
   * 根據順序排序導航項目
   * @param items NavigationItem[]
   * @returns NavigationItem[]
   */
  sortNavigationItems(items: NavigationItem[]): NavigationItem[] {
    return items.sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  /**
   * 檢查導航項目是否有子項目
   * @param item NavigationItem
   * @returns boolean
   */
  hasChildren(item: NavigationItem): boolean {
    return !!(item.children && item.children.length > 0);
  }

  /**
   * 根據父項目ID取得子項目
   * @param parentId string
   * @param items NavigationItem[]
   * @returns NavigationItem[]
   */
  getChildrenByParentId(parentId: string, items: NavigationItem[] = this.getDefaultNavigationItems()): NavigationItem[] {
    const parent = items.find(item => item.id === parentId);
    return parent?.children ? this.sortNavigationItems(parent.children) : [];
  }

  /**
   * 扁平化導航項目（包含子項目）
   * @param items NavigationItem[]
   * @returns NavigationItem[]
   */
  flattenNavigationItems(items: NavigationItem[]): NavigationItem[] {
    const flattened: NavigationItem[] = [];

    items.forEach(item => {
      flattened.push(item);
      if (item.children && item.children.length > 0) {
        flattened.push(...this.flattenNavigationItems(item.children));
      }
    });

    return flattened;
  }

  /**
   * 根據路徑找到對應的導航項目
   * @param path string
   * @param items NavigationItem[]
   * @returns NavigationItem | null
   */
  findItemByPath(path: string, items: NavigationItem[] = this.getDefaultNavigationItems()): NavigationItem | null {
    const allItems = this.flattenNavigationItems(items);
    return allItems.find(item => item.path === path) || null;
  }

  /**
   * 設定導航項目的活動狀態
   * @param activePath string
   * @param items NavigationItem[]
   * @returns NavigationItem[]
   */
  setActiveStates(activePath: string, items: NavigationItem[]): NavigationItem[] {
    return items.map(item => {
      const updatedItem = { ...item };

      // 檢查當前項目是否活動
      updatedItem.isActive = item.path === activePath;

      // 如果有子項目，遞歸處理
      if (item.children && item.children.length > 0) {
        updatedItem.children = this.setActiveStates(activePath, item.children);

        // 如果任何子項目是活動的，父項目也應該標記為活動
        const hasActiveChild = updatedItem.children.some(child => child.isActive);
        if (hasActiveChild) {
          updatedItem.isActive = true;
        }
      }

      return updatedItem;
    });
  }
}
