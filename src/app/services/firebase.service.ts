import { environment } from './../../environments/environment.prod';
import { Injectable, Host } from '@angular/core';
import 'rxjs';

import * as firebase from 'firebase';
import { DomSanitizer } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  constructor(private _sanitizer: DomSanitizer) {
  }

  uploadImageUsuario(
    file: File,
    filename: string
  ): firebase.storage.UploadTask {
    try {
      var storage = firebase.app().storage();
      console.log(storage);

      var storageRef = storage.ref();
      var uploadTask = storageRef.child('users/' + filename + '.png');

      // Create file metadata to update
      var metadata = {
        contentType: 'image/png'
      };

      return uploadTask.put(file, metadata);
      // put(file).then(function (snapshot) {
      //     console.log('Uploaded a raw string!');
      // });
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  uploadImage(
    file: File,
    filename: string,
    uploadTypeEnum: UploadTypeEnum
  ): Promise<any> {
    try {
      var storage = firebase.app().storage();
      console.log(storage);

      var storageRef = storage.ref();
      var uploadTask = storageRef.child(
        uploadTypeEnum.toString() + filename + '.png'
      );

      // Create file metadata to update
      var metadata = {
        contentType: 'image/png'
      };

      return new Promise<any>((resolve, reject) => {
        return uploadTask
          .put(file, metadata)
          .then(() => {
            return uploadTask.getDownloadURL().then(url => {
              console.log('url');
              console.log(url);
              resolve({
                url: url,
                urlSafe: this._sanitizer.bypassSecurityTrustResourceUrl(url)
              });
            });
          })
          .catch(err => {
            console.log(
              'Ocorreu algum erro ao enviar o arquivo para o Firebase Google'
            );
            console.log(JSON.stringify(err));
            reject(err);
          });
      });

      // return uploadTask.put(file, metadata);
      // put(file).then(function (snapshot) {
      //     console.log('Uploaded a raw string!');
      // });
    } catch (error) {
      console.log(error);
    }
    return null;
  }

  // Delete 
  deleteImage(storageUrl) {
    try {
      var storage = firebase.app().storage();
      var deleteTask = storage.refFromURL(storageUrl);
      return deleteTask.delete();
    } catch (error) {
      console.log(error);
    }
  }
}

export enum UploadTypeEnum {
  // USUARIO = 'usuarios/',
  // DEPOIMENTO = 'depoimentos/',
  // FOTOFESTA = 'fotosfesta/'

  USER = 'users/',
  PARTYPHOTOS = 'partyPhotos/'

}
