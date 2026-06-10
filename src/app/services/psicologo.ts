import { Injectable } from '@angular/core';

import {
  Firestore, collection, collectionData, doc, docData, getDoc, query, setDoc,
  where
} from '@angular/fire/firestore';

import { AuthServices } from './auth';

export interface Psicologo{
  id?: string,
  nome: string,
  email: string,
  senha: string,
  crp: string,
  estadoCrp: string,
  especialidades: string[],
  bio: string,
  telefone: string,
  valorConsulta: number
  fotoPerfil?: string,
  aprovado?: boolean,
  createdAt?: Date
}

@Injectable({
  providedIn: 'root',
})
export class PsicologoServices {

  
  constructor(
    private authServices: AuthServices,
    private firestore: Firestore,
  ){}



  async addPsicologo( psicologo: Psicologo){

    try{

      const uid = await this.authServices.Register(psicologo.email, psicologo.senha);

      const psicologoRef = doc(this.firestore, `Psicologos/${uid}`);

      // 4 - salva firestore
      await setDoc(psicologoRef,
        {
          id: uid,
          nome: psicologo.nome,
          email: psicologo.email,
          crp: psicologo.crp,
          estadoCrp: psicologo.estadoCrp,
          especialidades: psicologo.especialidades,
          bio: psicologo.bio,
          valorConsulta: psicologo.valorConsulta,
          aprovado: false,
          telefone: psicologo.telefone,
          createdAt: Date.now()
        }
      );

      console.log('Usuário criado com sucesso')
      return true

    }catch(error){
      console.log(error)
      return false
    }
  }



  async loginPsicologo(email: string, senha: string){

    try {

      const uid = await this.authServices.Login(email, senha);

      const psicologoRef = doc( this.firestore, `Psicologos/${uid}`);

      const psicologoSnap = await getDoc(psicologoRef);

      // EXISTE?

      if(!psicologoSnap.exists()){
        throw new Error(
          'Psicólogo não encontrado'
        );
      }

      const dadosPsicologo = psicologoSnap.data();

      // APROVADO?

      if(!dadosPsicologo['aprovado']){
        throw new Error(
          'Cadastro ainda não aprovado'
        );
      }
      // SALVA LOCAL
      localStorage.setItem(
        'psicologo',
        JSON.stringify(dadosPsicologo)
      );

      return dadosPsicologo;

    } catch(error){

      console.log(error);
      throw error;
    }
  }


  listarPsicologos(){

    const psicologosRef = collection(this.firestore, 'Psicologos');

    const q = query(psicologosRef, where('aprovado', '==', true));

    return collectionData(q, { idField: 'id' });
  }

  buscarPsicologo(id: string){

    const docRef = doc( this.firestore,`Psicologos/${id}`);

    return docData(docRef, { idField: 'id' });
  }
  


  async atualizarPsicologo( id: string, 
    dados: Partial<Psicologo> ): Promise<boolean>{

    try{

      const psicologoRef = doc(
        this.firestore,
        `Psicologos/${id}`
      );

      await setDoc( psicologoRef, dados, { merge: true });

      return true;

    }catch(error){

      console.log('Erro ao atualizar psicólogo:', error);

      return false;

    }

  }
}
