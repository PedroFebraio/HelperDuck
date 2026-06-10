import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalhesConsultaPageRoutingModule } from './detalhes-consulta-routing.module';

import { DetalhesConsultaPage } from './detalhes-consulta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalhesConsultaPageRoutingModule
  ],
  declarations: [DetalhesConsultaPage]
})
export class DetalhesConsultaPageModule {}
