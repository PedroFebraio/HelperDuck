import { Injectable } from '@angular/core';

import {
  addDoc,
  collection,
  collectionData,
  Firestore,
  getDocs,
  query,
  where
} from '@angular/fire/firestore';

export interface Avaliacao{

  id?: string;
  consultaId: string;
  usuarioId: string;
  usuarioNome: string;
  psicologoId: string;
  psicologoNome: string;
  avaliador: 'usuario' | 'psicologo';
  avaliado: 'usuario' | 'psicologo';
  nota: number;
  comentario: string;
  dataAvaliacao: string;
}

@Injectable({
  providedIn: 'root',
})
export class AvalicaoServices {


  constructor(
    private firestore: Firestore
  ){}



  async salvarAvaliacao(avaliacao: Avaliacao){

    try{

      await addDoc(
        collection(this.firestore,'Avaliacoes'),
        avaliacao
      );

      return true;

    }catch(error){

      console.log(error);

      return false;
    }
  }


  
  buscarAvaliacoesPsicologo(psicologoId:string){

    const q = query(

      collection(this.firestore,'Avaliacoes'),

      where(
        'psicologoId',
        '==',
        psicologoId
      ),

      where(
        'avaliado',
        '==',
        'psicologo'
      )

    );

    return collectionData(
      q,
      { idField:'id' }
    );

  }



  buscarAvaliacoesUsuario(usuarioId:string){

    const q = query(

      collection(this.firestore,'Avaliacoes'),

      where(
        'usuarioId',
        '==',
        usuarioId
      ),

      where(
        'avaliado',
        '==',
        'usuario'
      )

    );

    return collectionData(
      q,
      { idField:'id' }
    );

  }
  



  async buscarMinhaAvaliacao(
  consultaId: string,
  avaliador: 'usuario' | 'psicologo'
  ){

    try{

      const q = query(

        collection(this.firestore, 'Avaliacoes'),

        where(
          'consultaId',
          '==',
          consultaId
        ),

        where(
          'avaliador',
          '==',
          avaliador
        )

      );

      const resultado = await getDocs(q);

      if(!resultado.empty){

        return resultado.docs[0].data();

      }

      return null;

    }catch(error){

      console.log(error);

      return null;

    }

  }
}
