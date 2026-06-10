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

  filtroStatus = 'todos';


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
      });
  }


  get consultasFiltradas() {

    if(this.filtroStatus === 'todos'){
    return this.consultas;
  }

    return this.consultas.filter(
      consulta => consulta.status === this.filtroStatus
    );
  }
}
