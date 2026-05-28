import { Injectable } from '@angular/core';

import {
  Firestore, doc, setDoc, getDoc
} from '@angular/fire/firestore';


export interface Agenda {

  diasDisponiveis: string[];
  horarioInicio: string;
  horarioFim: string;
  duracaoConsulta: number;
  ativo: boolean;
}


@Injectable({
  providedIn: 'root'
})

export class AgendaServices {

  constructor(
    private firestore: Firestore
  ) {}


  // SALVAR AGENDA

  async salvarAgenda( psicologoId: string, agenda: Agenda): Promise<boolean>{

    try{

      const agendaRef = doc(this.firestore, 
        `AgendaPsicologos/${psicologoId}`);

      await setDoc(agendaRef, {
        psicologoId,
        ...agenda,
        updateAt: Date.now()
      });

      return true;

    }catch(error){

      console.log(
        'Erro ao salvar agenda:',
        error
      );

      return false;
    }
  }


  // BUSCAR AGENDA

  async buscarAgenda(
    psicologoId: string): Promise<Agenda | null>{

    try{

      const agendaRef = doc(this.firestore,
        `AgendaPsicologos/${psicologoId}`
      );

      const agendaSnap = await getDoc(agendaRef);

      if(agendaSnap.exists()){

        return agendaSnap.data() as Agenda;
      }

      return null;

    }catch(error){

      console.log('Erro ao buscar agenda:',
        error
      );

      return null;
    }
  }
}