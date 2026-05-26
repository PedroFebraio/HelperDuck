import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PerfilPsicologoPage } from './perfil-psicologo.page';

const routes: Routes = [
  {
    path: '',
    component: PerfilPsicologoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PerfilPsicologoPageRoutingModule {}
