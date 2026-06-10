import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalhesConsultaPage } from './detalhes-consulta.page';

const routes: Routes = [
  {
    path: '',
    component: DetalhesConsultaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalhesConsultaPageRoutingModule {}
