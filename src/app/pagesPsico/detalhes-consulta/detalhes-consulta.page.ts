import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Avaliacao, AvalicaoServices } from 'src/app/services/avalicao';
import { ConsultaServices } from 'src/app/services/consulta';
import { DataServices } from 'src/app/services/data';

@Component({
  selector: 'app-detalhes-consulta',
  templateUrl: './detalhes-consulta.page.html',
  styleUrls: ['./detalhes-consulta.page.scss'],
  standalone: false
})
export class DetalhesConsultaPage implements OnInit {


  consulta: any = null;

    usuario: any = null;

    carregando = true;

    psicologo: any;

    avaliacoes: Avaliacao[] = [];

    mediaAvaliacoes = 0;

    totalFinalizadas = 0;

    totalPendentes = 0;

    totalCanceladas = 0;

  constructor(
    private route: ActivatedRoute,
    private consultaServices: ConsultaServices,
    private dataServices: DataServices,
    private avaliacaoServices: AvalicaoServices
  ) { }

  
  
  ngOnInit() {

    const psicologoStorage =
      localStorage.getItem('psicologo');

    if(psicologoStorage){

      this.psicologo =
        JSON.parse(psicologoStorage);

    }

    const consultaId =
      this.route.snapshot.paramMap.get('id');

    if(consultaId){

      this.carregarConsulta(
        consultaId
      );

    }

  }



  async carregarConsulta(consultaId: string){

    this.consulta =
      await this.consultaServices
        .buscarConsultaPorId(consultaId);

    if(this.consulta){

      await this.carregarPaciente();

    }

    this.carregando = false;

  }



  async carregarPaciente(){

    // busca os dados do paciente
    this.usuario =
      await this.dataServices.buscarUsuario(
        this.consulta.usuarioId
      );

    // busca avaliações recebidas pelo paciente
    this.avaliacaoServices
      .buscarAvaliacoesUsuario(
        this.consulta.usuarioId
      )
      .subscribe((dados: any)=>{

        this.avaliacoes = dados;

        if(this.avaliacoes.length > 0){

          const soma =
            this.avaliacoes.reduce(
              (total, avaliacao)=>
                total + avaliacao.nota,
              0
            );

          this.mediaAvaliacoes =
            soma / this.avaliacoes.length;

        }

      });


    // histórico de consultas do paciente
    this.consultaServices
    .listarConsultasUsuario(this.consulta.usuarioId)
    .subscribe((consultas: any[]) => {

      this.totalFinalizadas =
        consultas.filter(c => c.status === 'finalizada').length;

      this.totalPendentes =
        consultas.filter(c => c.status === 'pendente').length;

      this.totalCanceladas =
        consultas.filter(c => c.status === 'cancelada').length;

    });

  }

}
