import { Injectable } from '@angular/core';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
import {
  AngularFirestore,
  AngularFirestoreDocument,
  AngularFirestoreCollection
} from '@angular/fire/firestore';
import { User, UserProfile } from '../../interfaces/user';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private userProfile: AngularFirestoreDocument<UserProfile>;
  private currentUser: firebase.User;
  private usersCollection: AngularFirestoreCollection<UserProfile>;

  constructor(
    private afs: AngularFirestore,
    private authService: AuthService
  ) {
    this.usersCollection = this.afs.collection<UserProfile>('userProfile');
  }

  //  getUserProfile(): firebase.afs.DocumentReference {
  //     return this.userProfile;
  //   }

  getUsers() {
    return this.usersCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(users => {
          const data = users.payload.doc.data();
          const id = users.payload.doc.id;
          console.log(data);

          return { id, ...data };
        });
      })
    );
  }

  async getUserProfile(): Promise<Observable<UserProfile>> {
    const user: firebase.User = await this.authService.getUser();
    this.currentUser = user;
    this.userProfile = this.afs.doc(`userProfile/${user.uid}`);
    return this.userProfile.valueChanges();
  }

  updateName(firstName: string): Promise<any> {
    return this.userProfile.update({ firstName });
  }

  updateGroup(group: string): Promise<any> {
    return this.userProfile.update({ group });
  }
  
  updateField(field: string): Promise<any> {
    return this.userProfile.update({ field });
  }

  updateWhatsapp(whatsappNumber: string): Promise<any> {
    return this.userProfile.update({ whatsappNumber });
  }

  updateDOB(birthDate: string): Promise<any> {
    return this.userProfile.update({ birthDate });
  }

  updateEmail(newEmail: string, password: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      password
    );

    return this.currentUser
      .reauthenticateAndRetrieveDataWithCredential(credential)
      .then(() => {
        this.currentUser.updateEmail(newEmail).then(() => {
          this.userProfile.update({ email: newEmail });
        });
      })
      .catch(error => {
        console.error(error);
      });
  }

  updatePassword(newPassword: string, oldPassword: string): Promise<any> {
    const credential: firebase.auth.AuthCredential = firebase.auth.EmailAuthProvider.credential(
      this.currentUser.email,
      oldPassword
    );

    return this.currentUser
      .reauthenticateAndRetrieveDataWithCredential(credential)
      .then(() => {
        this.currentUser.updatePassword(newPassword).then(() => {
          console.log('Senha Alterada');
        });
      })
      .catch(error => {
        console.error(error);
      });
  }
}