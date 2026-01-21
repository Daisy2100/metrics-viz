import { Component } from '@angular/core';

@Component({
  selector: 'app-news-company',
  standalone: true,
  imports: [],
  template: `
    <div class="news-company-container">
      <h1>公司動態</h1>
      <p>這裡顯示公司相關的最新動態和消息。</p>
    </div>
  `,
  styleUrl: './news-company.component.scss'
})
export class NewsCompanyComponent {

}
