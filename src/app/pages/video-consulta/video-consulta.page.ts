import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-video-consulta',
  templateUrl: './video-consulta.page.html',
  styleUrls: ['./video-consulta.page.scss'],
  standalone: false
})
export class VideoConsultaPage implements OnInit {

  sala = '';

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit() {

    this.sala =
      this.route.snapshot.paramMap.get('sala') || '';

  }


  entrarNaSala(){

  console.log(
    'Entrar na sala:',
    this.sala
  );

}
}