import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ConsultaServices } from 'src/app/services/consulta';
import { FidelidadeServices } from 'src/app/services/fidelidade';
import { HumorServices } from 'src/app/services/humor';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  usuario: any;

  pontos = 0
  psicologosAtendidos = 0;
  quantidadeConsultas = 0;
  consultasProximas: any[] = [];
  consultasRealizadas = 0;
  taxaContinuidade = 0;
  historicoRecente:any[] = [];

  humorRegistrado = false
  mensagemHumor: string = '';
  saudacao = '';


  mensagens = [
  'Cada passo importa 🌱',
  'Você está cuidando de si mesmo 💛',
  'Pequenos avanços são grandes conquistas 🦆',
  'Continue sua jornada, você está indo bem ✨'
  ];

  mensagemMotivacional = '';

  constructor(

    private humorServices: HumorServices,
    private app: AppComponent,
    private consultaServices: ConsultaServices,
    private fidelidadeServices: FidelidadeServices
  ) { }

  async ngOnInit() {
    
    
    this.app.carregarUsuario()

    const usuarioStorage = localStorage.getItem('usuario')

    
    if(usuarioStorage){
      this.usuario = JSON.parse(usuarioStorage);

      this.humorRegistrado = await this.humorServices.verificarHumorHoje(this.usuario.id);
    
      await this.carregarConsultas()
    
      const humorHoje = await this.humorServices.getHumorHoje(this.usuario.id);

      this.pontos =
        await this.fidelidadeServices.buscarPontos(
          this.usuario.id
        );

      if(humorHoje){

        this.humorRegistrado = true;

        if(humorHoje['humor'] === 'bem'){

          this.mensagemHumor =
            'Que ótimo saber que você está bem 😊';
        }

        else if(humorHoje['humor'] === 'neutro'){

          this.mensagemHumor =
            'Dias neutros também fazem parte da jornada 💛';
        }

        else if(humorHoje['humor'] === 'mal'){

          this.mensagemHumor =
            'Você não precisa enfrentar tudo sozinho 🫂';
        }
      }

      const hora = new Date().getHours();

      if(hora < 12){

        this.saudacao = 'Bom dia';

      }
      else if(hora < 18){

        this.saudacao = 'Boa tarde';

      }
      else{

        this.saudacao = 'Boa noite';

      }

      this.mensagemMotivacional =
      this.mensagens[
      Math.floor(
      Math.random() *
      this.mensagens.length
      )
      ];
    }
  }
  
  
  
  async selecionarHumor(humor: 'bem' | 'neutro' | 'mal'){

    const humorClick = await this.humorServices.addHumor(this.usuario.id, humor);


    if(humorClick){

      this.humorRegistrado = true;

      if(humor === 'bem'){

        this.mensagemHumor =
          'Que ótimo saber que você está bem 😊';

      } else if(humor === 'neutro'){

        this.mensagemHumor =
          'Dias neutros também fazem parte da jornada 💛';

      } else {

        this.mensagemHumor =
          'Você não precisa enfrentar tudo sozinho 🫂';
      }
    }
  }
  


  carregarConsultas() {

    this.consultaServices
      .listarConsultasUsuario(this.usuario.id)
      .subscribe((consultas: any[]) => {

      const agora = new Date();

      const consultasAtivas = consultas.filter(c => {

        const dataConsulta = new Date(c.dataConsulta);

        return (
          c.status === 'pendente' ||
          (
            c.status === 'confirmada' &&
            (
              dataConsulta >= agora ||
              !c.finalizada
            )
          )
        );
      });
      this.consultasRealizadas =
        consultas.filter(c =>
        c.status === 'finalizada').length;

      this.quantidadeConsultas = consultasAtivas.length;

      const psicologosUnicos = [
        ...new Set(
          consultas
            .filter(c => c.status === 'finalizada')
            .map(c => c.psicologoId)
        )
      ];

        this.psicologosAtendidos =
        psicologosUnicos.length;


      if(consultas.length > 0){

        this.taxaContinuidade = Math.round(
          this.consultasRealizadas * 100 /
          consultas.length
        );

      }

      this.historicoRecente = [...consultas]
      .filter(c => c.status === 'finalizada')
      .sort((a,b)=>
        new Date(b.dataConsulta).getTime() -
        new Date(a.dataConsulta).getTime())
      .slice(0,3);


      this.consultasProximas =
        consultasAtivas.sort((a, b) =>
          new Date(a.dataConsulta).getTime() -
          new Date(b.dataConsulta).getTime()).slice(0, 5);
    });
  }
}
