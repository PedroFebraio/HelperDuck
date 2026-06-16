import { Injectable } from '@angular/core';
import { collection, collectionData, doc, docData, Firestore, getDoc, getDocs, query, setDoc, updateDoc, where } from '@angular/fire/firestore';


export interface Consulta{
  
  id?: string;
  usuarioId: string;
  usuarioNome: string;
  psicologoId: string;
  psicologoNome: string;
  dataConsulta: string;
  valorConsulta: number;
  status: | 'pendente'
    | 'confirmada'
    | 'finalizada'
    | 'cancelada';
  salaVideo?: string;
  checkinUsuario?: boolean;
  checkinPsicologo?: boolean;
  presencaUsuario?: boolean;
  presencaPsicologo?: boolean;
  horaEntradaUsuario?: string;
  horaEntradaPsicologo?: string;
  horaSaidaUsuario?: string;
  horaSaidaPsicologo?: string;
  iniciada?: boolean;
  finalizada?: boolean;
  duracaoConsulta?: number;
  duracaoReal?: number;
  avaliacao?: number;
  comentario?: string;
  createdAt?: number;
  offer?: any;
  answer?: any;
  iceCandidatesOferta?: any[];
  iceCandidatesResposta?: any[];
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



  listarConsultasUsuario(usuarioId: string){

    const consultasRef =
      collection(this.firestore, 'Consultas');

    const q = query(
      consultasRef,
      where('usuarioId', '==', usuarioId)
    );

    return collectionData(q, {
      idField: 'id'
    });
  }



   async atualizarStatus(consultaId: string, status: Consulta['status']){

    try{

      const consultaRef = doc(this.firestore, `Consultas/${consultaId}`);

      await updateDoc(consultaRef, { status });

      return true;

    }catch(error){

      console.log(error);

      return false;
    }
  }



  async verificarConsultaAtiva(usuarioId: string, psicologoId: string){

    try{

      const consultasRef = collection(this.firestore, 'Consultas');

      const q = query(consultasRef, where('usuarioId', '==', usuarioId),
        where('psicologoId', '==', psicologoId));

      const resultado = await getDocs(q);

      let possuiConsultaAtiva = false;

      resultado.forEach((doc) => {
        const consulta = doc.data();

        if(consulta['status'] === 'pendente' ||
          consulta['status'] === 'confirmada'){

          possuiConsultaAtiva = true;
        }
      });

      return possuiConsultaAtiva;

    }catch(error){
      console.log(error);

      return false;
    }
  }



  async atualizarConsulta(consultaId: string, dados: any){

    try{

      const consultaRef = doc(this.firestore, `Consultas/${consultaId}`);

      await updateDoc(consultaRef, dados);

      return true;

    }catch(error){

      console.log(error);

      return false;
    }
  }



  async buscarConsultaPorId(id: string){

    try{

      const consultaRef = doc(this.firestore, `Consultas/${id}`);

      const consultaSnap = await getDoc(consultaRef);

      if(consultaSnap.exists()){
        return consultaSnap.data();
      }

      return null;

    }catch(error){

      console.log(error);

      return null;
    }
  }


  escutarConsulta(id: string){

    const consultaRef = doc(
      this.firestore,
      `Consultas/${id}`
    );

    return docData(
      consultaRef,
      { idField: 'id' }
    );
  }


  async salvarOffer(consultaId: string, offer: any){

    return await this.atualizarConsulta(
      consultaId,
      { offer }
    );
  }



  async salvarAnswer(consultaId: string, answer: any){

    return await this.atualizarConsulta(
      consultaId,
      { answer }
    );
  }



  async limparWebRTC(consultaId: string){

    return await this.atualizarConsulta(
      consultaId,
      {

        offer: null,

        answer: null,

        iceCandidates: []

      }
    );
  }




  async salvarIceOferta(consultaId: string, candidatos: any[]){

    return await this.atualizarConsulta(
      consultaId,
      {
        iceCandidatesOferta: candidatos
      }
    );
  }


  async salvarIceResposta(consultaId: string, candidatos: any[]){

    return await this.atualizarConsulta(
      consultaId,
      {
        iceCandidatesResposta: candidatos
      }
    );
  }
}
