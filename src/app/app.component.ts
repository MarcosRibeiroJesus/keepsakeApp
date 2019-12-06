import { Component } from '@angular/core';

import { Platform, AlertController, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { TranslateService } from '@ngx-translate/core';

import * as firebase from 'firebase/app';
import { environment } from '../environments/environment';

import { OneSignal } from '@ionic-native/onesignal/ngx';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  counter: number = 0;
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private translate: TranslateService,
    private oneSignal: OneSignal,
    public alertCtrl: AlertController,
    private navCtrl: NavController,
    private router: Router
  ) {
    this.initializeApp();
    translate.setDefaultLang('pt-br');
  }

  initializeApp() {
    firebase.initializeApp(environment.firebase);
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      if (this.platform.is('cordova')) {
        this.setupPush();
      }
    });
  }

  setupPush() {
    this.oneSignal.startInit('12247c9c-0775-4d8f-9d9d-ea6245597557', '692963994732');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.None);


    this.oneSignal.handleNotificationReceived().subscribe(data => {
      let msg = data.payload.body;
      let title = data.payload.title;
      let additionalData = data.payload.additionalData;

      this.showAlert(title, msg, additionalData.task)
    });

    this.oneSignal.handleNotificationOpened().subscribe(data => {
      let additionalData = data.notification.payload.additionalData;

      this.showAlert('Notificação visualizada', 'Parece que você já leu essa notificação anteriormente...', additionalData.task);
    });


    this.oneSignal.endInit();
  }

  async showAlert(title, msg, task) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: msg,
      buttons: [
        {
          text: `Ação? ${task}`,
          handler: () => {

          }
        }
      ]
    });

    await alert.present();
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }

}
