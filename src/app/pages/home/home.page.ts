import { Component, OnInit } from '@angular/core';
import { Depoimento } from 'src/app/interfaces/depoimento';

import { SocialSharing } from "@ionic-native/social-sharing/ngx";

import { AngularFireDatabase } from '@angular/fire/database';
import { AngularFireAuth } from '@angular/fire/auth';
import { LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from '../../services/auth/auth.service';
import { ProfileService } from '../../services/user/profile.service';
import { Router } from '@angular/router';
import { UserProfile } from 'src/app/interfaces/user';
import { Subscription } from 'rxjs';
import { PreviewService } from 'src/app/services/preview/preview.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  preview: any
  public userProfile: UserProfile;

  private previewSubscription: Subscription;


  constructor(
    private socialSharing: SocialSharing,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private profileService: ProfileService,
    private previewService: PreviewService,
    private router: Router,
  ) {
    this.previewSubscription = this.previewService
      .getPreviews()
      .subscribe(data => {
        console.log('Dados carregados', data);

        this.preview = data;
      });
  }

  ngOnInit() {
    this.profileService.getUserProfile().then(profile$ => {
      profile$.subscribe(userProfile => {
        if (!userProfile) this.router.navigate(['login']);
        this.userProfile = userProfile;
        console.log(this.userProfile);
      });
    });
    // this.getPreview();
  }

  getPreview() {
    this.afDB.list('Preview/').snapshotChanges(['child_added']).subscribe(actions => {
      this.preview = [];
      actions.forEach(action => {
        console.log(action.payload.exportVal().depoimento);
        if (!action.payload.exportVal()[this.userProfile.uid]) {
          this.preview.push({
            key: action.key,
            depoimento: action.payload.exportVal().depoimento,
            foto: action.payload.exportVal().foto,
            likes: action.payload.exportVal().likes,
            location: action.payload.exportVal().location,
            subtitulo: action.payload.exportVal().subtitulo,
            id: action.payload.exportVal().id,
            liked: false
          });
        } else {
          this.preview.push({
            key: action.key,
            depoimento: action.payload.exportVal().depoimento,
            foto: action.payload.exportVal().foto,
            likes: action.payload.exportVal().likes,
            location: action.payload.exportVal().location,
            subtitulo: action.payload.exportVal().subtitulo,
            id: action.payload.exportVal().id,
            liked: true
          });
        };
      });
    });
  }

  async shareAll() {
    let texto = 'Já pensou ter um App exclusivo para o seu evento e guardar todos os momentos registrados nele pra sempre? Acesse agora mesmo o site e baixe o App de Recordações! https://papaiapp-36bec.firebaseapp.com/';
    this.socialSharing.share(texto, 'Recordar é Viver!', null, null).then(() => {
    }).catch(e => {
      console.log('Erro:', e);
    })
  }

  addLike(post: Depoimento) {
    console.log(post);
    post.likes++;
    this.previewService.likePreview(post.id, post);
  }

  removeLike(post: Depoimento) {
    post.likes--;
    post.liked = false;
    this.previewService.removeLikedPreview(post.key);
  }

}
