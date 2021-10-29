import {Component} from '@angular/core';
import {ProfileInfo} from "./bo/ProfileInfo";
import {SecurityService} from "./services/SecurityService";
import * as enLocalization from 'src/app/localization/vavilon.en';
import * as ruLocalization from 'src/app/localization/vavilon.ru';
import {HttpClient} from "@angular/common/http";

export enum Locale {
  EN,
  RU
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'VavilonAngular';
  // public static apiEndpoint = 'https://vavilon-dev.herokuapp.com/';
 public static apiEndpoint = 'http://localhost:8081/';
  public static profileInfo: ProfileInfo = {
    active: false,
    email: "",
    login: "",
    role: "",
    userId: -1,
    firstName: 'Имя',
    lastName: 'Фамилия',
    loggedIn: false,
    photo: 'assets/nophoto.png'
  };
  public static currencySigns: string[] = ["&dollar;", "&euro;", "&#8381;"];
  public static locale = enLocalization;
  public static showLoadingMask = false;
  public static colScale = 750;
  public static selectedLocale = Locale.EN;
  public static updateLocaleFn = function (locale) {};
  public static onReceivingProfileInfo = function () {};

  constructor(private http: HttpClient,
              securityService: SecurityService) {
    const urlSearchParams = new URLSearchParams(window.location.search);
    const userId = urlSearchParams.get('userId');
    const activateUser = urlSearchParams.get('activateUser');
    if (userId != null) {
      localStorage.setItem('userId', userId);
    }
    if (activateUser != null) {
      localStorage.setItem('activateUser', activateUser);
    }
    securityService.getProfileInfo().subscribe(profileInfo => {
      profileInfo.photo = profileInfo.photo == null ? 'assets/nophoto.png' : 'https://drive.google.com/uc?export=view&id=' + profileInfo.photo;
      AppComponent.profileInfo = profileInfo;
      AppComponent.profileInfo.loggedIn = true;
      AppComponent.onReceivingProfileInfo();
    }, error => {
      console.log('Unautherized')
    });
    let locale: any = localStorage.getItem('locale');
    if (locale == null) {
      this.http.get('http://ip-api.com/json').subscribe((result: {country:string}) => {
        const country = result.country;
        if (country == 'Belarus' || country == 'Russia' || country == 'Ukraine') {
          AppComponent.locale = ruLocalization;
          AppComponent.selectedLocale = Locale.RU;
        } else {
          AppComponent.locale = enLocalization;
          AppComponent.selectedLocale = Locale.EN;
        }
        AppComponent.updateLocaleFn(AppComponent.selectedLocale);
      })
    }
  }
  static logout() {
    AppComponent.profileInfo = {
      active: false,
      email: "",
      login: "",
      role: "",
      userId: -1,
      firstName: 'Имя',
      lastName: 'Фамилия',
      loggedIn: false,
      photo: 'assets/nophoto.png'
    }
  }
  static switchLocale(locale: Locale) {
    localStorage.setItem('locale', locale + '');
    switch (locale) {
      case Locale.EN:
        AppComponent.locale = enLocalization;
        AppComponent.selectedLocale = Locale.EN;
        break;
      case Locale.RU:
        AppComponent.locale = ruLocalization;
        AppComponent.selectedLocale = Locale.RU;
        break
    }
  }

  isShowLoadingMask() {
    return AppComponent.showLoadingMask;
  }
}
