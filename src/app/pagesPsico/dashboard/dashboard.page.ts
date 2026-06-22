import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ConsultaServices } from 'src/app/services/consulta';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  psicologo: any;

  consultasHoje = 0;

  totalPacientes = 0;

  ganhosMes = 0;

  saudacao = '';

  proximasConsultas: any[] = [];

  mensagens = [
    'Hoje é uma oportunidade para transformar vidas 💙',
    'Seu trabalho faz diferença todos os dias 🌱',
    'Cada atendimento é uma conquista para alguém 🧠',
    'Cuidar de pessoas é uma missão especial ✨'
  ];

  mensagemMotivacional = '';

  consultasRealizadas = 0;

  ticketMedio = 0;

  historicoRecente: any[] = [];

  proximaConsulta: any = null;

  // Futuro
  avaliacaoMedia = 0;

  constructor(
    private app: AppComponent,
    private consultaServices: ConsultaServices
  ) {}



  async ngOnInit() {
    this.app.carregarUsuario();

    this.psicologo = JSON.parse(
      localStorage.getItem('psicologo') || '{}'
    );

    const hora = new Date().getHours();

    if (hora < 12) {

      this.saudacao = 'Bom dia';

    }
    else if (hora < 18) {

      this.saudacao = 'Boa tarde';

    }
    else {

      this.saudacao = 'Boa noite';

    }

    this.mensagemMotivacional =
    this.mensagens[
    Math.floor(
    Math.random() * this.mensagens.length
    )
    ];

    this.carregarDashboard();
  }



  carregarDashboard(){

    this.consultaServices.listarConsultasPsicologo(this.psicologo.id)
      .subscribe((consultas: any[]) => {

      const agora = new Date();

      /* CONSULTAS DE HOJE */

      this.consultasHoje = consultas.filter(c => {

        const data = new Date(c.dataConsulta);

        return (
          data.toDateString() === agora.toDateString()
          && c.status === 'confirmada'
        );

      }).length;


      /* PACIENTES ÚNICOS */

      const pacientesUnicos = new Set(consultas.map(c => c.usuarioId));

      this.totalPacientes = pacientesUnicos.size;

      this.consultasRealizadas =
        consultas.filter(c =>
        c.status === 'finalizada'
        ).length;


        /* GANHOS */

      this.ganhosMes = consultas.filter(c => c.status === 'finalizada')
        .reduce((total, c) => total + Number(c.valorConsulta), 0);

        if (this.consultasRealizadas > 0) {

          this.ticketMedio =
            this.ganhosMes / this.consultasRealizadas;

        }
        else {

          this.ticketMedio = 0;

        }

        this.historicoRecente = [...consultas]
        .filter(c => c.status === 'finalizada')
        .sort((a,b) =>
        new Date(b.dataConsulta).getTime() -
        new Date(a.dataConsulta).getTime()
        )
        .slice(0,3);

      /* PRÓXIMAS CONSULTAS */

      const consultasFuturas = consultas
      .filter(c => {

        const data = new Date(c.dataConsulta);

        return (
          data >= agora &&
          (
            c.status === 'pendente' ||
            c.status === 'confirmada'
          )
        );

      })
      .sort((a,b) =>
      new Date(a.dataConsulta).getTime() -
      new Date(b.dataConsulta).getTime()
      );

      this.proximasConsultas =
      consultasFuturas.slice(0,5);

      if (consultasFuturas.length > 0) {

        this.proximaConsulta = consultasFuturas[0];

      }
      else {

        this.proximaConsulta = null;

      }
    })
  }
}