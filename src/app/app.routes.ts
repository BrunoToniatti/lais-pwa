import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AgendamentosComponent } from './pages/agendamentos/agendamentos.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { ServicesComponent } from './pages/services/services.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'agendamentos', component: AgendamentosComponent },
      { path: 'clientes', component: ClientesComponent },
      { path: 'perfil', component: PerfilComponent },
      { path: 'services', component: ServicesComponent }
    ]
  }
];
