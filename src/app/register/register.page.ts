import { Component, OnInit } from '@angular/core';
import { Keyboard } from '@ionic-native/keyboard/ngx';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { LoadingController, AlertController } from '@ionic/angular';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {

  public registerForm: FormGroup;
  public loading: HTMLIonLoadingElement;

  constructor(
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public router: Router,
    public auth: AuthService,
    public keyboard: Keyboard
  ) { 
    this.registerForm = new FormGroup({
      'name': new FormControl('', Validators.compose([
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
    'name': [
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

  doLogin(): void {
    console.log('do Log In');
    this.router.navigate(['/tabs/home']);
  }

  async doRegister(registerForm: FormGroup): Promise<void> {
    if (!registerForm.valid) {
      console.log('Need to complete the form, current value: ', registerForm.value);
    } else {
      const name: string = registerForm.value.name;
      const email: string = registerForm.value.email; 
      const password: string = registerForm.value.password;

      this.auth.signupUser(email, password, name).then(
        () => {
          this.loading.dismiss().then(() => {
            this.router.navigateByUrl('tabs');
          });
        },
        error => {
          this.loading.dismiss().then(async () => {
            const alert = await this.alertCtrl.create({
              message: error.message,
              buttons: [{ text: 'Ok', role: 'Cancelar' }],
            });
            await alert.present();
          });
        }
      );
      this.loading = await this.loadingCtrl.create();
      await this.loading.present();
    }
  }

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

}
