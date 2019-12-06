import { EventPhoto } from '../../interfaces/eventPhoto';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { Comment } from 'src/app/interfaces/comment';

@Injectable({
  providedIn: 'root'
})
export class EventPhotoService {
  private depoimentosCollection: AngularFirestoreCollection<EventPhoto>;
  private id: string = null;

  constructor(private afs: AngularFirestore) {
    this.depoimentosCollection = this.afs.collection<EventPhoto>('EventPhoto', ref => ref.orderBy('data', 'desc'));
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

  addDepoimento(eventPhoto: EventPhoto) {
    return this.depoimentosCollection.add(eventPhoto);
  }

  
  addCommentDepoimento(eventPhoto: EventPhoto) {
    return this.depoimentosCollection.add(eventPhoto);
  }

  getDepoimento(id: string) {
    return this.depoimentosCollection.doc<EventPhoto>(id).valueChanges();
  }

  updateDepoimento(id: string, eventPhoto: EventPhoto) {
    return this.depoimentosCollection.doc<EventPhoto>(id).update(eventPhoto);
  }

  
  commentDepoimento(id: string, comment: Comment) {
    let comments: Comment[] = [];
    comments.push(comment); 
    return this.depoimentosCollection.doc<EventPhoto>(id).update({comments});
  }

  
  commentsDepoimento(id: string, comment: Comment, eventPhoto: EventPhoto) {
    let comments;
    comments = eventPhoto.comments.push(comment);
    console.log(eventPhoto.comments);
     
    return this.depoimentosCollection.doc<EventPhoto>(id).update({comments});
  }

  aplauseDepoimento(id: string, eventPhoto: EventPhoto, ) {
    return this.depoimentosCollection.doc<EventPhoto>(id).update(eventPhoto);
    // this.previewCollection.doc(id). collection(uid).add({ liked: true });
  }

  deleteDepoimento(id: string) {
    return this.depoimentosCollection.doc(id).delete();
  }
}
