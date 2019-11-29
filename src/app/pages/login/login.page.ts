import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { AngularFireAuth } from '@angular/fire/auth';
import { TranslateService } from '@ngx-translate/core';
import { User } from '../../interfaces/user';

import { Platform } from '@ionic/angular';
import { AngularFireDatabase } from '@angular/fire/database';
import * as firebase from 'firebase/app';
import { Facebook } from '@ionic-native/facebook/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  public loginForm: FormGroup;
  private loading: any;
  user: User = {};

  providerFb: firebase.auth.FacebookAuthProvider;

  constructor(
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public router: Router,
    public auth: AuthService,
    public keyboard: Keyboard,
    private translate: TranslateService,
    public afDB: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    private fb: Facebook,
    public platform: Platform
  ) {
    this.loginForm = new FormGroup({
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      'password': new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ]))
    });

    // Facebook
    this.providerFb = new firebase.auth.FacebookAuthProvider();
  }

  ngOnInit() {
  }

  validation_messages = {
    'email': [
      { type: 'required', message: 'Email é obrigatório.' },
      { type: 'pattern', message: 'Insira um email válido.' }
    ],
    'password': [
      { type: 'required', message: 'Senha é obrigatória.' },
      { type: 'minlength', message: 'Senha deve conter 6 ou mais dígitos.' }
    ]
  };

  async login(loginForm) {
    await this.presentLoading();
    if (!loginForm.valid) {
      console.log('Need to complete the form, current value: ', loginForm.value);
    } else {
      this.user.email = loginForm.value.email;
      this.user.password = loginForm.value.password;

      try {
        await this.auth.login(this.user);

        this.router.navigateByUrl('tabs');

      } catch (error) {
        let message: string;

        switch (error.code) {
          case 'auth/user-not-found':
            message = this.translate.instant("usuarioInexistente");
            break;

          case 'auth/wrong-password':
            message = this.translate.instant("senhaOuUsuarioIncorreto");
            break;
        }

        this.presentToast(message);
      } finally {
        this.loading.dismiss();
      }
    }
  }

  // async doLogin(loginForm: FormGroup) {
  //   if (!loginForm.valid) {
  //     console.log('Form is not valid yet, current value:', loginForm.value);
  //   } else {
  //     this.loading = await this.loadingCtrl.create();
  //     await this.loading.present();

  //     const email = loginForm.value.email;
  //     const password = loginForm.value.password;

  //     this.auth.loginUser(email, password).then(
  //       () => {

  //         this.loading.dismiss().then(() => {
  //           this.router.navigateByUrl('tabs');
  //         });
  //       },
  //       error => {
  //         this.loading.dismiss().then(async () => {
  //           const alert = await this.alertCtrl.create({
  //             message: error.message,
  //             buttons: [{ text: 'Ok', role: 'cancel' }],
  //           });
  //           await alert.present();
  //         });
  //       }
  //     );
  //   }
  // }

  goToForgotPassword(): void {
    console.log('redirect to forgot-password page');
  }

  // doFacebookLogin(): void {
  //   console.log('facebook login');
  //   this.router.navigate(['app/categories']);
  // }

  facebookLogin() {
    if (this.platform.is('cordova')) {
      console.log('Cordova');
      this.facebookCordova();
    } else {
      console.log('Web');
      this.facebookWeb();
    }
  }

  facebookCordova() {
    this.fb.login(['email']).then((response) => {
      const facebookCredential = firebase.auth.FacebookAuthProvider
        .credential(response.authResponse.accessToken);
      firebase.auth().signInWithCredential(facebookCredential)
        .then((success) => {
          console.log('Info Facebook: ' + JSON.stringify(success));
          this.afDB.object('userProfile/' + success.user.uid).set({
            email: success.user.email,
            firstName: success.user.displayName,
            photoURL: success.user.photoURL,
            uid: success.user.uid
          });

          this.router.navigateByUrl('tabs');
        }).catch((error) => {
          console.log('Erro: ' + JSON.stringify(error));
        });
    }).catch((error) => { console.log(error); });
  }

  facebookWeb() {
    this.afAuth.auth
      .signInWithPopup(new firebase.auth.FacebookAuthProvider())
      .then((success) => {
        console.log('Info Facebook: ' + JSON.stringify(success));
        this.afDB.object('userProfile/' + success.user.uid).set({
          email: success.user.email,
          firstName: success.user.displayName,
          photoURL: success.user.photoURL,
          uid: success.user.uid
        });

        this.router.navigateByUrl('tabs');
      }).catch((error) => {
        console.log('Erreur: ' + JSON.stringify(error));
      });
  }

  async doGoogleLogin() {
    this.loading = await this.loadingCtrl.create();
    await this.loading.present();

    this.auth.googleSignin().then(

      async result => {
        console.log(result);

        this.router.navigate(['tabs']);

        this.loading.dismiss();
      },
      error => {
        this.loading.dismiss().then(async () => {
          const alert = await this.alertCtrl.create({
            message: error.message,
            buttons: [{ text: 'Ok', role: 'cancel' }],
          });
          await alert.present();
        });
      }
    );
  }

  doTwitterLogin(): void {
    console.log('twitter login');
    this.router.navigate(['app/categories']);
  }

  async presentLoading() {
    this.loading = await this.loadingCtrl.create(
      { spinner: "bubbles", message: "Aguarde..." });
    return this.loading.present();
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({ message, duration: 2000 });
    toast.present();
  }
}
