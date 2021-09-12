import {Component} from '@angular/core';
import {ProfileInfo} from "./bo/ProfileInfo";
import {SecurityService} from "./services/SecurityService";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'VavilonAngular';
  //public static apiEndpoint = 'https://vavilon-dev.herokuapp.com/';
  public static apiEndpoint = 'http://localhost:8081/';
  public static profileInfo: ProfileInfo = {
    active: false,
    email: "",
    login: "",
    role: "",
    userId: -1,
    firstName: 'Имя',
    lastName: 'Фамилия',
    loggedIn: false
  };
  public static currencySigns: string[] = ["&dollar;", "&euro;", "&#8381;"];

  constructor(securityService: SecurityService) {
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
      AppComponent.profileInfo = profileInfo;
      AppComponent.profileInfo.loggedIn = true;
    }, error => {
      console.log('Unautherized')
    });
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
      loggedIn: false
    }
  }
}
