import { Component, OnInit } from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { PsicologoServices }
from 'src/app/services/psicologo';

@Component({
  selector: 'app-perfil-psicologo',
  templateUrl: './perfil-psicologo.page.html',
  styleUrls: ['./perfil-psicologo.page.scss'],
  standalone: false
})

export class PerfilPsicologoPage implements OnInit {

  psicologo: any;

  carregando = true;

  constructor(
    private route: ActivatedRoute,
    private psicologoServices: PsicologoServices
  ) {}

  ngOnInit() {

    const id = this.route.snapshot.paramMap.get('id');

    if(id){

      this.psicologoServices
      .buscarPsicologo(id)
      .subscribe((dados: any) => {

        this.psicologo = dados;

        this.carregando = false;
      });
    }
  }
}