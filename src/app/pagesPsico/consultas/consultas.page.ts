import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { ConsultaServices } from 'src/app/services/consulta';

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: false
})
export class ConsultasPage implements OnInit {

  consultas: any[] = [];
  
  consultasPendentes: any[] = [];
  consultasConfirmadas: any[] = [];
  consultasFinalizadas: any[] = [];
  consultasCanceladas: any[] = [];
  
  psicologo: any;

  carregando = true;

  filtroAtual = 'pendente';

  constructor(
    private consultaService: ConsultaServices,

    private toastController: ToastController
  ) {}

  ngOnInit() {

    const psicologo = localStorage.getItem('psicologo');

    if(psicologo){
      this.psicologo =JSON.parse(psicologo);

      this.carregarConsultas();
    }
  }

  carregarConsultas(){

    this.consultaService.listarConsultasPsicologo(this.psicologo.id)
    .subscribe((dados: any) => {

      this.consultas = dados;

      /* SEPARAÇÃO */

      this.consultasPendentes = this.consultas.filter(
        consulta => consulta.status ==='pendente');

      this.consultasConfirmadas = this.consultas.filter(
        consulta => consulta.status === 'confirmada');

      this.consultasFinalizadas = this.consultas.filter(
        consulta => consulta.status === 'finalizada');

      this.consultasCanceladas = this.consultas.filter(
        consulta => consulta.status === 'cancelada');

      this.carregando = false;
    });
  }

  get consultasFiltradas(){

  return this.consultas.filter(consulta => 
    consulta.status === this.filtroAtual);
  }

  async alterarStatus(consultaId: string, status: string){

    const sucesso = await this.consultaService.atualizarStatus(consultaId, status);

    if(sucesso){

      this.presentToast('Status atualizado!', 'success');

    }else{

      this.presentToast('Erro ao atualizar.', 'danger');
    }
  }

  async presentToast(mensagem: string, cor: string
  ){

    const toast = await this.toastController.create({

        message: mensagem,

        duration: 2000,

        color: cor
      });

    toast.present();
  }

}
