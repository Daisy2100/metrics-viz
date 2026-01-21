import { Component } from '@angular/core';

@Component({
  selector: 'app-news-product',
  standalone: true,
  imports: [],
  template: `
    <div class="news-product-container">
      <h1>產品資訊</h1>
      <p>這裡顯示產品相關的最新資訊和更新。</p>
    </div>
  `,
  styleUrl: './news-product.component.scss'
})
export class NewsProductComponent {

}
