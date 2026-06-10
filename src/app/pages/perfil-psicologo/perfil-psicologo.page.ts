import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Agenda, AgendaServices } from 'src/app/services/agenda';
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
  agenda: Agenda | null = null;
  carregando = true;
  dataConsulta = ''
  dataMinima = '';

  ordemDias = [
    'segunda',
    'terca',
    'quarta',
    'quinta',
    'sexta',
    'sabado',
    'domingo'
  ];

  constructor(
    private route: ActivatedRoute,
    private psicologoServices: PsicologoServices,
    private consultaServices: ConsultaServices,
    private agendaServices: AgendaServices,
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
      this.psicologoServices.buscarPsicologo(id).subscribe( async (dados: any) => {
        this.psicologo = dados;

        this.agenda = await this.agendaServices.buscarAgenda(id);

        if(this.agenda){
          this.agenda.diasDisponiveis = this.ordenarDias(this.agenda.diasDisponiveis);
        }
        
        this.carregando = false;
      });
    }
  }



  ordenarDias(dias: string[] = []): string[] {

    return [...dias].sort(
      (a, b) =>
        this.ordemDias.indexOf(a.toLowerCase()) -
        this.ordemDias.indexOf(b.toLowerCase())
    );
  }



  validarDiaSemana(): boolean {

    if(!this.agenda){
      return false;
    }

    const data = new Date(this.dataConsulta);

    const diasSemana = [
      'domingo',
      'segunda',
      'terca',
      'quarta',
      'quinta',
      'sexta',
      'sabado'
    ];

    const diaSelecionado = diasSemana[data.getDay()];

    return this.agenda.diasDisponiveis.includes(diaSelecionado);
  }



  formatarDia(dia: string): string {

    const nomes: any = {
      segunda: 'Segunda',
      terca: 'Terça',
      quarta: 'Quarta',
      quinta: 'Quinta',
      sexta: 'Sexta',
      sabado: 'Sábado',
      domingo: 'Domingo'
    };

    return nomes[dia.toLowerCase()] || dia;
  }



  validarHorario(): boolean {

    if(!this.agenda){
      return false;
    }

    const data = new Date(this.dataConsulta);
    const minutosSelecionados = data.getHours() * 60 + data.getMinutes();

    const [horaInicio, minutoInicio] = this.agenda.horarioInicio.split(':').map(Number);
    const [horaFim, minutoFim] = this.agenda.horarioFim.split(':').map(Number);

    const inicio = horaInicio * 60 + minutoInicio;
    const fim = horaFim * 60 + minutoFim;

    return minutosSelecionados >= inicio && minutosSelecionados < fim;
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

    if(!this.validarDiaSemana()){
      this.presentToast('O psicólogo não atende nesse dia.', 'warning');
      
      return;
    }

    if(!this.validarHorario()){
      this.presentToast('Horário fora do expediente do psicólogo.', 'warning');

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