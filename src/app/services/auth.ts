import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
 signOut, GoogleAuthProvider, signInWithPopup,
 GithubAuthProvider} from '@angular/fire/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Firestore } from '@angular/fire/firestore';
 
@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  
  constructor(
    private auth: Auth,
    private firestore: Firestore
){}

//********************************* USUÁRIO ******************************** */
  async Register(email: string, senha: string){
    
    try {
    
      const novoUser = await createUserWithEmailAndPassword(
        this.auth, email, senha
      )

      const uid = novoUser.user.uid;
      return String(uid)
    
    }catch(error){

      return console.log(error);
    }
  }


  async Login(email: string, senha: string){
    
    try {
    
      const User = await signInWithEmailAndPassword(
        this.auth, email, senha
      )

      const uid = User.user.uid;
      return String(uid)
    
    }catch(error){

      return console.log(error);
    }
  }  


  async loginWithGoogle(){

    try {

      const provider = new GoogleAuthProvider();
      const novoUser = await signInWithPopup(
        this.auth,
        provider
      );

      const user = novoUser.user;

      const usuarioRef = doc(
        this.firestore,
        `Usuarios/${user.uid}`
      );

      // Verifica se já existe
      const usuarioLogin = await getDoc(usuarioRef);

      // Se NÃO existir, cria
      if(!usuarioLogin.exists()){

        await setDoc(usuarioRef, {
          id: user.uid,
          nome: user.displayName,
          foto: user.photoURL,
          pontosFidelidade: 0,
          createdAt: Date.now()
        });
      }

      // Busca os dados finais
      const dadosUsuario = (await getDoc(usuarioRef)).data();
      
      localStorage.setItem('usuario', JSON.stringify(dadosUsuario))
      return dadosUsuario;

    } catch(error){
      return console.log(error);
    }
  }


  async loginWithGitHub(){

    try {

      const provider = new GithubAuthProvider();
      const novoUser = await signInWithPopup(
        this.auth,
        provider
      );

      const user = novoUser.user;

      const usuarioRef = doc(
        this.firestore,
        `Usuarios/${user.uid}`
      );

      // Verifica se já existe
      const usuarioLogin = await getDoc(usuarioRef);

      // Se NÃO existir, cria
      if(!usuarioLogin.exists()){

        await setDoc(usuarioRef, {
          id: user.uid,
          nome: user.displayName,
          foto: user.photoURL,
          pontosFidelidade: 0,
          createdAt: Date.now()
        });
      }

      // Busca os dados finais
      const dadosUsuario = (await getDoc(usuarioRef)).data();
      
      localStorage.setItem('usuario', JSON.stringify(dadosUsuario))
      return dadosUsuario;

    } catch(error){
      return console.log(error);
    }
  }


  async logout(){

    await signOut(this.auth);
    // localStorage.removeItem('usuario');
  
  }  
}