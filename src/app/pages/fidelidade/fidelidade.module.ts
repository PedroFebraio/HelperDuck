import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FidelidadePageRoutingModule } from './fidelidade-routing.module';

import { FidelidadePage } from './fidelidade.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FidelidadePageRoutingModule
  ],
  declarations: [FidelidadePage]
})
export class FidelidadePageModule {}
