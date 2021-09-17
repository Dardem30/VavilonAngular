import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {AppComponent} from "../app.component";
import {HttpClient} from "@angular/common/http";
import {Conversation} from "../bo/chat/Conversation";
import {SearchResult} from "../bo/SearchResult";
import {Message} from "../bo/chat/Message";

@Injectable()
export class MessageService {

  constructor(private http: HttpClient) {

  }

  getConversation(userIds: any[]): Observable<Conversation> {
    return this.http.post<Conversation>(AppComponent.apiEndpoint + 'message/getConversation', {
      userIds: userIds
    }, {
      withCredentials: true
    });
  }

  startConversation(message: Message, userIds: any[]): Observable<Conversation> {
    return this.http.post<Conversation>(AppComponent.apiEndpoint + 'message/startConversation', {
      userIds: userIds,
      body: message
    }, {
      withCredentials: true
    });
  }
  sendMessage(message: Message) {
    this.http.post(AppComponent.apiEndpoint + 'message/sendMessage', message, {
      withCredentials: true
    }).subscribe(() => {});
  }
  getMessagesOfConversation(listFilter: any): Observable<SearchResult<Message>> {
    return this.http.post<SearchResult<Message>>(AppComponent.apiEndpoint + 'message/getMessagesOfConversation', listFilter, {
      withCredentials: true
    });
  }
  getUsersConversations(): Observable<Conversation[]> {
    return this.http.get<Conversation[]>(AppComponent.apiEndpoint + 'message/getUsersConversations', {
      withCredentials: true
    });
  }
}
