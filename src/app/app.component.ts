import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthServices } from './services/auth';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent
implements OnInit {

  usuario: any;

  psicologo: any;

  tipoConta = '';

  constructor(
    private router: Router,
    private toastCrtl: ToastController,
    private authServices: AuthServices,
  ) {}

  ngOnInit(){

    this.carregarUsuario();
  }

  ionViewWillEnter(){

    this.carregarUsuario();
  }

  carregarUsuario(){

    const usuario =
      localStorage.getItem('usuario');

    const psicologo =
      localStorage.getItem('psicologo');

    if(usuario){

      this.usuario =
        JSON.parse(usuario);

      this.tipoConta = 'usuario';
    }

    if(psicologo){

      this.psicologo =
        JSON.parse(psicologo);

      this.tipoConta = 'psicologo';
    }
  }
  async logout(){

    try {
    
      this.authServices.logout();

      localStorage.removeItem('usuario');

      localStorage.removeItem('psicologo');

      this.usuario = null;

      this.psicologo = null;

      this.tipoConta = '';

      this.presentToast('Deslogado com sucesso!', 'success')
      
      this.router.navigateByUrl('/home')    
    
    } catch (error) {
      
      
      this.presentToast('Erro desconhecido ao deslogar', 'danger')

    }
  }
  

  async presentToast(message: string, color: string = 'primary'){

    const toast = await this.toastCrtl.create({

      message,
      duration:2000,
      color
    });

    toast.present();
  }
}