import { Injectable } from '@angular/core';

import {
  Firestore, doc, setDoc
} from '@angular/fire/firestore';

import {
  Storage, ref, uploadBytes, getDownloadURL
} from '@angular/fire/storage';

import { AuthServices } from './auth';


export interface Psicologo{
  id?: string,
  nome: string,
  email: string,
  senha: string,
  crp: string,
  estadoCrp: string,
  especialidades: string[],
  descricao: string,
  fotoPerfil?: string,
  documentoUrl?: string,
  aprovado?: boolean,
  createdAt?: number
}


@Injectable({
  providedIn: 'root',
})
export class PsicologoServices {

  constructor(
    private authServices: AuthServices,
    private firestore: Firestore,
    private storage: Storage
  ){}

  async addPsicologo( psicologo: Psicologo,arquivo: File){

    try{

      const uid = await this.authServices.Register(psicologo.email, psicologo.senha);

      // 2 - upload documento
      const caminho =
        `documentos-psicologos/${uid}`;

      const storageRef =
        ref(this.storage, caminho);

      await uploadBytes(storageRef, arquivo);

      // 3 - pega URL documento
      const documentoUrl =
        await getDownloadURL(storageRef);

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
          descricao: psicologo.descricao,
          documentoUrl,
          aprovado: false,
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
}
