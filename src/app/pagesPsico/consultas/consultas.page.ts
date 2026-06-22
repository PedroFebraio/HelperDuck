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
  consultasCanceladas: any[] = [];
  consultasFinalizadas: any[] = [];

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

      this.consultasCanceladas = this.consultas.filter(
        consulta => consulta.status === 'cancelada');

      this.consultasFinalizadas = this.consultas.filter(
        consulta => consulta.status === 'finalizada');

      this.carregando = false;
    });
  }



  get consultasFiltradas(){

  return this.consultas.filter(consulta => 
    consulta.status === this.filtroAtual);
  }




  async alterarStatus(consultaId: string, status: string){

  let dadosAtualizacao: any = {status};

  // QUANDO CONFIRMAR

  if(status === 'confirmada'){

    dadosAtualizacao = {

      status: 'confirmada',

      salaVideo:
        'helperduck-' +
        Math.random()
          .toString(36)
          .substring(2,10),

      checkinUsuario: false,
      checkinPsicologo: false,

      presencaUsuario: false,
      presencaPsicologo: false,

      iniciada: false,

      finalizada: false,

      inicioSessao: null,

      fimSessao: null,

      duracaoConsulta: 50,

      duracaoReal: 0
    };
  }

  const sucesso = await this.consultaService.atualizarConsulta(consultaId, dadosAtualizacao);

  if(sucesso){
    this.presentToast('Status atualizado com sucesso!', 'success');

  }else{
    this.presentToast('Erro ao atualizar consulta.', 'danger'
    );
  }
}



  async presentToast(mensagem: string, cor: string){

    const toast = await this.toastController.create({

        message: mensagem,

        duration: 2000,

        color: cor
      });

    toast.present();
  }
}
