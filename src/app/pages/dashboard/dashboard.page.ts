import { Component, OnInit } from '@angular/core';
import { AppComponent } from 'src/app/app.component';
import { ConsultaServices } from 'src/app/services/consulta';
import { HumorServices } from 'src/app/services/humor';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false
})
export class DashboardPage implements OnInit {

  usuario: any;

  quantidadeConsultas = 0;
  consultasProximas: any[] = [];

  humorRegistrado = false
  mensagemHumor: string = '';

  constructor(

    private humorServices: HumorServices,
    private app: AppComponent,
    private consultaServices: ConsultaServices
  ) { }

  async ngOnInit() {
    
    
    this.app.carregarUsuario()

    const usuarioStorage = localStorage.getItem('usuario')

    if(usuarioStorage){
      this.usuario = JSON.parse(usuarioStorage);

      this.humorRegistrado = await this.humorServices.verificarHumorHoje(this.usuario.id);

      this.carregarConsultas()
    
      const humorHoje = await this.humorServices.getHumorHoje(this.usuario.id);

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

        return ((c.status === 'pendente' ||
          c.status === 'confirmada') &&
          dataConsulta.toDateString() > agora.toDateString()
        );

      });

      this.quantidadeConsultas = consultasAtivas.length;

      this.consultasProximas =
        consultasAtivas.sort((a, b) =>
          new Date(a.dataConsulta).getTime() -
          new Date(b.dataConsulta).getTime()).slice(0, 3);
    });
  }
}
