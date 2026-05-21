import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { DataServices, Usuario } from 'src/app/services/data';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {

  nome = '';
  email = '';
  senha = '';
  data: string = '';

  dataMaxima: string = '';
  dataMinima: string = '';

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private dataServices: DataServices
  ) { }

  ngOnInit() {
    const hoje = new Date();
    hoje.setFullYear(hoje.getFullYear() - 18);

    const dataMin = new Date();
    dataMin.setFullYear(hoje.getFullYear() - 100);

    this.dataMinima = dataMin.toISOString().split('T')[0]
    this.dataMaxima = hoje.toISOString().split('T')[0];
  }


  limparFormulario(){

    this.nome = '';
    this.email = '';
    this.senha = '';
    this.data = '';
  }



  async cadastrar(){

    const loading = await this.loadingCtrl.create({message: 'Cadastrando...'})
    await loading.present();

    const usuario: Usuario = {
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      dataNascimento: new Date( this.data + 'T00:00:00' ),
      pontosFidelidade: 0
    };

    try {

      const user = await this.dataServices.addUsuario(usuario)

      await loading.dismiss();

      if(user){
        this.limparFormulario();

        this.presentToast('Cadastro realizado com sucesso! ', 'success');
        this.router.navigateByUrl('/login');
      }
    } catch (error: any) {

      await loading.dismiss();
      this.presentToast('Erro ao cadastrar: ' + error.message, 'danger')

    }

  }



  async presentToast(message: string, color: string = 'primary'){

    const toast = await this.toastCtrl.create({

      message,
      duration:2000,
      color
    });

    toast.present();
  }
}
