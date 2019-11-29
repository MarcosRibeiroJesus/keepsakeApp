import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { LoadingController, Platform } from '@ionic/angular';
import * as firebase from 'firebase/app';
import 'firebase/storage';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ImageHelper {
  
    public imageURLTest = '';

    public isCordova: boolean = false;
    public isAndroid: boolean = false;
    public isIOS: boolean = false;
    public isCore: boolean = false;
    public isIphone: boolean = false;
    public isMobile: boolean = false;
    public isMobileweb: boolean = false;

    public firebaseStorageRef: any;

    constructor(
        public platform: Platform,
        private camera: Camera,
        private _sanitizer: DomSanitizer,
        public loadingCtrl: LoadingController,
    ) {
        this.isCordova = this.platform.is('cordova');
        this.isAndroid = this.platform.is('android');
        this.isIOS = this.platform.is('ios');
        this.isIphone = this.platform.is('iphone');
        this.isMobile = this.platform.is('mobile');
        this.isMobileweb = this.platform.is('mobileweb');
        this.firebaseStorageRef = firebase.storage().ref('/usuarios/');
    };

    async getImage(cam: boolean, email: string, typeEnum: UploadTypeEnum): Promise<any> {
        console.log('getImage');
        console.log('this.isCordova >> ' + this.isCordova);
        console.log('this.isAndroid >> ' + this.isAndroid);
        console.log('this.isIOS >> ' + this.isIOS);
        console.log('this.isMobile >> ' + this.isMobile);
        console.log('this.isIphone >> ' + this.isIphone);
        console.log('this.isMobileweb >> ' + this.isMobileweb);

        let sourceTypeCamera = this.camera.PictureSourceType.PHOTOLIBRARY;
        if (cam) {
            sourceTypeCamera = this.camera.PictureSourceType.CAMERA;
        }

        if (environment.deviceNative && (this.isAndroid || this.isIOS)) {
            console.log('this.ambiente.getAppDeviceNative true');

            const options: CameraOptions = {
                quality: 100,
                targetWidth: 640,
                targetHeight: 640,
                sourceType: sourceTypeCamera,
                destinationType: this.camera.DestinationType.DATA_URL,
                encodingType: this.camera.EncodingType.PNG,
                mediaType: this.camera.MediaType.PICTURE,
                correctOrientation: true,
                // saveToPhotoAlbum: true
            }

            return this.camera.getPicture(options).then((imageData) => {
                console.log('this.camera.getPicture')
                // console.log(imageData)
                // this.loading = await this.loadingCtrl.create({
                //     message: 'Carregando...'
                // });
                // this.loading.present();

                let imageDataURI = 'data:image/png;base64,' + imageData;
                return new Promise((resolve, reject) => {
                    let reference = this.firebaseStorageRef.child(email + '_' + Date.now() + '.png');
                    return reference.putString(imageDataURI, firebase.storage.StringFormat.DATA_URL)
                        .then(() => {
                            return reference.getDownloadURL().then((url) => {
                                console.log('url')
                                console.log(url);
                                // this.loading.dismiss();
                                resolve({
                                    url: url,
                                    urlSafe: this._sanitizer.bypassSecurityTrustResourceUrl(url)
                                });
                            });
                        }).catch((err) => {
                            console.log('Ocorreu algum erro ao enviar o arquivo para o Firebase Google')
                            console.log(JSON.stringify(err));
                            // this.loading.dismiss();
                            reject(err);
                        });
                });
            }, (err) => {
                console.log('error', JSON.stringify(err));
                // this.loading.dismiss();
            }).catch((err) => {
                console.log('error catch', JSON.stringify(err));
                // this.loading.dismiss();
            });
        } else {
            console.log('this.ambiente.getAppDeviceNative false');
            return new Promise((resolve, reject) => {
                let urlAndUrlSafe = this._sanitizer.bypassSecurityTrustResourceUrl(this.imageURLTest);
                resolve({
                    url: this.imageURLTest,
                    urlSafe: urlAndUrlSafe
                });
            });
        }
    }

}

export enum UploadTypeEnum {
    USUARIO = "usuario",
}