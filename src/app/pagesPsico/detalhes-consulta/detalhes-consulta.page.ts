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


  consulta: any = null;
  carregando = true;
  psicologo: any;

  constructor(
    private route: ActivatedRoute,
    private consultaServices: ConsultaServices
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



  async carregarConsulta( consultaId: string ){

    this.consulta = await this.consultaServices.buscarConsultaPorId(
          consultaId
        );

    this.carregando = false;
  }



}
