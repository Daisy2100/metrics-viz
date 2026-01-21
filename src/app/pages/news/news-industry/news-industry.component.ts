import { Component } from '@angular/core';

@Component({
  selector: 'app-news-industry',
  standalone: true,
  imports: [],
  template: `
    <div class="news-industry-container">
      <h1>行業新聞</h1>
      <p>這裡顯示行業相關的最新新聞和趨勢。</p>
    </div>
  `,
  styleUrl: './news-industry.component.scss'
})
export class NewsIndustryComponent {

}
