import { Routes } from '@angular/router';
import { HomePage } from './pages/home';

export const routes: Routes = [
  { path: '', component: HomePage, title: 'APRILab 先進產品實現與互動實驗室' },
  { path: 'members', loadComponent: () => import('./pages/members').then((m) => m.MembersPage), title: '實驗室成員 | APRILab' },
  { path: '**', redirectTo: '' },
];
