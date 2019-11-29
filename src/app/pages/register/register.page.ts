import { Component, OnInit } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../interfaces/user';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  public registerForm: FormGroup;
  public loading: HTMLIonLoadingElement;
  user: User = {};

  constructor(
    public loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public router: Router,
    public auth: AuthService,
    public keyboard: Keyboard,
    private translate: TranslateService,
  ) {
    this.registerForm = new FormGroup({
      'firstName': new FormControl('', Validators.compose([
        Validators.minLength(3),
        Validators.required
      ])),
      'email': new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      'password': new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ]))
    });
  }

  ngOnInit() {
  }

  validation_messages = {
    'firstName': [
      { type: 'required', message: 'Nome é obrigatório!' },
      { type: 'pattern', message: 'Nome deve conter 3 ou mais dígitos!' }
    ],
    'email': [
      { type: 'required', message: 'Email é obrigatório!' },
      { type: 'pattern', message: 'Insira um email válido!' }
    ],
    'password': [
      { type: 'required', message: 'Senha é obrigatória!' },
      { type: 'minlength', message: 'Senha deve conter 6 ou mais dígitos!' }
    ]
  };


  async register(registerForm) {
    await this.presentLoading();
    if (!registerForm.valid) {
      console.log('Need to complete the form, current value: ', registerForm.value);
    } else {
      this.user.firstName = registerForm.value.firstName;
      this.user.email = registerForm.value.email;
      this.user.password = registerForm.value.password;

      try {
        await this.auth.register(this.user);

        this.router.navigateByUrl('tabs');
        
      } catch (error) {
        console.log(error);
        
        let message: string;

        switch (error.code) {
          case 'auth/email-already-in-use':
            message = this.translate.instant("emailEmUso");
            break;

          case 'auth/invalid-email':
            message = this.translate.instant("Email inválido");
            break;
        }

        this.presentToast(message);
      } finally {
        this.loading.dismiss();
      }
    }
  }
  // async doRegister(registerForm: FormGroup): Promise<void> {
  //   if (!registerForm.valid) {
  //     console.log('Need to complete the form, current value: ', registerForm.value);
  //   } else {
  //     const firstName: string = registerForm.value.firstName;
  //     const email: string = registerForm.value.email; 
  //     const password: string = registerForm.value.password;

  //     this.auth.signupUser(email, password, firstName).then(
  //       () => {
  //         this.loading.dismiss().then(() => {
  //           this.router.navigateByUrl('tabs');
  //         }); 
  //       },
  //       error => {
  //         this.loading.dismiss().then(async () => {
  //           const alert = await this.alertCtrl.create({
  //             message: error.message,
  //             buttons: [{ text: 'Ok', role: 'Cancelar' }],
  //           });
  //           await alert.present();
  //         });
  //       }
  //     );
  //     this.loading = await this.loadingCtrl.create();
  //     await this.loading.present();
  //   }
  // }

  goToForgotPassword(): void {
    console.log('redirect to forgot-password page');
  }

  doFacebookLogin(): void {
    console.log('facebook login');
    this.router.navigate(['app/categories']);
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
