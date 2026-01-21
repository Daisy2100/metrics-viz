import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit {
  hasActiveChildRoute = false;

  constructor(private router: Router) {}

  ngOnInit() {
    // 監聽路由變化來判斷是否有活動的子路由
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.hasActiveChildRoute = event.url.includes('/news/') && event.url !== '/news';
    });

    // 初始檢查
    this.hasActiveChildRoute = this.router.url.includes('/news/') && this.router.url !== '/news';
  }
}
