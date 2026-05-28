import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Agenda, AgendaServices } from 'src/app/services/agenda';

@Component({
  selector: 'app-agenda',
  templateUrl: './agenda.page.html',
  styleUrls: ['./agenda.page.scss'],
  standalone: false
})
export class AgendaPage implements OnInit {

  psicologo: any;
  carregando = true;
  salvando = false;


  // DIAS DISPONÍVEIS

  diasSemana = [
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
    'domingo'
  ];


  // AGENDA

  agenda: Agenda = {

    diasDisponiveis: [],
    horarioInicio: '08:00',
    horarioFim: '20:00',
    duracaoConsulta: 50,
    ativo: true
  };


  constructor(

    private agendaServices: AgendaServices,

    private toastController: ToastController
  ) {}


  async ngOnInit(){

    const psicologo = localStorage.getItem('psicologo');

    if(psicologo){

      this.psicologo = JSON.parse(psicologo);

      await this.carregarAgenda();
    }

    this.carregando = false;
  }


  // CARREGAR AGENDA

  async carregarAgenda(){

    const agendaSalva = await this.agendaServices.buscarAgenda(this.psicologo.id);

    if(agendaSalva){

      this.agenda = agendaSalva;
    }
  }


  // SELECIONAR DIA

  selecionarDia(dia: string){

    const existe = this.agenda.diasDisponiveis.includes(dia);

    if(existe){

      this.agenda.diasDisponiveis = this.agenda.diasDisponiveis.filter(d => d !== dia);

    }else{

      this.agenda.diasDisponiveis.push(dia);
    }
  }


  // VERIFICAR DIA

  diaSelecionado(dia: string): boolean {

    return this.agenda.diasDisponiveis.includes(dia);
  }


  // SALVAR

  async salvarAgenda(){

    this.salvando = true;

    const sucesso = await this.agendaServices.salvarAgenda(
        this.psicologo.id, this.agenda);

    this.salvando = false;

    if(sucesso){

      this.presentToast('Agenda salva!', 'success');

    }else{

      this.presentToast('Erro ao salvar agenda.', 'danger'
      );
    }
  }


  // TOAST

  async presentToast( mensagem: string, cor: string){

    const toast = await this.toastController.create({

        message: mensagem,

        duration: 2500,

        color: cor
      });

    await toast.present();
  }

}
