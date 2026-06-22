import { Injectable } from '@angular/core';

import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  collectionData
} from '@angular/fire/firestore';

import { Observable } from 'rxjs';

export interface HistoricoFidelidade {

  id?: string;
  usuarioId: string;
  dataMovimentacao?: string;
  tipo: 'ganho' | 'resgate';
  descricao: string;
  pontos: number;
}

@Injectable({
  providedIn: 'root',
})
export class HistoricoFidelidadeServices {
  
  constructor(
    private firestore: Firestore
  ){}



  async registrarMovimentacao(
    historico: HistoricoFidelidade
  ){

    try{

      const historicoRef = collection(
        this.firestore,
        'HistoricoFidelidade'
      );

      await addDoc(
        historicoRef,
        historico
      );

      return true;

    }catch(error){

      console.log(error);

      return false;

    }

  }



  listarHistoricoUsuario(usuarioId: string): Observable<HistoricoFidelidade[]> {

  const historicoRef = collection(
    this.firestore,
    'HistoricoFidelidade'
  );

  const q = query(
    historicoRef,
    where('usuarioId', '==', usuarioId)
  );

  return collectionData(
    q,
    { idField: 'id' }
  ) as Observable<HistoricoFidelidade[]>;

}

}
