import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  psicologo: any;

  consultasHoje = 3;

  totalPacientes = 18;

  ganhosMes = 1250;

  proximasConsultas = [

    {
      paciente: 'Maria',
      horario: '14:00'
    },

    {
      paciente: 'João',
      horario: '16:00'
    }
  ];

  constructor(
    private app: AppComponent
  ) {}

  ngOnInit() {
    this.app.carregarUsuario()

    this.psicologo = JSON.parse(
      localStorage.getItem('psicologo') || '{}'
    );
  }
}