import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { PsicologoServices } from 'src/app/services/psicologo';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {

  email: string = '';
  senha: string = '';


  constructor(
    private router: Router,
    private toastController: ToastController,
    private loading: LoadingController,
    private psicologoServices: PsicologoServices
  ) { }

  ngOnInit() {
  }


  limparFormulario(){

    this.email = '';
    this.senha = ''
  }


  async login(){

    const load = await this.loading.create({

      message: 'Entrando...'
    });

    await load.present();

    try {

      await this.psicologoServices
      .loginPsicologo(
        this.email,
        this.senha
      );

      await load.dismiss();

      this.presentToast(
        'Login realizado!',
        'success'
      );

      this.router.navigateByUrl(
        '/dashboard-psicologo'
      );

    } catch(error: any){

      await load.dismiss();

      this.presentToast(
        error.message,
        'danger'
      );
    }
  }


  async presentToast (mensagem: string, cor: string) {

    const toast = await this.toastController.create({

      message: mensagem,
      color: cor,
      duration: 2000

    });

    toast.present();
  }
}
