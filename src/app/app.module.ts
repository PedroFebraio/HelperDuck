import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

// Importação do SDK modular do Firebase
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore'
import { provideAuth, getAuth} from '@angular/fire/auth';
import { environment } from 'src/environments/environment';
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideFirebaseApp(()=> initializeApp(environment.firebaseConfig)),
    // Provisão do Firestore
    provideFirestore(()=> getFirestore()),
    provideAuth(()=> getAuth()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
