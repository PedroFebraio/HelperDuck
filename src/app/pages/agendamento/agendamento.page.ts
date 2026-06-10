import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PsicologoServices } from 'src/app/services/psicologo';

@Component({
  selector: 'app-agendamento',
  templateUrl: './agendamento.page.html',
  styleUrls: ['./agendamento.page.scss'],
  standalone: false
})
export class AgendamentoPage implements OnInit {

  todosPsicologos: any[] = [];
  psicologos: any[] = [];

  busca = '';

  especialidadeSelecionada = '';

  estadoSelecionado = '';

  precoMaximo = 200;

  carregando = true;

  especialidadesDisponiveis: string[] = [
    'Ansiedade',
    'Depressão',
    'Relacionamentos',
    'Psicologia Infantil',
    'Adolescentes',
    'TDAH',
    'Autismo',
    'Burnout'
  ];


  constructor(
    private psicologoServices: PsicologoServices,
    private router: Router,
  ) {}

  ngOnInit() {

    this.psicologoServices
    .listarPsicologos()
    .subscribe((dados: any) => {

      this.todosPsicologos = dados;

      this.psicologos = dados;

      this.carregando = false;
    });
  }

  abrirPerfil(id: string){

    this.router.navigateByUrl(
      `/perfil-psicologo/${id}`
    );
  }

  filtrarPsicologos(){

    this.psicologos = this.todosPsicologos.filter(psicologo => {

      const nomeMatch =
        psicologo.nome
        ?.toLowerCase()
        .includes(this.busca.toLowerCase());

      const especialidadeMatch =
        !this.especialidadeSelecionada ||
        psicologo.especialidades?.includes(
          this.especialidadeSelecionada
        );

      const precoMatch =
        psicologo.valorConsulta <= this.precoMaximo;

      return (
        nomeMatch &&
        especialidadeMatch &&
        precoMatch
      );
    });
  }
  

  limparFiltros(){

    this.busca = '';

    this.especialidadeSelecionada = '';

    this.precoMaximo = 200;

    this.psicologos = this.todosPsicologos;
  }

}