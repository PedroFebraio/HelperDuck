import { Component, OnInit } from '@angular/core';
import { ConsultaServices } from 'src/app/services/consulta';

@Component({
  selector: 'app-consulta',
  templateUrl: './consulta.page.html',
  styleUrls: ['./consulta.page.scss'],
  standalone: false
})
export class ConsultaPage implements OnInit {

  consultas: any[] = [];

  usuario: any;

  filtroStatus = 'pendente';

  consultasPendentes: any[] = [];
  consultasConfirmadas: any[] = [];
  consultasCanceladas: any[] = [];
  consultasFinalizadas: any[] = [];


  constructor(
    private consultaServices: ConsultaServices
  ) {}

  
  ngOnInit() {

    this.usuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    this.carregarConsultas();
  }

  
  carregarConsultas(){

    this.consultaServices.listarConsultasUsuario(this.usuario.id)
    .subscribe((dados: any) => {

        this.consultas = dados;

        this.consultasPendentes = this.consultas.filter(
          consulta => consulta.status ==='pendente');

        this.consultasConfirmadas = this.consultas.filter(
          consulta => consulta.status === 'confirmada');

        this.consultasCanceladas = this.consultas.filter(
          consulta => consulta.status === 'cancelada');

        this.consultasFinalizadas = this.consultas.filter(
          consulta => consulta.status === 'finalizada');
      });
  }


  get consultasFiltradas() {

    return this.consultas.filter(
      consulta => consulta.status === this.filtroStatus
    );
  }
}
