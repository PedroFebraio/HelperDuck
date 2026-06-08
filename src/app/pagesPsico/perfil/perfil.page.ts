import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular'; // 👈 1. GARANTA QUE ESTE IMPORT EXISTE

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true, // Já deve estar assim
  imports: [
    CommonModule, 
    FormsModule, 
    IonicModule // 👈 2. ADICIONE O IONICMODULE AQUI DENTRO
  ]
})
export class PerfilPage implements OnInit {

  psicologo = {
    nome: '',
    foto: '',
    crp: '',
    especialidades: '',
    descricao: ''
  };

  constructor() { }

  ngOnInit() {
    this.carregarDadosPerfil();
  }

  carregarDadosPerfil() {
    this.psicologo.nome = 'Dr(a). Nome do Profissional';
    this.psicologo.crp = '06/12345-X';
  }

  salvarPerfil() {
    console.log('Dados do perfil salvos:', this.psicologo);
  }
}