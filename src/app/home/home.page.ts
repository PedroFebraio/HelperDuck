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

    const psicologo =
      localStorage.getItem('psicologo');

    if(usuario){
      console.log('Usuário logado');
      this.router.navigateByUrl('/dashboard')
    } else {
      console.log('Não logado');
    }

    if(psicologo){
      console.log('Psicólogo Logado');
      this.router.navigateByUrl('/dashboard-psicologo')
    }
  }
}
