import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { Agenda, AgendaServices } from 'src/app/services/agenda';
import { Avaliacao, AvalicaoServices } from 'src/app/services/avalicao';
import { Psicologo, PsicologoServices } from 'src/app/services/psicologo';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {

  psicologo!: Psicologo;

  especialidades: string[] = [];

  agenda: Agenda | null = null;

  avaliacoes: Avaliacao[] = [];

  mediaAvaliacoes = 0;

  especialidadesDisponiveis = [
    'Ansiedade',
    'Depressão',
    'Relacionamentos',
    'Psicologia Infantil',
    'Adolescentes',
    'Terapia de Casais',
    'TDAH',
    'Autismo',
    'Autoestima',
    'Burnout',
    'LGBTQIA+',
    'Traumas',
    'Dependência Emocional',
    'Orientação Profissional'
  ];

  constructor(
    private psicologoServices: PsicologoServices,
    private agendaServices: AgendaServices,
    private toastController: ToastController,
    private avaliacaoServices: AvalicaoServices
  ) {}



  async ngOnInit() {
    await this.carregarPerfil();
  }



  async carregarPerfil() {

    const psicologoStorage = localStorage.getItem('psicologo');

    if (!psicologoStorage) {
      await this.presentToast('Nenhum psicólogo encontrado.', 'warning');

      return;
    }

    this.psicologo = JSON.parse(psicologoStorage);

    this.especialidades = this.psicologo.especialidades || [];

    this.agenda =
      await this.agendaServices.buscarAgenda(
        this.psicologo.id!
      );

    this.avaliacaoServices
    .buscarAvaliacoesPsicologo(this.psicologo.id!)
    .subscribe((dados: any) => {

      this.avaliacoes = dados;

      if(this.avaliacoes.length > 0){

        const soma =
          this.avaliacoes.reduce(
            (total, avaliacao) =>
              total + avaliacao.nota,
            0
          );

        this.mediaAvaliacoes =
          soma / this.avaliacoes.length;
      }

    });
  }



  formatarTelefone(event: any) {

    let valor = event.target.value || '';

    valor = valor.replace(/\D/g, '');
    valor = valor.substring(0, 11);

    if (valor.length > 10) {
      valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');

    } else if (valor.length >= 10) {
      valor = valor.replace(/^(\d{2})(\d{4})(\d{4}).*/, '($1) $2-$3');
    }

    this.psicologo.telefone = valor;
  }



  validarNome(): boolean {

    return /^[A-Za-zÀ-ÿ\s]+$/.test(this.psicologo.nome);
  }




  async salvarPerfil() {

    if (!this.validarNome()) {
      await this.presentToast('Nome inválido.', 'warning');

      return;
    }

    if (this.psicologo.valorConsulta < 50) {
      await this.presentToast('O valor mínimo da consulta é R$ 50,00.', 'warning');

      return;
    }

    if (this.especialidades.length === 0) {
      await this.presentToast('Selecione ao menos uma especialidade.', 'warning');

      return;
    }

    this.psicologo.especialidades = this.especialidades;

    const sucesso = await this.psicologoServices.atualizarPsicologo(
          this.psicologo.id!,
          this.psicologo
        );

    if (sucesso) {
      localStorage.setItem('psicologo',
        JSON.stringify(this.psicologo)
      );

      await this.presentToast('Perfil atualizado com sucesso!', 'success');
    
    } else {
      await this.presentToast('Erro ao atualizar perfil.', 'danger');
    }
  }

  async presentToast(
    message: string,
    color: string = 'success'
  ) {

    const toast =
      await this.toastController.create({

        message,
        duration: 2500,
        color

      });

    await toast.present();
  }
}