import { Injectable } from "@angular/core";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
// auto login
import { BehaviorSubject } from "rxjs";
import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";

var provider = new firebase.auth.FacebookAuthProvider();

@Injectable({
  providedIn: "root"
})
export class AuthService {
  authState = new BehaviorSubject(false);

  constructor(
    private storage: Storage,
    private platform: Platform,
    private translate: TranslateService
  ) {
    this.platform.ready().then(() => {
      this.ifLoggedIn();
    });
  }

  ifLoggedIn() {
    this.storage.get("USER_INFO").then(response => {
      if (response) {
        this.authState.next(true);
      }
    });
  }

  loginUser(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    return firebase.auth().signInWithEmailAndPassword(email, password)
    .catch(error => {
      console.error(error);
      if (error.code == 'auth/user-not-found') {
        error.message = this.translate.instant("usuarioInexistente"); 
        throw new Error(error);
      } if (error.code == 'auth/wrong-password') {
        error.message = this.translate.instant("senhaOuUsuarioIncorreto"); 
        throw new Error(error);
      }      
      else {
        throw new Error(error);
      }
    });
  }

  signupUser(
    email: string,
    password: string,
    name: string
  ): Promise<void> {
    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((newUserCredential: firebase.auth.UserCredential) => {
        firebase
          .firestore()
          .doc(`/userProfile/${newUserCredential.user.uid}`)
          .set({ email, name });
      })
      .catch(error => {
        console.error(error.code);
        if (error.code == 'auth/email-already-in-use') {
          error.message = this.translate.instant("emailEmUso");
          throw new Error(error);
        } else {
          throw new Error(error);
        }
      });
  }

  loginFacebook() {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function(result) {
        var token = result.credential.providerId;
        var user = result.user;
        console.log(token);
        console.log(user);
      })
      .catch(function(error) {
        console.log(error.code);
        console.log(error.message);
      });
  }

  resetPassword(email: string): Promise<void> {
    return firebase.auth().sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<void> {
    return firebase.auth().signOut();
  }

  getAuth() {
    return firebase.auth();
  }
}
