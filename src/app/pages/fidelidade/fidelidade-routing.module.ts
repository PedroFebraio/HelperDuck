import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FidelidadePage } from './fidelidade.page';

const routes: Routes = [
  {
    path: '',
    component: FidelidadePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FidelidadePageRoutingModule {}
