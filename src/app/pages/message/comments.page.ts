import { Component, OnInit } from '@angular/core';
import { EventPhoto } from 'src/app/interfaces/eventPhoto';
import { EventPhotoService } from 'src/app/services/eventPhoto/eventPhoto.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavController, LoadingController, ToastController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth/auth.service';
import { Comment } from 'src/app/interfaces/comment';
import { UserProfile } from 'src/app/interfaces/user';
import { ProfileService } from 'src/app/services/user/profile.service';
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { PreviewService } from 'src/app/services/preview/preview.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.page.html',
  styleUrls: ['./comments.page.scss'],
})
export class CommentsPage implements OnInit {
  public userProfile: UserProfile;
  private depoimentoId: string = null;
  public eventPhoto: EventPhoto = {};
  public comment: Comment = {};
  comments = [];
  messageText: any;
  private depoimentoSubscription: Subscription;
  private loading: any;

  constructor(
    private profileService: ProfileService,
    private depoimentoService: EventPhotoService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private router: Router,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private socialSharing: SocialSharing,
    private previewService: PreviewService,
  ) {
    this.depoimentoId = this.activatedRoute.snapshot.params["id"];

    if (this.depoimentoId) this.loadDepoimento();
  }

  ngOnInit() {
    this.profileService.getUserProfile().then(profile$ => {
      profile$.subscribe(userProfile => {
        if (!userProfile) this.router.navigate(['login']);
        this.userProfile = userProfile;
        this.comment.firstName = userProfile.firstName;
        this.comment.photoURL = userProfile.photoURL;
        this.comment.userId = userProfile.uid;
        console.log(this.userProfile);
      });
    });
  }

  loadDepoimento() {
    this.depoimentoSubscription = this.depoimentoService
      .getDepoimento(this.depoimentoId)
      .subscribe(data => {
        this.eventPhoto = data;
        // this.comments = this.eventPhoto.comments;
        console.log(this.eventPhoto.comments);

      });
  }

  async shareAll() {
    let texto = 'Já pensou ter um App exclusivo para o seu evento e guardar todos os momentos registrados nele pra sempre? Acesse agora mesmo o site e baixe o App de Recordações! https://papaiapp-36bec.firebaseapp.com/';
    this.socialSharing.share(texto, 'Recordar é Viver!', null, null).then(() => {
    }).catch(e => {
      console.log('Erro:', e);
    })
  }

  addLike() {
    console.log(this.eventPhoto);
    this.eventPhoto.likes++;
    this.depoimentoService.aplauseDepoimento(this.depoimentoId, this.eventPhoto);
  }

  async salvarDepoimento() {
    this.presentLoading();

    if(!this.eventPhoto.comments) {
      this.eventPhoto.comments = [];
    }

    this.comment.comment = this.messageText,
    this.comment.createdAt = new Date().getTime();
    this.eventPhoto.comments.push(this.comment);
    if (this.depoimentoId) {
      console.log('IF', this.comment);

      try {
        await this.depoimentoService.updateDepoimento(
          this.depoimentoId,
          this.eventPhoto
        );
        this.loading.dismiss();
        this.messageText = '';
      } catch (error) {
        this.loading.dismiss();
        this.presentToast("Erro:", 'Erro ao atualizar!', 'danger');
      }
    } else {
      console.log('ELSE', this.comment);

      // try {
      //   await this.depoimentoService.commentsDepoimento(
      //     this.depoimentoId,
      //     this.comment,
      //     this.eventPhoto
      //   );
      //   this.loading.dismiss();
      //   this.messageText = '';
      // } catch (error) {
      //   this.loading.dismiss();
      //   this.presentToast("Erro:", 'Erro ao atualizar!', 'danger');

      // }
    }
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create(
      { spinner: "bubbles", message: "Aguarde..." });
    return this.loading.present();
  }

  async presentToast(header: string, message: string, color: string) {
    const toast = await this.toastCtrl.create({ header: header, message, duration: 2000, color: color });
    toast.present();
  }



}
