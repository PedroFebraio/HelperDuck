import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {

  constructor(
    private router: Router
  ) {}

  
  ngOnInit(){

    const usuario =
    localStorage.getItem('usuario');

    if(usuario){

      console.log('Usuário logado');
      this.router.navigateByUrl('/dashboard')

    } else {

      console.log('Não logado');
    }
  }


}
