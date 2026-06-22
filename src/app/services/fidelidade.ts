import { Injectable } from '@angular/core';
import { DataServices } from './data';
import { HistoricoFidelidadeServices } from './historico-fidelidade';



export interface Beneficio {

  tipo: 'cupom10' | 'cupom25' | 'consultaGratis';
  descricao: string;
  pontosNecessarios: number;
}

@Injectable({
  providedIn: 'root',
})
export class FidelidadeServices {

  readonly PONTOS_CUPOM10 = 300;
  readonly PONTOS_CUPOM25 = 700;
  readonly PONTOS_CONSULTA_GRATUITA = 1000;

  constructor(
    private dataServices: DataServices,
    private historicoFidelidadeServices:
    HistoricoFidelidadeServices
  ){ }


  async adicionarPontos(
    usuarioId: string,
    pontos: number
  ) {

    try {

      const usuario =
        await this.dataServices.buscarUsuario(
          usuarioId
        );

      if (!usuario) {

        return false;

      }

      usuario.pontosFidelidade =
        (usuario.pontosFidelidade || 0)
        + pontos;

      await this.dataServices.atualizarUsuario(
        usuarioId,
        usuario
      );

      await this.historicoFidelidadeServices
      .registrarMovimentacao({

        usuarioId,

        dataMovimentacao:
          new Date().toISOString(),

        tipo: 'ganho',

        descricao: 'Consulta realizada',

        pontos

      });

      return true;

    } catch (error) {

      console.log(error);

      return false;

    }

  }


  async removerPontos(
    usuarioId: string,
    pontos: number
  ){

    try{

      const usuario =
        await this.dataServices.buscarUsuario(usuarioId);

      if(!usuario){
        return false;
      }

      if((usuario.pontosFidelidade || 0) < pontos){
        return false;
      }

      usuario.pontosFidelidade =
        (usuario.pontosFidelidade || 0) - pontos;

      await this.dataServices.atualizarUsuario(
        usuarioId,
        usuario
      );

      return true;

    }catch(error){

      console.log(error);

      return false;
    }
  }



  async resgatarCupom10(usuarioId: string){

    const sucesso =
      await this.removerPontos(
        usuarioId,
        this.PONTOS_CUPOM10
      );

    if(!sucesso){
      return false;
    }

    const usuario =
      await this.dataServices.buscarUsuario(usuarioId);

    if(!usuario){
      return false;
    }

    usuario.cupons10 =
      (usuario.cupons10 || 0) + 1;

    await this.dataServices.atualizarUsuario(
      usuarioId,
      {
        cupons10: usuario.cupons10
      }
    );

    await this.historicoFidelidadeServices
      .registrarMovimentacao({

        usuarioId,

        dataMovimentacao:
          new Date().toISOString(),

        tipo: 'resgate',

        descricao: 'Cupom de desconto de 10%',

        pontos: this.PONTOS_CUPOM10

      });

    return true;
  }



  async resgatarCupom25(usuarioId: string){

    const sucesso =
      await this.removerPontos(
        usuarioId,
        this.PONTOS_CUPOM25
      );

    if(!sucesso){
      return false;
    }

    const usuario =
      await this.dataServices.buscarUsuario(usuarioId);

    if(!usuario){
      return false;
    }

    usuario.cupons25 =
      (usuario.cupons25 || 0) + 1;

    await this.dataServices.atualizarUsuario(
      usuarioId,
      {
        cupons25: usuario.cupons25
      }
    );

    await this.historicoFidelidadeServices
      .registrarMovimentacao({

        usuarioId,

        dataMovimentacao:
          new Date().toISOString(),

        tipo: 'resgate',

        descricao: 'Cupom de desconto de 25%',

        pontos: this.PONTOS_CUPOM25

      });

    return true;
  }




  async resgatarConsultaGratis(
    usuarioId: string
  ){

    const sucesso =
      await this.removerPontos(
        usuarioId,
        this.PONTOS_CONSULTA_GRATUITA
      );

    if(!sucesso){
      return false;
    }

    const usuario =
      await this.dataServices.buscarUsuario(
        usuarioId
      );

    if(!usuario){
      return false;
    }

    usuario.consultasGratis =
      (usuario.consultasGratis || 0) + 1;

    await this.dataServices.atualizarUsuario(
      usuarioId,
      {
        consultasGratis:
        usuario.consultasGratis
      }
    );

    await this.historicoFidelidadeServices
      .registrarMovimentacao({

        usuarioId,

        dataMovimentacao:
          new Date().toISOString(),

        tipo: 'resgate',

        descricao: 'Consulta gratuita',

        pontos:
          this.PONTOS_CONSULTA_GRATUITA

      });

    return true;
  }



  async buscarPontos(usuarioId: string){

    const usuario =
      await this.dataServices.buscarUsuario(
        usuarioId
      );

    return usuario?.pontosFidelidade || 0;
  }



  async buscarBeneficios(
    usuarioId: string
  ){

    const usuario =
      await this.dataServices.buscarUsuario(
        usuarioId
      );

    if(!usuario){
      return null;
    }

    return {

      cupom10:
        usuario.cupons10 || 0,

      cupom25:
        usuario.cupons25 || 0,

      consultaGratis:
        usuario.consultasGratis || 0

    };
  }
}
