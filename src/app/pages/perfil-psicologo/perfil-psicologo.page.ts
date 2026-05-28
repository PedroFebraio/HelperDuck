import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Consulta, ConsultaServices } from 'src/app/services/consulta';

import { PsicologoServices }
from 'src/app/services/psicologo';

@Component({
  selector: 'app-perfil-psicologo',
  templateUrl: './perfil-psicologo.page.html',
  styleUrls: ['./perfil-psicologo.page.scss'],
  standalone: false
})

export class PerfilPsicologoPage implements OnInit {

  psicologo: any;
  usuario: any
  carregando = true;
  dataConsulta = ''
  dataMinima = '';

  constructor(
    private route: ActivatedRoute,
    private psicologoServices: PsicologoServices,
    private consultaServices: ConsultaServices,
    private toastController: ToastController
  ) {}


  ngOnInit() {

    this.dataMinima =
    new Date().toISOString();

    this.usuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    const id = this.route.snapshot.paramMap.get('id');

    if(id){
      

      this.psicologoServices.buscarPsicologo(id).subscribe((dados: any) => {
        this.psicologo = dados;
        this.carregando = false;
      });
    }
  }


  async agendarConsulta(){

    const agora = new Date();

    const dataSelecionada =
      new Date(this.dataConsulta);

    const possuiConsultaAtiva = await this.consultaServices.
      verificarConsultaAtiva(this.usuario.id, this.psicologo.id);

    if(possuiConsultaAtiva){

      this.presentToast('Você já possui uma consulta ativa com este psicólogo.',
        'warning');

      return;
    }

    if(dataSelecionada <= agora){

      this.presentToast('Escolha uma data futura.', 'warning');

      return;
    }

    // VALIDA DATA
    if(!this.dataConsulta){

      this.presentToast('Selecione uma data.', 'warning');

      return;
    }

    const consulta: Consulta = {
      usuarioId: this.usuario.id,
      usuarioNome: this.usuario.nome,
      psicologoId: this.psicologo.id,
      psicologoNome: this.psicologo.nome,
      dataConsulta: this.dataConsulta,
      valorConsulta: this.psicologo.valorConsulta,
      status: 'pendente'
    };

    try {

      const consultaCriada = await this.consultaServices.addConsulta(consulta);

      if(consultaCriada){

        this.presentToast('Consulta agendada!', 'success');

      } else {

        this.presentToast('Erro ao agendar consulta.', 'danger');
      }

    } catch(error){

      console.log(error);

      this.presentToast('Erro interno ao agendar.', 'danger');
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