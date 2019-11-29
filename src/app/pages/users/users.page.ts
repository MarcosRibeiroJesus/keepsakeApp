import { Component, OnInit } from '@angular/core';
import { UserProfile } from 'src/app/interfaces/user';
import { ProfileService } from 'src/app/services/user/profile.service';
import { Subscription } from 'rxjs';
import { LoadingController, ToastController, ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {
  private loading: any;
  public users = new Array<UserProfile>();
  private usersSubscription: Subscription;

  constructor(
    public actionSheetController: ActionSheetController,
    private loadingCtrl: LoadingController,
    private profileService: ProfileService,
    private toastCtrl: ToastController
  ) {
    this.usersSubscription = this.profileService
    .getUsers()
    .subscribe(data => {
      this.users = data;
    });
   }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.usersSubscription.unsubscribe();
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create();
    return this.loading.present();
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

  async presentActionSheet(user: UserProfile) {    
    const actionSheet = await this.actionSheetController.create({
      header: user.firstName + ' - ' + user.email, 
      buttons: [{
        text: 'Chamar no WhatsApp',
        icon: 'logo-whatsapp',       
        handler: () => {
          this.chatWhats()
          console.log('library clicked');
        }
      }, {
        text: 'Telefonar',
        icon: 'call', 
        handler: () => {
          this.callNumber()
          console.log('camera clicked');
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        cssClass: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  chatWhats() {
    this.presentToast('Informação:', 'WhatsApp não cadastrado!', 'warning');
  }

  callNumber() {
    this.presentToast('Informação:', 'Telefone não cadastrado!', 'warning');
  }

}
