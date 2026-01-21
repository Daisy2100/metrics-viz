import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface ContactInfo {
  address?: string;
  phone?: string;
  email?: string;
}

interface LinkItem {
  label: string;
  path: string;
}

interface SocialLink {
  label: string;
  url: string;
  icon: string;
}

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  companyName = '您的公司名稱';
  companyDescription = '我們致力於提供優質的服務，為客戶創造最大價值，成為業界的領導品牌。';

  contactInfo: ContactInfo = {
    address: '台北市信義區松仁路100號',
    phone: '+886-2-1234-5678',
    email: 'contact@yourcompany.com'
  };

  quickLinks: LinkItem[] = [
    { label: '首頁', path: '/' },
    { label: '關於我們', path: '/about' },
    { label: '服務項目', path: '/services' },
    { label: '最新消息', path: '/news' },
    { label: '聯絡我們', path: '/contact' }
  ];

  services: LinkItem[] = [
    { label: '產品開發', path: '/services/development' },
    { label: '技術諮詢', path: '/services/consulting' },
    { label: '維護支援', path: '/services/support' },
    { label: '訓練課程', path: '/services/training' }
  ];

  socialLinks: SocialLink[] = [
    { label: 'Facebook', url: 'https://facebook.com/yourcompany', icon: 'pi pi-facebook' },
    { label: 'Twitter', url: 'https://twitter.com/yourcompany', icon: 'pi pi-twitter' },
    { label: 'LinkedIn', url: 'https://linkedin.com/company/yourcompany', icon: 'pi pi-linkedin' },
    { label: 'Instagram', url: 'https://instagram.com/yourcompany', icon: 'pi pi-instagram' }
  ];

  get currentYear(): number {
    return new Date().getFullYear();
  }
}
