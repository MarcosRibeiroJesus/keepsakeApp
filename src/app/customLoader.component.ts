import { HttpClient } from '@angular/common/http';
import { TranslateLoader } from "@ngx-translate/core";
import { Observable, of } from 'rxjs';
import { Injectable, Injector } from '@angular/core';

@Injectable()
export class CustomLoader implements TranslateLoader {
    constructor(private inej:Injector){}

    getTranslation(lang: string): Observable<any> {
        let http = this.inej.get(HttpClient);
        return http.get(`./assets/i18n/${lang}.json`);
    }
  }