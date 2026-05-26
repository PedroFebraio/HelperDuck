import { Injectable } from '@angular/core';

import {
  Firestore, collection, collectionData, doc, setDoc, 
  deleteDoc, getDoc, query, updateDoc, where} from '@angular/fire/firestore';

  import { AuthServices } from './auth';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(
    private firestore: Firestore,
    private authServices: AuthServices,
  ) {}


  listarPsicologosPendentes(){

    const psicologosRef = collection(this.firestore, 'Psicologos');

    const q = query( psicologosRef, where('aprovado', '==', false));

    return collectionData(q, { idField: 'id' });
  }


  async getAdmin(email: string, senha: string){
    try {

      const uid = await this.authServices.Login(email, senha);
    
      const adminRef = doc(this.firestore, `Admins/${uid}`);
      
      const adminSnap = await getDoc(adminRef);

      if(adminSnap.exists()){

        const dadosAdmin = adminSnap.data()

        console.log('Admin logado');

        localStorage.setItem(
          'admin',
          JSON.stringify(dadosAdmin)
        )

        return dadosAdmin
      } 

      return null;
    
    } catch(error){
      console.log(error);
      throw error;
    }
  }


  async aprovarPsicologo(psicologo: any){

    try {
    
      const docRef = doc(this.firestore, `Psicologos/${psicologo.id}`);

      await updateDoc(docRef, {
        aprovado: true
      });
      
      console.log('Aprovado')
      return true
    
    } catch (error) {
      console.log('Erro ao aprovar')
      return false
    }

    
  }

  async removerPsicologo(psicologo: any){

    try {
    
      const docRef = doc(this.firestore, `Psicologos/${psicologo.id}`);
  
      await deleteDoc(docRef);
  
      console.log('Deletado')
      return true
    
    } catch (error) {
      console.log('Erro ao Deletar')
      return false
    }
    
  }
}