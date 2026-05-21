import { Injectable } from '@angular/core';

import{
  Firestore, doc,
   setDoc, getDoc} from '@angular/fire/firestore';

import { AuthServices } from './auth';



// ********************** USUÁRIO ***************************** //
export interface Usuario{
  id?: string,
  nome: string,
  email: string,
  senha: string,
  dataNascimento: Date | null,
  pontosFidelidade: number,
  chartedAt?: number
}



@Injectable({
  providedIn: 'root',
})

export class DataServices {

  constructor(
    private firestore: Firestore,
    private authServices: AuthServices
  ){}


  // ********************** USUÁRIO ***************************** //
  async addUsuario(usuario: Usuario){
    try {

      const uid = await this.authServices.Register(usuario.email, usuario.senha);

      const usuarioRef = doc(this.firestore, `Usuarios/${uid}`);

      await setDoc(usuarioRef,{
        id: uid,
        nome: usuario.nome,
        dataNascimento: usuario.dataNascimento,
        pontosFidelidade: 0,
        chartedAt: Date.now()
      })

      console.log('Usuário criado com sucesso');
      return true

    } catch (error) {
      console.log(error)
      return false
    }
  }


  async getUsuario(email: string, senha: string){
    try {

      const uid = await this.authServices.Login(email, senha);

      const usuarioRef = doc(this.firestore, `Usuarios/${uid}`);

      const usuarioLogin = await getDoc(usuarioRef);

      if(usuarioLogin.exists()){

        const dadosUsuario = usuarioLogin.data();

        localStorage.setItem(
          'usuario',
          JSON.stringify(dadosUsuario)
        );

        return dadosUsuario;
      }

      return null;

    } catch(error){
      console.log(error);
      throw error;
    }
  }


  // ********************** HÚMOR ***************************** //



}
