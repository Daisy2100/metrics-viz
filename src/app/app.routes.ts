import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { NewsComponent } from './pages/news/news.component';
import { ContactComponent } from './pages/contact/contact.component';
import { NewsCompanyComponent } from './pages/news/news-company/news-company.component';
import { NewsProductComponent } from './pages/news/news-product/news-product.component';
import { NewsIndustryComponent } from './pages/news/news-industry/news-industry.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    {
        path: 'news',
        component: NewsComponent,
        children: [
            { path: 'company', component: NewsCompanyComponent },
            { path: 'product', component: NewsProductComponent },
            { path: 'industry', component: NewsIndustryComponent }
        ]
    },
    { path: 'contact', component: ContactComponent },
];
