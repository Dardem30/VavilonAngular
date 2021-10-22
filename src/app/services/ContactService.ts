import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AppComponent} from "../app.component";
import {HttpClient} from "@angular/common/http";
import {Contact} from "../bo/contact/Contact";
import {ContactType} from "../bo/contact/ContactType";

@Injectable()
export class ContactService {

  constructor(private http: HttpClient) {

  }
  getContacts(): Observable<Contact[]> {
    return this.http.get<Contact[]>(AppComponent.apiEndpoint + 'contact/getUserContacts', {
      withCredentials: true
    });
  }

  getContactTypes(): Observable<ContactType[]> {
    return this.http.get<ContactType[]>(AppComponent.apiEndpoint + 'contact/getContactTypes', {
      withCredentials: true
    });
  }
  save(contact: Contact): Observable<any> {
    return this.http.post(AppComponent.apiEndpoint + 'contact/save', contact, {
      withCredentials: true
    });
  }

  deleteContacts(selectedContacts: number[]) {
    return this.http.delete(AppComponent.apiEndpoint + 'contact/deleteContacts?ids=' + selectedContacts.join(','), {
      withCredentials: true
    })
  }
}
