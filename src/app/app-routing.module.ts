import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'agendamento',
    loadChildren: () => import('./pages/agendamento/agendamento.module').then( m => m.AgendamentoPageModule)
  },
  {
    path: 'consulta',
    loadChildren: () => import('./pages/consulta/consulta.module').then( m => m.ConsultaPageModule)
  },
  {
    path: 'forum',
    loadChildren: () => import('./pages/forum/forum.module').then( m => m.ForumPageModule)
  },
  {
    path: 'pagamento',
    loadChildren: () => import('./pages/pagamento/pagamento.module').then( m => m.PagamentoPageModule)
  },
  {
    path: 'login-psicologo',
    loadChildren: () => import('./pagesPsico/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'register-psicologo',
    loadChildren: () => import('./pagesPsico/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'login-admin',
    loadChildren: () => import('./pagesAdmin/login-admin/login-admin.module').then( m => m.LoginAdminPageModule)
  },
  {
    path: 'dashboard-admin',
    loadChildren: () => import('./pagesAdmin/dashboard-admin/dashboard-admin.module').then( m => m.DashboardAdminPageModule)
  },
  {
    path: 'dashboard-psicologo',
    loadChildren: () => import('./pagesPsico/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'perfil-psicologo',
    loadChildren: () => import('./pagesPsico/perfil/perfil.module').then( m => m.PerfilPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
