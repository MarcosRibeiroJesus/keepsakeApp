import { Depoimento } from '../../interfaces/depoimento';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Comment } from 'src/app/interfaces/comment';

@Injectable({
  providedIn: 'root'
})
export class DepoimentoService {
  private depoimentosCollection: AngularFirestoreCollection<Depoimento>;
  private id: string = null;

  constructor(private afs: AngularFirestore) {
    this.depoimentosCollection = this.afs.collection<Depoimento>('Depoimento', ref => ref.orderBy('data', 'desc'));
   }

   getDepoimentos() {
    return this.depoimentosCollection.snapshotChanges().pipe(
      map( actions => {
        return actions.map( depoimentos => {
          const data = depoimentos.payload.doc.data();
          const id = depoimentos.payload.doc.id;
          console.log(data);
          
          return { id, ...data };
        });
      })
    );
  }

  addDepoimento(depoimento: Depoimento) {
    return this.depoimentosCollection.add(depoimento);
  }

  
  addCommentDepoimento(depoimento: Depoimento) {
    return this.depoimentosCollection.add(depoimento);
  }

  getDepoimento(id: string) {
    return this.depoimentosCollection.doc<Depoimento>(id).valueChanges();
  }

  updateDepoimento(id: string, depoimento: Depoimento) {
    return this.depoimentosCollection.doc<Depoimento>(id).update(depoimento);
  }

  
  commentDepoimento(id: string, comment: Comment) {
    let comments: Comment[] = [];
    comments.push(comment); 
    return this.depoimentosCollection.doc<Depoimento>(id).update({comments});
  }

  
  commentsDepoimento(id: string, comment: Comment, depoimento: Depoimento) {
    let comments;
    comments = depoimento.comments.push(comment);
    console.log(depoimento.comments);
     
    return this.depoimentosCollection.doc<Depoimento>(id).update({comments});
  }

  aplauseDepoimento(id: string, depoimento: Depoimento, ) {
    return this.depoimentosCollection.doc<Depoimento>(id).update(depoimento);
    // this.previewCollection.doc(id). collection(uid).add({ liked: true });
  }

  deleteDepoimento(id: string) {
    return this.depoimentosCollection.doc(id).delete();
  }
}
