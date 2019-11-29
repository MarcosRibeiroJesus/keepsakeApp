import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import "firebase/auth";
import "firebase/firestore";
// auto login
import { BehaviorSubject } from "rxjs";
import { first } from 'rxjs/operators';
import { Platform } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";
import { User, UserProfile } from 'src/app/interfaces/user';

var provider = new firebase.auth.FacebookAuthProvider();

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authState = new BehaviorSubject(false);
  // user$: Observable<User>;
  userCredential: any;
  public userId: string;

  constructor(
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router,
    private storage: Storage,
    private platform: Platform,
    private firestore: AngularFirestore,
    private translate: TranslateService,
    // public service: UtilsService,
  ) {
    // Get the auth state, then fetch the Firestore user document or return null
    // this.user$ = this.afAuth.authState.pipe(
    //   switchMap(user => {
    //     // Logged in
    //     if (user) {
    //       return this.afs.doc<User>(`userProfile/${user.uid}`).valueChanges();
    //     } else {
    //       // Logged out
    //       return of(null);
    //     }
    //   })
    // )
    this.platform.ready().then(() => {
      this.ifLoggedIn();
    });
  }

  getUser(): Promise<firebase.User> {
    return this.afAuth.authState.pipe(first()).toPromise();
  }

  // register(user: User) {
  //   return this.afAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
  // }

  login(user: User) {
    return this.afAuth.auth.signInWithEmailAndPassword(user.email, user.password);
  }

  ifLoggedIn() {
    this.storage.get("USER_INFO").then(response => {
      if (response) {
        this.authState.next(true);
      }
    });
  }

  register(user: UserProfile): Promise<void> {

    let email = user.email;
    let password = user.password;
    let firstName = user.firstName;

    return firebase
      .auth()
      .createUserWithEmailAndPassword(email, password)
      .then((newUserCredential: firebase.auth.UserCredential) => {
        firebase
          .firestore() 
          .doc(`/userProfile/${newUserCredential.user.uid}`)
          .set({ email, firstName })
      })
  }

  loginFacebook() {
    firebase
      .auth()
      .signInWithPopup(provider)
      .then(function (result) {
        var token = result.credential.providerId;
        var user = result.user;
        console.log(token);
        console.log(user);
      })
      .catch(function (error) {
        console.log(error.code);
        console.log(error.message);
      });
  }

  async googleSignin() {
    const provider = new firebase.auth.GoogleAuthProvider();
    const credential = await this.afAuth.auth.signInWithPopup(provider);
    return this.updateUserData(credential.user);
  }

  updateProfile(userProfile: UserProfile) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<UserProfile> = this.afs.doc(`userProfile/${userProfile.uid}`);

    return userRef.set(userProfile, { merge: true })
  }

  private updateUserData({ uid, email, firstName, photoURL }: UserProfile) {
    // Sets user data to firestore on login
    const userRef: AngularFirestoreDocument<UserProfile> = this.afs.doc(`userProfile/${uid}`);

    const data = {
      uid,
      email,
      firstName,
      photoURL
    }

    return userRef.set(data, { merge: true })

  }

  logout() {
    return this.afAuth.auth.signOut();
  }

  getAuth() {
    return this.afAuth.auth;
  }

}