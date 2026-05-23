import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { LoadingController, ToastController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin';

@Component({
  selector: 'app-login-admin',
  templateUrl: './login-admin.page.html',
  styleUrls: ['./login-admin.page.scss'],
  standalone: false
})
export class LoginAdminPage {

  email: string = '';
  senha: string = '';

  constructor(
    private adminServices: AdminService,
    private router: Router,
    private toastController: ToastController,
    private loading: LoadingController
  ) {}

  async loginAdmin() {
    const load = await this.loading.create({message: 'Logando...'});

    await load.present();

    try {

      const admin =  await this.adminServices.getAdmin(this.email, this.senha)
    
      load.dismiss()
      
      if(admin){
        
        this.limparFormulario()

        this.presentToast('Admin na área, logado com sucesso!', 'success')
        this.router.navigateByUrl('/dashboard-admin');

      } else {
        this.presentToast('Você não é administrador', 'warning');
      }

    } catch(error: any){
      load.dismiss()

      console.log(error);

      this.presentToast('Erro ao fazer login', 'danger');

    }
  }


  limparFormulario(){

    this.email = '';
    this.senha = ''
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