import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthServices } from 'src/app/services/auth';
import { HumorServices } from 'src/app/services/humor';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  usuario: any;
  
  humorRegistrado = false

  mensagemHumor: string = '';

  constructor(

    private authServices: AuthServices,
    private humorServices: HumorServices,
    private router: Router,
    private toastCrtl: ToastController,
    private loading: LoadingController
  ) { }

 async ngOnInit() {
    const usuarioStorage = localStorage.getItem('usuario')

    if(usuarioStorage){
      this.usuario = JSON.parse(usuarioStorage);

      this.humorRegistrado = await this.humorServices.verificarHumorHoje(this.usuario.id);
    }

    const humorHoje =await this.humorServices.getHumorHoje(this.usuario.id);

    if(humorHoje){

      this.humorRegistrado = true;

      if(humorHoje['humor'] === 'bem'){

        this.mensagemHumor =
          'Que ótimo saber que você está bem 😊';
      }

      else if(humorHoje['humor'] === 'neutro'){

        this.mensagemHumor =
          'Dias neutros também fazem parte da jornada 💛';
      }

      else if(humorHoje['humor'] === 'mal'){

        this.mensagemHumor =
          'Você não precisa enfrentar tudo sozinho 🫂';
      }
    }
  }

  
  async logout(){

    const load = await this.loading.create({message: 'Saindo...'})
    await load.present()

    try {
    
      this.authServices.logout();

      await load.dismiss()

      this.presentToast('Deslogado com sucesso!', 'success')
      localStorage.removeItem('usuario');
      this.router.navigateByUrl('/home')    
    
    } catch (error) {
      
      await load.dismiss()

      this.presentToast('Erro desconhecido ao deslogar', 'danger')

    }
  }
  
  
  
  async selecionarHumor(humor: 'bem' | 'neutro' | 'mal'){

    await this.humorServices.addHumor(this.usuario.id, humor);

    this.humorRegistrado = true;
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
