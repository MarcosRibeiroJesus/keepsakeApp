import { Component } from '@angular/core';
import { InAppBrowser } from "@ionic-native/in-app-browser/ngx";

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor(private iab: InAppBrowser) {  }

  openFanpage() {
    this.iab.create('https://www.facebook.com/tatiaraujofotografia/', '_blank');
  }

}
