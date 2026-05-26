import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword,
 signOut, GoogleAuthProvider, signInWithPopup, signInWithCredential} from '@angular/fire/auth';
import { doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { Capacitor } from '@capacitor/core';
import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
 
@Injectable({
  providedIn: 'root',
})
export class AuthServices {
  
  
  novoUser: any;


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

    if (Capacitor.getPlatform() === 'web') {
      const provider = new GoogleAuthProvider();
      this.novoUser = await signInWithPopup(this.auth, provider);
    }
    else {
      const result =await FirebaseAuthentication.signInWithGoogle();

      // TOKEN
      const token = result.credential?.idToken;

      if (!token) {
        throw new Error('Não foi possível obter o idToken do Google.');
      }

      // CREDENTIAL
      const credential = GoogleAuthProvider.credential(token);

      // FIREBASE LOGIN
      this.novoUser = await signInWithCredential(this.auth, credential);
    }

    const user = this.novoUser.user;

    const usuarioRef = doc(this.firestore, `Usuarios/${user.uid}`);

    // VERIFICA SE EXISTE
    const usuarioLogin = await getDoc(usuarioRef);

    // CRIA USUÁRIO
    if(!usuarioLogin.exists()){

      await setDoc(usuarioRef, {

        id: user.uid,
        nome: user.displayName,
        email: user.email,
        telefone: '',
        foto: user.photoURL,
        dataNascimento: null,
        pontosFidelidade: 0,
        consultaGratisUsada: false,
        perfilCompleto: false,
        provider: 'google',
        createdAt: Date.now()

      });
    }

    // BUSCA DADOS
    const dadosUsuario = (await getDoc(usuarioRef)).data();

    localStorage.setItem(
      'usuario',
      JSON.stringify(dadosUsuario)
    );

    return dadosUsuario;

  } catch(error: any){

    console.log(error);

    return null;
  }
}


  async logout(){

    await signOut(this.auth);
    // localStorage.removeItem('usuario');
  
  }  
}