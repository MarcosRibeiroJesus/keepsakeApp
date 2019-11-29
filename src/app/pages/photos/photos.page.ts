import { FotoService } from "../../services/foto/foto.service";
import {
  FirebaseService,
  UploadTypeEnum
} from "../../services/firebase.service";
import { FotosService } from "../../services/fotos/fotos.service";
import { File as FileNgx } from "@ionic-native/file/ngx";
import { Camera, CameraOptions } from "@ionic-native/camera/ngx";
import { Platform } from "@ionic/angular";
import { AuthService } from '../../services/auth/auth.service';
import { Foto } from "src/app/interfaces/foto";
import { ActivatedRoute } from "@angular/router";
import {
  NavController,
  LoadingController,
  ToastController
} from "@ionic/angular";
import { Component, OnInit } from "@angular/core";
import { Subscription, Observable } from "rxjs";
import { ProfileService } from "../../services/user/profile.service";

import { AngularFireStorage } from "@angular/fire/storage";
import { finalize } from "rxjs/operators";
import { UserProfile } from '../../interfaces/user';

import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-photos',
  templateUrl: './photos.page.html',
  styleUrls: ['./photos.page.scss'],
})
export class PhotosPage implements OnInit {
  private fotoId: string = null;
  public foto: Foto = {};
  private loading: any;
  public userProfile: UserProfile;
  public uploadPercent: Observable<number>;
  public downloadUrl: Observable<string>;
  public fotos = new Array<Foto>();
  private fotosSubscription: Subscription;
  private file: File;
  private arquivo: FileNgx;

  image = 'https://www.kasterencultuur.nl/editor/placeholder.jpg';
  imagePath: string;
  upload: any;

  constructor(
    private fotoService: FotoService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private loadingCtrl: LoadingController,
    private authService: AuthService,
    private toastCtrl: ToastController,
    private profileService: ProfileService,
    private camera: Camera,
    private platform: Platform,
    private fotosService: FotosService,
    private afStorage: AngularFireStorage,
    private firebaseService: FirebaseService,
    public actionSheetController: ActionSheetController
  ) {
    this.fotoId = this.activatedRoute.snapshot.params["id"];
    if (this.fotoId) this.loadPhotos();

    // this.fotosSubscription = this.fotoService
    //   .getFotos()
    //   .subscribe(data => {
    //     this.fotos = data;
    //   });

  }

  ngOnInit() {
    this.loadPhotos();
    this.profileService.getUserProfile().then(profile$ => {
      profile$.subscribe(userProfile => {
        this.userProfile = userProfile;
        console.log(this.userProfile);
      });
    });

  }

  ngOnDestroy() {
    if (this.fotosSubscription) this.fotosSubscription.unsubscribe();
  }

  loadPhotos() {
    this.fotosSubscription = this.fotoService
      .getFotos()
      .subscribe(data => {
        this.fotos = data;
      });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Nova imagem',
      buttons: [{
        text: 'Enviar da Galeria',
        icon: 'albums',
        handler: () => {
          this.addPhoto('library')
          console.log('library clicked');
        }
      }, {
        text: 'Tirar uma foto',
        icon: 'camera',
        handler: () => {
          this.addPhoto('camera')
          console.log('camera clicked');
        }
      }, {
        text: 'Cancelar',
        icon: 'close',
        role: 'cancel',
        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await actionSheet.present();
  }

  async salvarFoto() {
    await this.presentLoading();
    console.log(this.foto.foto);

    this.profileService.getUserProfile().then(profile$ => {
      profile$.subscribe(userProfile => {
        this.userProfile = userProfile;
        console.log(this.userProfile);
      });
    });

    this.foto.nomeUsuario = this.userProfile.firstName;

    this.foto.userId = this.authService.getAuth().currentUser.uid;

    if (this.fotoId) {
      try {
        await this.fotoService.updateFoto(this.fotoId, this.foto);
        await this.loading.dismiss();
      } catch (error) {
        this.presentToast("erro update!!!");
        this.loading.dismiss();
      }
    } else {
      this.foto.data = new Date().getTime();

      try {
        await this.fotoService.addFoto(this.foto);
        await this.loading.dismiss();

      } catch (error) {
        this.presentToast("Erro add foto!!!");
        console.log(error);
        this.loading.dismiss();
      }
    }
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
      let fileName = "foto_" + Date.now();

      this.enviarImagem(blob, fileName);
    } catch (error) {
      console.log(error);
    }
  }

  enviarImagem(blob: Blob, fileName: string) {
    const ref = this.afStorage.ref("fotosNativo/");
    let uploadTask = ref.child("foto/" + fileName + ".png");

    const task = uploadTask.put(blob);

    this.uploadPercent = task.percentageChanges();

    task
      .snapShotChanges()
      .pipe(
        finalize(() => {
          this.downloadUrl = ref.getDownloadURL();
          this.foto.foto = this.downloadUrl.toString();

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
      this.presentToast(
        "Imagem inválida. O arquivo de imagem deve estar no formato JPG ou PNG."
      );
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
        let filename = "FOTOFESTA_" + Date.now();
        this.firebaseService
          .uploadImage(this.file, filename, UploadTypeEnum.FOTOFESTA)
          .then((result: { url: string; urlSafe: string }) => {
            // const imagem = result.url;
            console.log(result.url);
            this.foto.foto = result.url;
            console.log(this.foto.foto);
            this.salvarFoto();
            this.loading.dismiss();
          });
      }
    };
    reader.readAsArrayBuffer(this.file);
  }

  loadData(event) {
    setTimeout(() => {
      console.log("Done");
      event.target.complete();
    }, 500);
  }

  async addPhoto(source: string) {
    if (source === 'library') {
      console.log('library');
      const libraryImage = await this.openLibrary();
      this.image = 'data:image/jpg;base64,' + libraryImage;
    } else {
      console.log('camera');
      const cameraImage = await this.openCamera();
      this.image = 'data:image/jpg;base64,' + cameraImage;
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
      sourceType: this.camera.PictureSourceType.CAMERA
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
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY
    };
    return await this.camera.getPicture(options);
  }

  async uploadFirebase() {
    await this.loading.present();
    let filename = "FOTOFESTA_" + Date.now();

    this.firebaseService
      .uploadImage(this.file, filename, UploadTypeEnum.FOTOFESTA)
      .then((result: { url: string; urlSafe: string }) => {
        // const imagem = result.url;
        console.log(result.url);
        this.foto.foto = result.url;
        console.log(this.foto.foto);
        this.salvarFoto();
        this.loading.dismiss();
      });

  }


}
