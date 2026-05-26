import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthServices } from 'src/app/services/auth';
import { DataServices } from 'src/app/services/data';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false
})
export class LoginPage implements OnInit {

  email='';
  senha='';

  constructor(
    private authServices: AuthServices,
    private dataServices: DataServices,
    private router: Router,
    private toastController: ToastController, 
    private loading: LoadingController
  ) { }

  ngOnInit() {
  }


  limparFormulario(){

    this.email = '';
    this.senha = ''
  }


  async login(){

  const load = await this.loading.create({
    message: 'Logando...'
  });

  await load.present();

    try{

      const usuario =
        await this.dataServices.getUsuario( this.email, this.senha);

      await load.dismiss();

      if(usuario){

        this.presentToast(
          'Logado com sucesso!',
          'success'
        );

        this.limparFormulario();

        this.router.navigateByUrl('/dashboard');

      }else{

        this.presentToast(
          'Usuário não encontrado',
          'danger'
        );
      }

    }catch(error: any){
      await load.dismiss();

      // ERROS FIREBASE
      if(error.code === 'auth/invalid-credential'){
        this.presentToast(
          'Email ou senha inválidos',
          'danger'
        );

      }else if(error.code === 'auth/user-not-found'){

        this.presentToast(
          'Usuário não encontrado',
          'danger'
        );

      }else{

        this.presentToast(
          'Erro ao logar',
          'danger'
        );
      }
    }
  }



  async loginGoogle(){


    try{

      const usuario = await this.authServices.loginWithGoogle();
      
      if(!usuario){

        this.presentToast('Usuário não encontrado.', 'warning');
        return;
      }

      if(usuario['perfilCompleto'] === false){

        this.presentToast('Complete seu cadastro.','warning');
        this.router.navigateByUrl('/completar-cadastro');

        return
      }

      this.presentToast('Login realizado com sucesso!', 'success');

      this.router.navigateByUrl('/dashboard');

    }catch(error: any){

      let mensagem ='Erro ao logar com Google.';

      // CANCELAMENTO
      if(error?.message?.includes('cancel')){
        mensagem ='Login cancelado.';
      }
      
      this.presentToast( mensagem, 'danger');
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
