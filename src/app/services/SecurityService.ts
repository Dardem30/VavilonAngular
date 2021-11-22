import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AppComponent} from "../app.component";
import {HttpClient} from "@angular/common/http";
import {ProfileInfo} from "../bo/ProfileInfo";
import {UserProfileInfo} from "../bo/user/UserProfileInfo";

@Injectable()
export class SecurityService {

  constructor(private http: HttpClient) {

  }

  login(loginForm: any): Observable<any> {
    return this.http.post<any>(AppComponent.apiEndpoint + 'login', loginForm, {
      withCredentials: true
    });
  }

  registration(registrationModel: any): Observable<any> {
    return this.http.post<any>(AppComponent.apiEndpoint + 'registration', registrationModel);
  }

  activateUser(verificationModel: any) {
    return this.http.post<any>(AppComponent.apiEndpoint + 'activateUser', verificationModel);
  }

  getProfileInfo() {
    return this.http.get<ProfileInfo>(AppComponent.apiEndpoint + 'home', {
      withCredentials: true
    });
  }

  getUserProfileInfo(userId) {
    return this.http.get<UserProfileInfo>(AppComponent.apiEndpoint + 'readProfile?userId=' + userId);
  }

  saveUserProfileInfo(userId, info) {
    return this.http.post(AppComponent.apiEndpoint + 'updateProfileInfo?userId=' + userId, info,{
      withCredentials: true
    });
  }

  logout() {
    this.http.get(AppComponent.apiEndpoint + 'logout', {
      withCredentials: true
    }).subscribe();
  }

  uploadProfileImage(file) {
    const formDataForUploadingFiles = new FormData();
    formDataForUploadingFiles.append('inputFile', file);
    return this.http.post<any>(AppComponent.apiEndpoint + 'uploadPhoto', formDataForUploadingFiles, {
      withCredentials: true
    });
  }

  sendResetPasswordEmail(email) {
    console.log(email);
    return this.http.post<any>(AppComponent.apiEndpoint + 'sendResetPasswordEmail', email, {
      headers: {
        'Content-type': 'text/plain'
      }
    });
  }

  resetPassword(resetPasswordModel: any) {
    return this.http.post<any>(AppComponent.apiEndpoint + 'resetPassword', resetPasswordModel);
  }
}
