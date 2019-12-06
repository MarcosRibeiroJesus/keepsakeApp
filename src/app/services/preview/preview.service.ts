import { EventPhoto } from '../../interfaces/eventPhoto';
import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class PreviewService {
  private previewCollection: AngularFirestoreCollection<EventPhoto>;

  constructor(private afs: AngularFirestore) {
    this.previewCollection = this.afs.collection<EventPhoto>('Preview', ref => ref.orderBy('key', 'asc'));
  }

  getPreviews() {
    return this.previewCollection.snapshotChanges().pipe(
      map(actions => {
        console.log('1st map', actions);
        return actions.map(preview => {
          console.log('2nd map', preview);

          const data = preview.payload.doc.data();
          const id = preview.payload.doc.id;
          console.log(data);

          return { id, ...data };
        });
      })
    );
  }

  // getPreview() {
  //   this.afDB.list('Preview/').snapshotChanges(['child_added']).subscribe(actions => {
  //     this.preview = [];
  //     actions.forEach(action => {
  //       console.log(action.payload.exportVal().eventPhoto);
  //       if (!action.payload.exportVal()[this.userProfile.uid]) {
  //         this.preview.push({
  //           key: action.key,
  //           eventPhoto: action.payload.exportVal().eventPhoto,
  //           foto: action.payload.exportVal().foto,
  //           likes: action.payload.exportVal().likes,
  //           location: action.payload.exportVal().location,
  //           subtitulo: action.payload.exportVal().subtitulo,
  //           id: action.payload.exportVal().id,
  //           liked: false
  //         });
  //       } else {
  //         this.preview.push({
  //           key: action.key,
  //           eventPhoto: action.payload.exportVal().eventPhoto,
  //           foto: action.payload.exportVal().foto,
  //           likes: action.payload.exportVal().likes,
  //           location: action.payload.exportVal().location,
  //           subtitulo: action.payload.exportVal().subtitulo,
  //           id: action.payload.exportVal().id,
  //           liked: true
  //         });
  //       };
  //     });
  //   });
  // }

  addPreview(preview: EventPhoto) {
    return this.previewCollection.add(preview);
  }

  getPreviewID(id: string) {
    return this.previewCollection.doc<EventPhoto>(id).valueChanges();
  }

  updatePreview(id: string, preview: EventPhoto) {
    return this.previewCollection.doc<EventPhoto>(id).update(preview);
  }

  likePreview(id: string, preview: EventPhoto, ) {
    return this.previewCollection.doc<EventPhoto>(id).update(preview);
    // this.previewCollection.doc(id). collection(uid).add({ liked: true });
  }


  deletePreview(id: string) {
    return this.previewCollection.doc(id).delete();
  }

  removeLikedPreview(id: string) {
    let previewRef = this.previewCollection.doc(id);
    console.log(previewRef);

    // let removeLike = previewRef.update({
    //   userId: this.afs.firestore. FieldValue.delete()
    // })
  }

}