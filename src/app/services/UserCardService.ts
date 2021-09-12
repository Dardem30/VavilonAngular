import {Injectable} from "@angular/core";
import {AppComponent} from "../app.component";
import {HttpClient} from "@angular/common/http";
import {UserCard} from "../bo/userCard/UserCard";
import {Observable} from "rxjs";
import {UserCardLight} from "../bo/userCard/UserCardLight";

@Injectable()
export class UserCardService {

  constructor(private http: HttpClient) {

  }

  save(userCard: UserCard): Observable<any> {
    return this.http.post(AppComponent.apiEndpoint + 'userCard/save', userCard, {
      withCredentials: true
    });
  }

  getUserCards(): Observable<UserCardLight[]> {
    return this.http.get<UserCardLight[]>(AppComponent.apiEndpoint + 'userCard/list', {
      withCredentials: true
    });
  }

  readUserCard(userCardId: any) {
    return this.http.get<UserCard>(AppComponent.apiEndpoint + 'userCard/read?userCardId=' + userCardId, {
      withCredentials: true
    });
  }
}
