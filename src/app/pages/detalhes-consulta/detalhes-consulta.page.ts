import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AvalicaoServices } from 'src/app/services/avalicao';
import { ConsultaServices } from 'src/app/services/consulta';
import { PsicologoServices } from 'src/app/services/psicologo';

@Component({
  selector: 'app-detalhes-consulta',
  templateUrl: './detalhes-consulta.page.html',
  styleUrls: ['./detalhes-consulta.page.scss'],
  standalone: false
})
export class DetalhesConsultaPage implements OnInit {

  consulta: any;

  carregando = true;

  psicologo: any;

  avaliacoes: any[] = [];

  mediaAvaliacoes = 0;

  constructor(
    private route: ActivatedRoute,
    private consultaService: ConsultaServices,
    private psicologoServices: PsicologoServices,
    private avaliacaoServices: AvalicaoServices
  ) {}

  async ngOnInit() {

    const consultaId =
      this.route.snapshot.paramMap.get('id');

    if (consultaId) {

      this.consulta =
        await this.consultaService.buscarConsultaPorId(
          consultaId
        );

      this.psicologo =
        await this.psicologoServices.buscarPsicologoPorId(
          this.consulta.psicologoId
        );

      this.avaliacaoServices
        .buscarAvaliacoesPsicologo(
          this.consulta.psicologoId
        )
        .subscribe((dados: any) => {

          this.avaliacoes = dados;

          if (dados.length > 0) {

            const soma = dados.reduce(
              (total: number, a: any) => total + a.nota,
              0
            );

            this.mediaAvaliacoes =
              soma / dados.length;
          }

        });

    }

    this.carregando = false;
  }

}