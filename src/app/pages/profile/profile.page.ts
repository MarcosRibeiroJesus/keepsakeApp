import { Component, OnInit, OnChanges } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { AuthService } from '../../services/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ProfileService } from '../../services/user/profile.service';
import { ThemeService } from '../../theme.service';
import { UserProfile } from '../../interfaces/user';
import { ImageHelper, UploadTypeEnum } from '../../commons/image.helper';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';


const themes = {
  autumn: {
    primary: "#F78154",
    secondary: "#4D9078",
    tertiary: "#B4436C",
    light: "#FDE8DF",
    medium: "#FCD0A2",
    dark: "#B89876"
  },
  night: {
    primary: "#8CBA80",
    secondary: "#FCFF6C",
    tertiary: "#FE5F55",
    medium: "#BCC2C7",
    dark: "#F7F7FF",
    light: "#495867",
  },
  neon: {
    primary: "#39BFBD",
    secondary: "#4CE0B3",
    tertiary: "#FF5E79",
    light: "#F4EDF2",
    medium: "#B682A5",
    dark: "#34162A"
  }
};

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit, OnChanges {
  private loading: any;
  public userProfile: UserProfile;
  public birthDate: Date;
  selectedTheme: '';
  selectedLanguage: string;

  currentImage: any;

  constructor(
    private theme: ThemeService,
    private alertCtrl: AlertController,
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router,
    private translateService: TranslateService,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    public imageHelper: ImageHelper,
    private camera: Camera,
  ) {    
    this.profileService.getUserProfile().then(profile$ => {
      profile$.subscribe(userProfile => {
        this.userProfile = userProfile;
        console.log(this.userProfile);
      });
    });
    translateService.setDefaultLang("pt-br");

  }

  changeTheme(name) {
    this.theme.setTheme(themes[name]);
    this.selectedTheme = name;
  }

  switchLanguage(language: string) {
    this.translateService.use(language);
    this.selectedLanguage = language;
  }

  ngOnInit() {
    
  }

  ngOnChanges() {
    this.profileService.getUserProfile().then(profile$ => {
      profile$.subscribe(userProfile => {
        this.userProfile = userProfile;
      });
    });
  }

  takePicture() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE
    }

    this.camera.getPicture(options).then((imageData) => {
      this.currentImage = 'data:image/jpeg;base64,' + imageData;
    }, (err) => {
      // Handle error
      console.log("Camera issue:" + err);
    });
  }

  biblioteca() {
    this.imageHelper.getImage(false, this.userProfile.email, UploadTypeEnum.USUARIO).then((result: { url: string, urlSafe: string }) => {
      console.log('this.imageHelper.getImage');
      console.log(result);
      this.setupImagemUsuario(result);
    });
  }

  async setupImagemUsuario(result: { url: string, urlSafe: string }) {
    console.log('setupImagemUsuario');
    this.userProfile.photoURL = result.url;
    this.userProfile.uid = this.authService.getAuth().currentUser.uid;

    console.log(this.userProfile);

    try {
      await this.authService.updateProfile(this.userProfile);
      await this.loading.dismiss();
    } catch (error) {
      this.presentToast("Erro ao salvar! Tente novamente");
      this.loading.dismiss();
    }
  }

  async updateName(): Promise<void> {
    let sb = this.translateService.instant("updateNameSubHeader");
    let pfn = this.translateService.instant("updateNamePlaceHolderFirstName");
    let pln = this.translateService.instant("updateNamePlaceHolderLastName");
    let btn = this.translateService.instant("updateNameCancelButton");

    const alert = await this.alertCtrl.create({
      subHeader: sb,
      inputs: [
        {
          type: "text",
          name: "firstName",
          value: this.userProfile.firstName
        },
      ],
      buttons: [
        { text: btn },
        {
          text: "Ok",
          handler: data => {
            this.profileService.updateName(data.firstName);
          }
        }
      ]
    });
    await alert.present();
  }

  updateDOB(birthDate: string): void {
    if (birthDate === undefined) {
      return;
    }
    this.profileService.updateDOB(birthDate);
  }

  async updateEmail(): Promise<void> {
    let sb = this.translateService.instant("updateEmailSubHeader");
    let pne = this.translateService.instant("updateEmailPlaceHolderNewEmail");
    let pp = this.translateService.instant("updateEmailPlaceHolderPassword");
    let btn = this.translateService.instant("updateEmailCancelButton");

    const alert = await this.alertCtrl.create({
      subHeader: sb,
      inputs: [
        { type: "text", name: "newEmail", placeholder: pne },
        { name: "password", placeholder: pp, type: "password" }
      ],
      buttons: [
        { text: btn },
        {
          text: "Ok",
          handler: data => {
            this.profileService
              .updateEmail(data.newEmail, data.password)
              .then(() => {
                console.log("Email alterado com sucesso");
              })
              .catch(error => {
                console.log("ERROR: " + error.message);
              });
          }
        }
      ]
    });
    await alert.present();
  }

  async updatePassword(): Promise<void> {
    const alert = await this.alertCtrl.create({
      subHeader: "Alterar senha",
      inputs: [
        { name: "newPassword", placeholder: "Nova senha", type: "password" },
        { name: "oldPassword", placeholder: "Senha atual", type: "password" }
      ],
      buttons: [
        { text: "Cancelar" },
        {
          text: "Ok",
          handler: data => {
            this.profileService.updatePassword(
              data.newPassword,
              data.oldPassword
            );
          }
        }
      ]
    });
    await alert.present();
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

  async logout() {
    await this.presentLoading();

    try {
      await this.authService.logout();
    } catch (error) {
      console.error(error);
    } finally {
      this.loading.dismiss();
    }
  }

}
