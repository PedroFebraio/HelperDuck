import { Injectable } from '@angular/core';
import { collection, collectionData, doc, Firestore, query, setDoc, updateDoc, where } from '@angular/fire/firestore';


export interface Consulta{
  
  id?: string;
  usuarioId: string;
  usuarioNome: string;
  psicologoId: string;
  psicologoNome: string;
  dataConsulta: string;
  valorConsulta: number;
  status: string;
  observacoes?: string;
  createdAt?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ConsultaServices {
  
  constructor(
    private firestore: Firestore
  ) {}

  async addConsulta(consulta: Consulta){

    try {

      const id = crypto.randomUUID();

      const consultaRef = doc(this.firestore, `Consultas/${id}`);

      await setDoc(consultaRef, {
        id,
        ...consulta,
        status: 'pendente',
        createdAt: Date.now()
      });

      console.log('Consulta criada com sucesso!');
      return true;

    } catch(error){

      console.log('Erro ao criar consulta:', error);
      return false;
    }
  }


  listarConsultasPsicologo(psicologoId: string){

    const consultasRef =
      collection(this.firestore, 'Consultas');

    const q = query(consultasRef,
      where('psicologoId', '==', psicologoId));

    return collectionData(q, { idField: 'id' });
  }


   async atualizarStatus(consultaId: string, status: string){

    try{

      const consultaRef = doc(this.firestore, `Consultas/${consultaId}`);

      await updateDoc(consultaRef, { status });

      return true;

    }catch(error){

      console.log(error);

      return false;
    }
  }
}
