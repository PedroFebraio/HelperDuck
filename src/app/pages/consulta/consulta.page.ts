import { Component, OnInit } from '@angular/core';
import { Consulta, ConsultaServices } from 'src/app/services/consulta';

@Component({
  selector: 'app-consulta',
  templateUrl: './consulta.page.html',
  styleUrls: ['./consulta.page.scss'],
  standalone: false
})
export class ConsultaPage implements OnInit {

  consultas: Consulta[] = [];
  usuario: any;

  constructor(

    private consultaServices:
      ConsultaServices

  ) {}

  async ngOnInit() {

    const user = localStorage.getItem('usuario')

    if(user){
      this.usuario = JSON.parse(user)

      this.consultas =
        await this.consultaServices.buscarConsultasUsuario(this.usuario.id)
    }

  }

}
