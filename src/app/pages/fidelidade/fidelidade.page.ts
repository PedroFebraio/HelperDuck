import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController } from '@ionic/angular';
import { FidelidadeServices } from 'src/app/services/fidelidade';
import { HistoricoFidelidadeServices } from 'src/app/services/historico-fidelidade';

@Component({
  selector: 'app-fidelidade',
  templateUrl: './fidelidade.page.html',
  styleUrls: ['./fidelidade.page.scss'],
  standalone: false
})
export class FidelidadePage implements OnInit {

  usuario: any;

  pontos = 0;

  beneficios = {

    cupom10: 0,
    cupom25: 0,
    consultaGratis: 0

  };

  historico: any[] = [];

  constructor(
    private fidelidadeServices: FidelidadeServices,
    private historicoServices: HistoricoFidelidadeServices,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }


  async ngOnInit() {

    this.usuario = JSON.parse(
      localStorage.getItem('usuario') || '{}'
    );

    await this.carregarDados();
  }



  async carregarDados(){

    try{

      this.pontos =
        await this.fidelidadeServices.buscarPontos(
          this.usuario.id
        );

      const beneficios =
        await this.fidelidadeServices.buscarBeneficios(
          this.usuario.id
        );

      if(beneficios){

        this.beneficios = beneficios;

      }

      this.historicoServices
        .listarHistoricoUsuario(
          this.usuario.id
        )
        .subscribe({

          next: (dados:any[]) => {

            this.historico = [...dados]
            .sort((a,b)=>

              new Date(b.dataMovimentacao).getTime()
              -
              new Date(a.dataMovimentacao).getTime()

            )
            .slice(0,5);

            console.log("Historico:", this.historico);

          },

          error: async (error) => {

            console.log(error);

            await this.presentToast(
              'Erro ao carregar histórico.',
              'danger'
            );

          }

        });

    }catch(error){

      console.log(error);

      await this.presentToast(
        'Erro ao carregar dados.',
        'danger'
      );

    }

  }



  async presentToast(
    mensagem: string,
    cor: string
  ){

    try{

      const toast =
        await this.toastController.create({

          message: mensagem,

          duration: 2000,

          color: cor

        });

      await toast.present();

    }catch(error){

      console.log(error);

    }

  }





  async resgatarCupom10(){

    try{

      const alert =
        await this.alertController.create({

          header: 'Resgatar benefício',

          message:
          'Deseja trocar 300 pontos por um cupom de 10%?',

          buttons: [

            'Cancelar',

            {

              text: 'Resgatar',

              handler: async () => {

                try{

                  const sucesso =
                    await this.fidelidadeServices
                    .resgatarCupom10(
                      this.usuario.id
                    );

                  if(sucesso){

                    await this.presentToast(
                      'Cupom de 10% resgatado!',
                      'success'
                    );

                    await this.carregarDados();

                  }else{

                    await this.presentToast(
                      'Pontos insuficientes.',
                      'warning'
                    );

                  }

                }catch(error){

                  console.log(error);

                  await this.presentToast(
                    'Erro ao resgatar benefício.',
                    'danger'
                  );

                }

              }

            }

          ]

        });

      await alert.present();

    }catch(error){

      console.log(error);

      await this.presentToast(
        'Erro ao abrir confirmação.',
        'danger'
      );

    }

  }




  async resgatarCupom25(){

    try{

      const alert =
        await this.alertController.create({

          header: 'Resgatar benefício',

          message:
          'Deseja trocar 700 pontos por um cupom de 25%?',

          buttons: [

            'Cancelar',

            {

              text: 'Resgatar',

              handler: async () => {

                try{

                  const sucesso =
                    await this.fidelidadeServices
                    .resgatarCupom25(
                      this.usuario.id
                    );

                  if(sucesso){

                    await this.presentToast(
                      'Cupom de 25% resgatado!',
                      'success'
                    );

                    await this.carregarDados();

                  }else{

                    await this.presentToast(
                      'Pontos insuficientes.',
                      'warning'
                    );

                  }

                }catch(error){

                  console.log(error);

                  await this.presentToast(
                    'Erro ao resgatar benefício.',
                    'danger'
                  );

                }

              }

            }

          ]

        });

      await alert.present();

    }catch(error){

      console.log(error);

      await this.presentToast(
        'Erro ao abrir confirmação.',
        'danger'
      );

    }

  }





  async resgatarConsultaGratis(){

    try{

      const alert =
        await this.alertController.create({

          header: 'Resgatar benefício',

          message:
          'Deseja trocar 1000 pontos por uma consulta gratuita?',

          buttons: [

            'Cancelar',

            {

              text: 'Resgatar',

              handler: async () => {

                try{

                  const sucesso =
                    await this.fidelidadeServices
                    .resgatarConsultaGratis(
                      this.usuario.id
                    );

                  if(sucesso){

                    await this.presentToast(
                      'Consulta gratuita resgatada!',
                      'success'
                    );

                    await this.carregarDados();

                  }else{

                    await this.presentToast(
                      'Pontos insuficientes.',
                      'warning'
                    );

                  }

                }catch(error){

                  console.log(error);

                  await this.presentToast(
                    'Erro ao resgatar benefício.',
                    'danger'
                  );

                }

              }

            }

          ]

        });

      await alert.present();

    }catch(error){

      console.log(error);

      await this.presentToast(
        'Erro ao abrir confirmação.',
        'danger'
      );
    }
  }

}