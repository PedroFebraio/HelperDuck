
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { Psicologo, PsicologoServices } from 'src/app/services/psicologo';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {

  cadastroForm!: FormGroup;

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
    private loadingCtrl: LoadingController,
    private fb: FormBuilder
  ){}

  ngOnInit() {

    this.cadastroForm = this.fb.group({

      nome: ['', [Validators.required, Validators.minLength(3),
          Validators.maxLength(50)]],

      email: ['', [Validators.required, Validators.email]],

      senha: ['', [Validators.required, Validators.pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/)]],

      telefone: ['',[Validators.required,
    Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],

      crp: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(7)]],

      estadoCrp: ['', [Validators.required, Validators.maxLength(2)]],

      bio: ['', [Validators.required, 
        Validators.minLength(20), Validators.maxLength(3000)]],

      valorConsulta: ['', [Validators.required, Validators.min(50), Validators.max(400)]],

      especialidades: [[], [Validators.required]]

    });

  }


  formatarTelefone(event: any) {

    let valor = event.target.value || '';

    // Remove tudo que não for número
    valor = valor.replace(/\D/g, '');

    // Limita a 11 dígitos
    valor = valor.substring(0, 11);

    // Formata
    if (valor.length > 10) {

      valor = valor.replace(
        /^(\d{2})(\d{5})(\d{4}).*/,
        '($1) $2-$3'
      );

    } else {

      valor = valor.replace(
        /^(\d{2})(\d{4})(\d{4}).*/,
        '($1) $2-$3'
      );

    }

    // Atualiza o campo do formulário
    this.cadastroForm.patchValue(
      { telefone: valor },
      { emitEvent: false }
    );
  }


  async cadastrar(){

    if(this.cadastroForm.invalid){
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Cadastrando...'})
    await loading.present();

    const psicologo: Psicologo ={
      nome: this.cadastroForm.value.nome,
      email: this.cadastroForm.value.email,
      senha: this.cadastroForm.value.senha,
      crp: this.cadastroForm.value.crp,
      estadoCrp: this.cadastroForm.value.estadoCrp,
      bio: this.cadastroForm.value.bio,
      especialidades: this.cadastroForm.value.especialidades,
      valorConsulta: this.cadastroForm.value.valorConsulta,
      telefone: this.cadastroForm.value.telefone,
    }

    try {

      const psico = await this.psicologoServices.addPsicologo(psicologo);

      loading.dismiss()

      if(psico){
        this.cadastroForm.reset();

        this.presentToast('Psicólogo cadastrado!', 'success');
        this.router.navigateByUrl('/login-psicologo')
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
