import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ToastController } from '@ionic/angular';
import { DataServices, Usuario } from 'src/app/services/data';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false
})
export class RegisterPage implements OnInit {
  
  cadastroForm!: FormGroup;

  constructor(
    private router: Router,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private dataServices: DataServices,
    private fb: FormBuilder
  ) { }

  
  ngOnInit(){

    this.cadastroForm = this.fb.group({

      nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      
      telefone: ['',[Validators.required,
    Validators.pattern(/^\(\d{2}\)\s\d{4,5}-\d{4}$/)]],
      
      dataNascimento: ['', [Validators.required, 
      this.validarMaiorIdade]],
      
      senha: ['', [Validators.required, Validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/ )]]
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

  
  validarMaiorIdade(control: any){

    const data = new Date(control.value);
    const hoje = new Date();

    let idade = hoje.getFullYear() - data.getFullYear();

    const mes = hoje.getMonth() - data.getMonth();

    if(mes < 0 ||(mes === 0 && hoje.getDate() < data.getDate()))
      {idade--;}

    return idade >= 18? null: { menorIdade: true };
  }


  async cadastrar(){

    
    if(this.cadastroForm.invalid){
      this.cadastroForm.markAllAsTouched();
  
      this.presentToast('Preencha os campos corretamente.','warning');

      return;
    }

    const loading = await this.loadingCtrl.create({message: 'Cadastrando...'})
    await loading.present();

    try {

      const usuario: Usuario = {

        nome: this.cadastroForm.value.nome,
        email: this.cadastroForm.value.email,
        telefone: this.cadastroForm.value.telefone,
        senha: this.cadastroForm.value.senha,
        dataNascimento: new Date(this.cadastroForm.value.dataNascimento + 'T00:00:00'),
      };

      const user = await this.dataServices.addUsuario(usuario)

      await loading.dismiss();

      if(user){

        this.presentToast('Cadastro realizado com sucesso! ', 'success');
        this.cadastroForm.reset();
        
        this.router.navigateByUrl('/login');
      }
    } catch (error: any) {

      await loading.dismiss();
      this.presentToast('Erro ao cadastrar: ' + error.message, 'danger')

      let mensagem ='Erro ao cadastrar usuário.';


      // FIREBASE AUTH
      if(
        error.code === 'auth/email-already-in-use')
        {mensagem = 'Este e-mail já está em uso.';}

      if(error.code === 'auth/weak-password')
        {mensagem = 'Senha muito fraca.';}

      if(error.code === 'auth/invalid-email')
        {mensagem ='E-mail inválido.';}

      this.presentToast( mensagem, 'danger');
    }

  }


  async presentToast(message: string, color: string = 'primary'){

    const toast = await this.toastCtrl.create({

      message,
      duration:2000,
      color,
      position: 'top'
    });

    toast.present();
  }
}
