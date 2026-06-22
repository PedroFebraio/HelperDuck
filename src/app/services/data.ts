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
  telefone: string,
  senha: string,
  dataNascimento: Date | null,
  pontosFidelidade?: number,
  consultasGratis?: number,
  cupons10?: number,
  cupons25?: number,
  chartedAt?: Date
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
        email: usuario.email,
        telefone: usuario.telefone,
        dataNascimento: usuario.dataNascimento,
        pontosFidelidade: 0,
        consultasGratis: 1,
        cupons10: 0,
        cupons25: 0,
        chartedAt: Date.now()
      });

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


  async buscarUsuario(id: string){

    try{

      const usuarioRef =
        doc(this.firestore, `Usuarios/${id}`);

      const usuarioSnap =
        await getDoc(usuarioRef);

      if(usuarioSnap.exists()){

        return usuarioSnap.data() as Usuario;
      }

      return null;

    }catch(error){

      console.log(error);

      return null;
    }
  }



  async atualizarUsuario(id: string, usuario: Partial<Usuario>){

    try{

      const usuarioRef =
        doc(this.firestore, `Usuarios/${id}`);

      await setDoc(
        usuarioRef,
        usuario,
        { merge: true }
      );

      return true;

    }catch(error){

      console.log(error);

      return false;
    }
  }
}
