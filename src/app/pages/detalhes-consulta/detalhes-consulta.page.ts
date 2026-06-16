import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConsultaServices } from 'src/app/services/consulta';

@Component({
  selector: 'app-detalhes-consulta',
  templateUrl: './detalhes-consulta.page.html',
  styleUrls: ['./detalhes-consulta.page.scss'],
  standalone: false
})
export class DetalhesConsultaPage implements OnInit {

  consulta: any;

  carregando = true;

  constructor(
    private route: ActivatedRoute,
    private consultaService: ConsultaServices
  ) {}

  async ngOnInit() {

    const consultaId =
      this.route.snapshot.paramMap.get('id');

    if(consultaId){

      this.consulta =
        await this.consultaService.buscarConsultaPorId(
          consultaId
        );
    }

    this.carregando = false;
  }

}