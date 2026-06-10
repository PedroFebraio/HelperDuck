import { Injectable } from '@angular/core';

import{
  Firestore, doc ,getDoc, setDoc} from '@angular/fire/firestore';

export interface Humor {
  id?: string;
  idUsuario: string;
  humor: 'bem' | 'neutro' | 'mal';
  data: string;
  createdAt: number;
}



@Injectable({
  providedIn: 'root',
})


export class HumorServices {
  
  constructor(
      private firestore: Firestore
    ){}



  async addHumor( idUsuario: string, humor: 'bem' | 'neutro' | 'mal'){

    const hoje = new Date().toISOString().split('T')[0];

    const idDocumento =`${idUsuario}_${hoje}`;

    const humorRef = doc(this.firestore,`Humores/${idDocumento}`);

    await setDoc(humorRef, {
      idUsuario,
      humor,
      data: hoje,
      createdAt: Date.now()
    });

    return humor
  }


  async verificarHumorHoje(idUsuario: string){

    const hoje = new Date().toISOString().split('T')[0];

    const idDocumento =`${idUsuario}_${hoje}`;

    const humorRef = doc(this.firestore,`Humores/${idDocumento}`);

    const humorCapt = await getDoc(humorRef);

    return humorCapt.exists();
  }




  async getHumorHoje(idUsuario: string){

    const hoje = new Date().toISOString().split('T')[0];

    const idDocumento =`${idUsuario}_${hoje}`;

    const humorRef = doc(this.firestore,`Humores/${idDocumento}`);

    const humorSnap = await getDoc(humorRef);

    if(humorSnap.exists()){
      return humorSnap.data();
    }

    return null;
  }
}
