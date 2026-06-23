import { Component, OnInit } from '@angular/core';

import {
  FormBuilder, FormGroup, Validators,
  AbstractControl, ValidationErrors
} from '@angular/forms';

import {
  LoadingController,
  ToastController
} from '@ionic/angular';

import {
  Firestore, doc, updateDoc
} from '@angular/fire/firestore';

import { Auth } from '@angular/fire/auth';

import { Router } from '@angular/router';

@Component({
  selector: 'app-completar-cadastro',
  templateUrl: './completar-cadastro.page.html',
  styleUrls: ['./completar-cadastro.page.scss'],
  standalone: false
})

export class CompletarCadastroPage implements OnInit {

  cadastroForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private loading: LoadingController,
    private toast: ToastController,
    private firestore: Firestore,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(){

    this.cadastroForm = this.fb.group({

      telefone: ['',[Validators.required,
    Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],

      dataNascimento: ['', [Validators.required, 
        this.validarMaiorIdade]]
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

  
  validarMaiorIdade = ( control: AbstractControl ): ValidationErrors | null => {

    if(!control.value){
      return null;
    }

    const data = new Date(control.value);

    const hoje = new Date();

    let idade = hoje.getFullYear() - data.getFullYear();

    const mes = hoje.getMonth() - data.getMonth();

    if(mes < 0 ||(
        mes === 0 &&
        hoje.getDate() < data.getDate()
      )
    ){
      idade--;
    }

    return idade >= 18? null : { menorIdade: true };};


  async salvar(){

    if(this.cadastroForm.invalid){
      this.cadastroForm.markAllAsTouched();
      return;
    }

    const loading = await this.loading.create({message: 'Finalizando...'});

    await loading.present();

    try {

      const uid = this.auth.currentUser?.uid;

      if(!uid){
        throw new Error('Usuário não autenticado.');
      }

      const usuarioRef = doc(this.firestore, `Usuarios/${uid}`);

      await updateDoc(usuarioRef, {

        telefone: this.cadastroForm.value.telefone,
        dataNascimento:new Date(this.cadastroForm.value.dataNascimento + 'T00:00:00'),
        perfilCompleto: true
      });

      await loading.dismiss();

      this.presentToast('Cadastro concluído!', 'success');

      this.router.navigateByUrl('/dashboard');

    } catch(error){

      console.log(error);
      await loading.dismiss();

      this.presentToast('Erro ao finalizar cadastro.', 'danger');
    }
  }

  async presentToast(message: string, color: string){

    const toast =
      await this.toast.create({

        message,
        duration: 2000,
        color,
        position: 'top'
      });

    toast.present();
  }
}
