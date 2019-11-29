import { Component, OnInit } from '@angular/core';
import {
  FirebaseService,
  UploadTypeEnum
} from "../../services/firebase.service";
import { FotosService } from "../../services/fotos/fotos.service";
import { File as FileNgx } from "@ionic-native/file/ngx";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { Platform } from "@ionic/angular";
import { AuthService } from "../../services/auth/auth.service";
import { DepoimentoService } from "../../services/depoimento/depoimento.service";
import { Depoimento } from "../../interfaces/depoimento";
import { ActivatedRoute, Router } from "@angular/router";
import {
  NavController,
  LoadingController,
  ToastController
} from "@ionic/angular";
import { Subscription, Observable } from "rxjs";
import { ProfileService } from "../../services/user/profile.service";

import { AngularFireStorage } from "@angular/fire/storage";
import { finalize } from "rxjs/operators";
import { UserProfile } from '../../interfaces/user';

@Component({
  selector: 'app-message',
  templateUrl: './message.page.html',
  styleUrls: ['./message.page.scss'],
})
export class MessagePage implements OnInit {
  private depoimentoId: string = null;
  public depoimento: Depoimento = {};
  private loading: any;
  public userProfile: UserProfile;
  public uploadPercent: Observable<number>;
  public downloadUrl: Observable<string>;
  private depoimentoSubscription: Subscription;
  private file: File;
  private arquivo: FileNgx;

  // Native
  imagePath: string;
  upload: any;

  constructor(
    private depoimentoService: DepoimentoService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private profileService: ProfileService,
    private camera: Camera,
    private router: Router,
    private platform: Platform,
    private fotosService: FotosService,
    private afStorage: AngularFireStorage,
    private firebaseService: FirebaseService
  ) {
    // this.depoimentoId = this.activatedRoute.snapshot.params["id"];

    // if (this.depoimentoId) this.loadDepoimento();
    console.log('constructor');

  }

  ngOnInit() {
    console.log('oninit');

    this.profileService.getUserProfile().then(profile$ => {
      profile$.subscribe(userProfile => {
        if (!userProfile) this.router.navigate(['login']);
        this.userProfile = userProfile;
        this.depoimento.nomeUsuario = userProfile.firstName;
        console.log(this.userProfile);
      });
    });
  }

  ngOnDestroy() {
    console.log('ondestroy');

    if (this.depoimentoSubscription) this.depoimentoSubscription.unsubscribe();
  }

  loadDepoimento() {
    this.depoimentoSubscription = this.depoimentoService
      .getDepoimento(this.depoimentoId)
      .subscribe(data => {
        this.depoimento = data;
      });
  }

  // Native
  async addPhoto(source: string) {
    if (source === 'library') {
      console.log('library');
      const libraryImage = await this.openLibrary();
      this.depoimento.foto = 'data:image/jpg;base64,' + libraryImage;
    } else {
      console.log('camera');
      const cameraImage = await this.openCamera();
      this.depoimento.foto = 'data:image/jpg;base64,' + cameraImage;
    }
  }

  async openCamera() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 1000,
      targetHeight: 1000,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    };
    return await this.camera.getPicture(options);
  }

  async openLibrary() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      targetWidth: 1000,
      targetHeight: 1000,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true
    };
    return await this.camera.getPicture(options);
  }

  async uploadFirebase() {
    this.presentLoading();
    let filename = "DEPOIMENTO_" + Date.now();
    await this.firebaseService
      .uploadPhoto(this.depoimento.foto, filename, UploadTypeEnum.DEPOIMENTO)
      .then(async (result: { url: string; urlSafe: string }) => {
        // const imagem = result.url;
        console.log(result.url);
        this.depoimento.foto = result.url;
      }).then(() => {
        this.salvarDepoimento();
      }).catch((Error) => {
        console.log(Error);
        this.presentToast("Erro:", 'Erro ao salvar foto!', 'danger');
        this.loading.dismiss();
      });
  }
  // End Native

  async salvarDepoimento() {

    this.depoimento.userId = this.authService.getAuth().currentUser.uid;
    this.depoimento.likes = 0;
    
    if (this.depoimentoId) {
      try {
        await this.depoimentoService.updateDepoimento(
          this.depoimentoId,
          this.depoimento
        );
        await this.loading.dismiss();

        this.navCtrl.navigateBack("/tabs/messages");
        // this.depoimento = {}
      } catch (error) {
        this.presentToast("Erro:", 'Erro ao atualizar!', 'danger');
        this.loading.dismiss();
      }
    } else {
      this.depoimento.data = new Date().getTime();

      try {
        await this.depoimentoService.addDepoimento(this.depoimento);
        await this.loading.dismiss();
        this.navCtrl.navigateBack("/tabs/messages");
        this.presentToast("Sucesso:", 'Post enviado com sucesso!', 'success');
      } catch (error) {
        this.presentToast("Erro:", 'Erro ao enviar!', 'danger');
        this.loading.dismiss();
      }
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

  async abrirGaleria() {
    const options: CameraOptions = {
      quality: 100,
      destinationType: this.camera.DestinationType.FILE_URI,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      correctOrientation: true
    };

    try {
      const fileUri: string = await this.camera.getPicture(options);

      let arquivo: string;

      if (this.platform.is("ios")) {
        arquivo = fileUri.split("/").pop();
      } else {
        arquivo = fileUri.substring(0, fileUri.lastIndexOf("/"));
      }

      const path: string = fileUri.substring(0, fileUri.lastIndexOf("/"));

      const buffer: ArrayBuffer = await this.arquivo.readAsArrayBuffer(
        path,
        arquivo
      );
      const blob: Blob = new Blob([buffer], { type: "image/jpeg" });
      let fileName = "depoimento_" + Date.now();

      this.enviarImagem(blob, fileName);
    } catch (error) {
      console.log(error);
    }
  }

  enviarImagem(blob: Blob, fileName: string) {
    const ref = this.afStorage.ref("depoimentosNativo/");
    let uploadTask = ref.child("foto/" + fileName + ".png");

    const task = uploadTask.put(blob);

    this.uploadPercent = task.percentageChanges();

    task
      .snapShotChanges()
      .pipe(
        finalize(() => {
          this.downloadUrl = ref.getDownloadURL();
          this.depoimento.foto = this.downloadUrl.toString();
          console.log('url foto depoimento finalize snapshot', this.depoimento.foto);

        })
      )
      .subscribe();
  }

  private bytes: string;

  openFileBrowser(event: any, idElement: string) {
    event.preventDefault();
    let element: HTMLElement = document.getElementById(
      idElement
    ) as HTMLElement;
    element.click();
  }

  onChange(event: EventTarget) {
    let eventObj: MSInputMethodContext = <MSInputMethodContext>event;
    let target: HTMLInputElement = <HTMLInputElement>eventObj.target;
    let files: FileList = target.files;
    this.presentLoading();

    if (!(files[0].type === "image/jpeg" || files[0].type === "image/png")) {
      this.presentToast('Informação:', "Imagem inválida. O arquivo de imagem deve estar no formato JPG ou PNG.", 'warning');
      return;
    }

    // if (files[0].size > 1000000) { // 1 MB
    //     this.presentToast('Imagem inválida. O tamanho do arquivo de imagem deve ser inferior a 1 MB.');
    //     return;
    // }

    this.file = files[0];
    console.log("onChange");
    console.log(this.file);

    let reader = new FileReader();
    reader.onload = file => {
      if (this.file) {
        console.log("uploading.... ");
        let filename = "DEPOIMENTO_" + Date.now();
        this.firebaseService
          .uploadImage(this.file, filename, UploadTypeEnum.DEPOIMENTO)
          .then((result: { url: string; urlSafe: string }) => {
            // const imagem = result.url;
            console.log(result.url);
            this.depoimento.foto = result.url;
            console.log('url foto depoimento onChanges', this.depoimento.foto);
            this.loading.dismiss();
          });
      }
    };
    reader.readAsArrayBuffer(this.file);
  }
}
