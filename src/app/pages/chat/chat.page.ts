import { Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireDatabase } from "@angular/fire/database";
import { AngularFireAuth } from '@angular/fire/auth';
import { Platform, IonContent, LoadingController, ToastController } from '@ionic/angular';
import * as firebase from "firebase/app";
import { Facebook } from '@ionic-native/facebook/ngx';
import { ProfileService } from 'src/app/services/user/profile.service';
import { Router } from '@angular/router';
import { UserProfile } from 'src/app/interfaces/user';
import { Network } from '@ionic-native/network/ngx';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;

  connected = false;
  public userProfile: UserProfile;
  private loading: any;
  messageText: any;
  public messages: any = [];
  private disconnectSubscription: any;
  private connectSubscription: any;

  constructor(
    private profileService: ProfileService,
    public afDB: AngularFireDatabase,
    private loadingCtrl: LoadingController,
    private router: Router,
    public afAuth: AngularFireAuth,
    private fb: Facebook,
    public platform: Platform,
    private toastCtrl: ToastController,
    public network: Network
  ) {

    this.disconnectSubscription = this.network.onDisconnect().subscribe(() => {
      this.connected = false;
      this.presentToast('Você está Offline!', ` Nenhuma Conexão Detectada.`, 'danger')
    });

    this.connectSubscription = this.network.onConnect().subscribe(() => {
      this.connected = true;
      console.log('network connected!');
      setTimeout(() => {
        this.presentToast('Você está Online!', `Conexão Atual = ${this.network.type}.`, 'success')
      }, 3000);
    });

  }

  ngOnInit() {
    this.getAuth();
    this.getMessages();
  }

  getAuth() {
    this.profileService.getUserProfile().then(profile$ => {
      profile$.subscribe(userProfile => {
        this.userProfile = userProfile;
        console.log(this.userProfile);
      });
    });
  }



  IonViewDidEnter() {
    // this.presentLoading();
  }

  ngOnDestroy() {
    console.log('ondestroy');
    this.connectSubscription.unsubscribe();
    this.disconnectSubscription.unsubscribe();
  }

  getMessages() {
    this.afDB.list('chat/', ref => ref.orderByChild('date')).snapshotChanges(['child_added'])
      .subscribe(actions => {
        this.messages = [];

        if (!actions || actions.length <= 0) this.presentToast("Erro:", 'Erro ao atualizar!', 'danger');

        actions.forEach(action => {
          // console.log('Mensagem: ' + action.payload.exportVal().text);
          this.messages.push({
            firstName: action.payload.exportVal().firstName,
            userId: action.payload.exportVal().userId,
            text: action.payload.exportVal().text,
            date: action.payload.exportVal().date
          });
        });

        this.scrollToChatBottom();

      });
  }

  sendMessage() {

    // if (this.connected === true) {
      this.afDB.list('chat/').push({
        firstName: this.userProfile.firstName,
        userId: this.userProfile.uid,
        text: this.messageText,
        date: new Date().getTime(),
        // date: new Date().toISOString()
      });
      this.messageText = '';
      setTimeout(() => {
        this.content.scrollToBottom();
      });
    // } else {
    //   this.presentToast('Você está Offline!', `Nenhuma Conexão Detectada.`, 'danger')
    // }

  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create({
      spinner: "bubbles", message: "Aguarde..."
    });
    return this.loading.present();
  }

  async presentToast(header: string, message: string, color: string) {
    const toast = await this.toastCtrl.create({ header: header, message, duration: 2000, color: color });
    toast.present();
  }

  scrollToChatBottom() {
    setTimeout(() => {
      this.content.scrollToBottom();
    }, 500);
  }
}


