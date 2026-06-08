import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Interface para definir o formato de uma consulta
export interface Consulta {
  id: number;
  usuarioNome: string;
  status: 'pendente' | 'confirmada' | 'finalizada' | 'cancelada';
  dataConsulta: string;
  valorConsulta: string;
}

@Component({
  selector: 'app-consultas',
  templateUrl: './consultas.page.html',
  styleUrls: ['./consultas.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class ConsultasPage implements OnInit {

  // Variáveis de controle de estado
  carregando: boolean = true;
  filtroAtual: string = 'pendente';
  
  // Array principal que armazena todas as consultas
  consultas: Consulta[] = [];

  constructor() { }

  ngOnInit() {
    this.carregarConsultas();
  }

  // Simula o carregamento dos dados (substitua futuramente pela chamada ao Service/API)
  carregarConsultas() {
    this.carregando = true;

    setTimeout(() => {
      this.consultas = [
        { id: 1, usuarioNome: 'Maria Joaquina', status: 'pendente', dataConsulta: '10/06/2026 às 14:00', valorConsulta: '150,00' },
        { id: 2, usuarioNome: 'João Pedro', status: 'confirmada', dataConsulta: '11/06/2026 às 09:30', valorConsulta: '150,00' },
        { id: 3, usuarioNome: 'Ana Clara', status: 'finalizada', dataConsulta: '01/06/2026 às 16:00', valorConsulta: '120,00' },
        { id: 4, usuarioNome: 'Carlos Silva', status: 'cancelada', dataConsulta: '05/06/2026 às 10:00', valorConsulta: '150,00' },
        { id: 5, usuarioNome: 'Beatriz Costa', status: 'pendente', dataConsulta: '12/06/2026 às 11:00', valorConsulta: '180,00' }
      ];
      this.carregando = false;
    }, 1500); // Simula 1.5 segundos de carregamento
  }

  // --- GETTERS PARA OS CONTADORES DO ION-SEGMENT ---
  get consultasPendentes() {
    return this.consultas.filter(c => c.status === 'pendente');
  }

  get consultasConfirmadas() {
    return this.consultas.filter(c => c.status === 'confirmada');
  }

  get consultasFinalizadas() {
    return this.consultas.filter(c => c.status === 'finalizada');
  }

  get consultasCanceladas() {
    return this.consultas.filter(c => c.status === 'cancelada');
  }

  // --- GETTER PARA A LISTA FILTRADA EXIBIDA NA TELA ---
  get consultasFiltradas() {
    return this.consultas.filter(c => c.status === this.filtroAtual);
  }

  // --- FUNÇÃO PARA ALTERAR O STATUS NO CLIQUE DO BOTÃO ---
  alterarStatus(id: number, novoStatus: 'pendente' | 'confirmada' | 'finalizada' | 'cancelada') {
    const index = this.consultas.findIndex(c => c.id === id);
    if (index !== -1) {
      this.consultas[index].status = novoStatus;
      console.log(`Consulta ${id} alterada para ${novoStatus}`);
    }
  }

}