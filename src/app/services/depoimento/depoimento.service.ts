import { Depoimento } from '../../interfaces/depoimento';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DepoimentoService {
  private depoimentosCollection: AngularFirestoreCollection<Depoimento>;

  constructor(private afs: AngularFirestore) {
    this.depoimentosCollection = this.afs.collection<Depoimento>('Depoimento');
   }

   getDepoimentos() {
    return this.depoimentosCollection.snapshotChanges().pipe(
      map(actions => {
        return actions.map(a => {
          const data = a.payload.doc.data();
          const id = a.payload.doc.id;

          return { id, ...data };
        });
      })
    );
  }

  addDepoimento(depoimento: Depoimento) {
    return this.depoimentosCollection.add(depoimento);
  }

  getDepoimento(id: string) {
    return this.depoimentosCollection.doc<Depoimento>(id).valueChanges();
  }

  updateDepoimento(id: string, depoimento: Depoimento) {
    return this.depoimentosCollection.doc<Depoimento>(id).update(depoimento);
  }

  deleteDepoimento(id: string) {
    return this.depoimentosCollection.doc(id).delete();
  }
}
