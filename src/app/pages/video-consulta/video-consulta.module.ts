import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VideoConsultaPageRoutingModule } from './video-consulta-routing.module';

import { VideoConsultaPage } from './video-consulta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VideoConsultaPageRoutingModule
  ],
  declarations: [VideoConsultaPage]
})
export class VideoConsultaPageModule {}
