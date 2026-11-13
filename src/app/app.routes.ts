import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./layout/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'painel' },
      {
        path: 'painel',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'campanhas',
        loadComponent: () => import('./pages/campaigns/campaign-list.component').then((m) => m.CampaignListComponent),
      },
      {
        path: 'campanhas/nova',
        loadComponent: () => import('./pages/campaigns/campaign-form.component').then((m) => m.CampaignFormComponent),
      },
      {
        path: 'campanhas/:id',
        loadComponent: () => import('./pages/campaigns/campaign-form.component').then((m) => m.CampaignFormComponent),
      },
      {
        path: 'historico',
        loadComponent: () => import('./pages/audit/audit.component').then((m) => m.AuditComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
