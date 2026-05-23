import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AdminService } from 'src/app/services/admin';
import { AuthServices } from 'src/app/services/auth';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.page.html',
  styleUrls: ['./dashboard-admin.page.scss'],
  standalone: false
})
export class DashboardAdminPage implements OnInit {

  admin: any;
  psicologos: any[] = [];

  constructor(
    private adminService: AdminService,
    private router: Router,
    private toastCrtl: ToastController,
    private loading: LoadingController,
    private authServices: AuthServices
  ) {}

  ngOnInit(){
    const adminStorage = localStorage.getItem('admin')

    if(adminStorage){
      this.admin = JSON.parse(adminStorage);
    }

    this.adminService.listarPsicologosPendentes().subscribe({

      next: (dados: any) => {

        this.psicologos = dados;
      },

      error: (erro) => {

        console.log(erro);
      }
    });
  }


  async aprovar(psicologo: any){

    const aprovado = await this.adminService
    .aprovarPsicologo(psicologo);

    if(aprovado){
      this.presentToast('Psicologo aprovado com sucesso', 'success')
    }else{
      this.presentToast('Psicologo não aprovado', 'danger')
    }

  }


  async remover(psicologo: any){

    const deletado = await this.adminService
    .removerPsicologo(psicologo);

    if(deletado){
      this.presentToast('Psicologo removido com sucesso', 'success')
    }else{
      this.presentToast('Psicologo não removido', 'danger')
    }

  }


  async logout(){

    const load = await this.loading.create({message: 'Saindo...'})
    await load.present()

    try {
    
      this.authServices.logout();

      await load.dismiss()

      this.presentToast('Deslogado com sucesso!', 'success')
      localStorage.removeItem('admin');
      this.router.navigateByUrl('/home')    
    
    } catch (error) {
      
      await load.dismiss()

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
