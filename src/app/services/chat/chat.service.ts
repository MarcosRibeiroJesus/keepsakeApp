import { Chat } from '../../interfaces/chat';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private chatsCollection: AngularFirestoreCollection<Chat>;

  constructor(private afs: AngularFirestore) {
    this.chatsCollection = this.afs.collection<Chat>('Chat');
   }

   getDepoimentos() {
    return this.chatsCollection.snapshotChanges().pipe(
      map( actions => {
        return actions.map( chats => {
          const data = chats.payload.doc.data();
          const id = chats.payload.doc.id;
          console.log(data);
          
          return { id, ...data };
        });
      })
    );
  }

  addDepoimento(eventPhoto: Chat) {
    return this.chatsCollection.add(eventPhoto);
  }

  getDepoimento(id: string) {
    return this.chatsCollection.doc<Chat>(id).valueChanges();
  }

  updateDepoimento(id: string, eventPhoto: Chat) {
    return this.chatsCollection.doc<Chat>(id).update(eventPhoto);
  }

  deleteDepoimento(id: string) {
    return this.chatsCollection.doc(id).delete();
  }
}
