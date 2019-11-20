import { Foto } from "../../interfaces/foto";
import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreCollection
} from "@angular/fire/firestore";
import { map } from "rxjs/operators";
import { AngularFireStorage } from "@angular/fire/storage";
import { DomSanitizer } from "@angular/platform-browser";

@Injectable({
  providedIn: "root"
})
export class FotoService {
  private fotosCollection: AngularFirestoreCollection<Foto>;

  constructor(
    private afs: AngularFirestore,
    private afStorage: AngularFireStorage,
    private sanitizer: DomSanitizer
  ) {
    this.fotosCollection = this.afs.collection<Foto>("Foto");
  }
 
  getFotos() {
    return this.fotosCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;

          return { id, ...data };
        });
      })
    );
  }

  upload(blob: Blob, fileName: String) {
    try {
      const ref = this.afStorage.ref("fotosfesta/");
      let uploadTask = ref.child("imagens/" + fileName + ".png");

      return new Promise<any>((resolve, reject) => {
        return uploadTask
          .put(blob)
          .then(() => {
            return uploadTask.getDownloadURL().then(url => {
              resolve({
                url: url,
                urlSafe: this.sanitizer.bypassSecurityTrustResourceUrl(url)
              });
            });
          })
          .catch(err => {
            console.log(
              "Ocorreu algum erro ao enviar o arquivo para o Firebase"
            );
            console.log(JSON.stringify(err));
            reject(err);
          });
      });
    } catch (error) {
      console.log(error);
    }
  }

  addFoto(foto: Foto) {
    return this.fotosCollection.add(foto);
  }

  getFoto(id: string) {
    return this.fotosCollection.doc<Foto>(id).valueChanges();
  }

  updateFoto(id: string, foto: Foto) {
    return this.fotosCollection.doc<Foto>(id).update(foto);
  }

  deleteFoto(id: string) {
    return this.fotosCollection.doc(id).delete();
  }
}
