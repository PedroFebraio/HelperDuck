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

  proximasConsultas: any[] = [];

  constructor(
    private app: AppComponent,
    private consultaServices: ConsultaServices
  ) {}

  ngOnInit() {
    this.app.carregarUsuario();

    this.psicologo = JSON.parse(
      localStorage.getItem('psicologo') || '{}'
    );

    this.carregarDashboard();
  }



  carregarDashboard(){

    this.consultaServices.listarConsultasPsicologo(this.psicologo.id)
      .subscribe((consultas: any[]) => {

      const hoje = new Date();

      /* CONSULTAS DE HOJE */

      this.consultasHoje = consultas.filter(c => {

        const data = new Date(c.dataConsulta);

        return (
          data.toDateString() === hoje.toDateString()
          && c.status === 'confirmada'
        );

      }).length;


      /* PACIENTES ÚNICOS */

      const pacientesUnicos = new Set(consultas.map(c => c.usuarioId));

      this.totalPacientes = pacientesUnicos.size;


        /* GANHOS */

      this.ganhosMes = consultas.filter(c => c.status === 'finalizada')
        .reduce((total, c) => total + Number(c.valorConsulta), 0);


      /* PRÓXIMAS CONSULTAS */

      this.proximasConsultas = consultas.filter(c => {

        const data = new Date(c.dataConsulta);

        const hoje = new Date();

        hoje.setHours(0,0,0,0);

        return (
          data >= hoje &&
          (
            c.status === 'pendente' ||
            c.status === 'confirmada'
          )
        );

      })
      .sort((a,b) =>
        new Date(a.dataConsulta).getTime() -
        new Date(b.dataConsulta).getTime()
      )
      .slice(0,5);
    });
  }
}