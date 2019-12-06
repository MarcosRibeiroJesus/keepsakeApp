import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { EventPhoto } from '../../interfaces/eventPhoto';
import { Subscription } from 'rxjs';
import { LoadingController, ToastController } from '@ionic/angular';
import { EventPhotoService } from '../../services/eventPhoto/eventPhoto.service';
import { IonInfiniteScroll } from '@ionic/angular';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.page.html',
  styleUrls: ['./messages.page.scss'],
})
export class MessagesPage implements OnInit {
  @ViewChild(IonInfiniteScroll, {static: false}) infiniteScroll: IonInfiniteScroll;
  private loading: any;
  public depoimentos = new Array<EventPhoto>();
  private depoimentosSubscription: Subscription;

  constructor(
    private authService: AuthService,
    private loadingCtrl: LoadingController,
    private depoimentoService: EventPhotoService,
    private toastCtrl: ToastController
  ) {
    this.depoimentosSubscription = this.depoimentoService
      .getDepoimentos()
      .subscribe(data => {
        this.depoimentos = data;
      });
  }

  ngOnInit() {}

  ngOnDestroy() {
    this.depoimentosSubscription.unsubscribe();
  }

  ionViewDidEnter() {
 
  }

  addLike(post: EventPhoto) {
    console.log(post);
    post.likes++;
    this.depoimentoService.aplauseDepoimento(post.id, post);
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create();
    return this.loading.present();
  }

  async deleteDepoimento(id: string) {
    try {
      await this.depoimentoService.deleteDepoimento(id);
    } catch (error) {
      this.presentToast("Erro:", 'Erro ao deletar!', 'danger');
    }
  }

  async presentToast(header: string, message: string, color: string) {
    const toast = await this.toastCtrl.create({ header: header, message, duration: 2000, color: color });
    toast.present();
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);
    this.ngOnInit();
    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.target.complete();
    }, 2000);
  }

  loadData(event) {
    setTimeout(() => {
      console.log("Done");
      event.target.complete();
    }, 500);
  }
}
