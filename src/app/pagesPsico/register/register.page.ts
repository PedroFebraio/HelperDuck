import { Psicologo } from './../../services/psicologo';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { PsicologoServices } from 'src/app/services/psicologo';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {

    nome= '';
    email= '';
    senha= '';
    crp= '';
    estadoCrp= '';
    descricao= '';
    especialidades: string[] = [];

  arquivoSelecionado!: File;

  especialidadesDisponiveis: string[] = [

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
    private toastController: ToastController,
    private router: Router,
    private loadingCtrl: LoadingController
  ){}

  ngOnInit() {
  }


  limparFormulario(){
    this.nome= '';
    this.email= '';
    this.senha= '';
    this.crp= '';
    this.estadoCrp= '';
    this.descricao= '';
    this.especialidades= [];

  }


  onFileSelected(event: any){

    this.arquivoSelecionado =
      event.target.files[0];
  }


  async cadastrar(){

    const loading = await this.loadingCtrl.create({message: 'Cadastrando...'})
    await loading.present();

    const psicologo: Psicologo ={
      nome: this.nome,
      email: this.email,
      senha: this.senha,
      crp: this.crp,
      estadoCrp: this.estadoCrp,
      descricao: this.descricao,
      especialidades: this.especialidades
    }

    try {

      const psico = await this.psicologoServices.addPsicologo(psicologo, this.arquivoSelecionado);

      loading.dismiss()

      if(psico){
        this.limparFormulario()

        this.presentToast('Psicólogo cadastrado!', 'success');
        this.router.navigateByUrl('/loginPsico')
      }
    } catch (error) {
      loading.dismiss()

      console.log(error);

      this.presentToast('Erro ao cadastrar Psicólogo', 'danger');
    }
  }



  async presentToast (mensagem: string, cor: string) {

    const toast = await this.toastController.create({

      message: mensagem,
      color: cor,
      duration: 2000

    });

    toast.present();
  }


}
