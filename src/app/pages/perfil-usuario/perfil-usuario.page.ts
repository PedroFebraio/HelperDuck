import { Component, OnInit } from '@angular/core';

import { ToastController } from '@ionic/angular';

import {
  DataServices,
  Usuario
}
from 'src/app/services/data';

@Component({
  selector: 'app-perfil-usuario',
  templateUrl: './perfil-usuario.page.html',
  styleUrls: ['./perfil-usuario.page.scss'],
  standalone: false
})

export class PerfilUsuarioPage
implements OnInit {

  usuario!: Usuario;
  dataNascimentoFormatada = '';

  constructor(
    private dataServices: DataServices,
    private toastController: ToastController
  ) {}


  async ngOnInit(){

    await this.carregarPerfil();
  }


  async carregarPerfil(){

    const usuarioStorage =
      localStorage.getItem('usuario');

    if(!usuarioStorage){

      return;
    }

    this.usuario = JSON.parse(usuarioStorage);

    const timestamp: any = this.usuario.dataNascimento;

    if(timestamp?.seconds){

      const data = new Date(
        timestamp.seconds * 1000
      );

      this.dataNascimentoFormatada =
        data.toLocaleDateString('pt-BR');
    }
  }



  formatarTelefone(event: any){

    let valor = event.target.value.replace(/\D/g, '');

    valor = valor.substring(0, 11);

    if(valor.length > 10){
      valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');

    }else{
      valor = valor.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
    }

    this.usuario.telefone = valor;
  }

  async salvarPerfil(){

    const sucesso = await this.dataServices.atualizarUsuario(
        this.usuario.id!,
        this.usuario
      );

    if(sucesso){

      localStorage.setItem('usuario',
        JSON.stringify(this.usuario)
      );

      this.presentToast('Perfil atualizado!', 'success');

    }else{

      this.presentToast('Erro ao atualizar perfil.', 'danger');
    }
  }


  async presentToast( mensagem: string, cor: string){

    const toast =
      await this.toastController.create({

        message: mensagem,
        color: cor,
        duration: 2000

      });

    await toast.present();
  }

}