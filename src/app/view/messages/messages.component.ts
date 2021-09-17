import {Component, OnDestroy, OnInit} from '@angular/core';
import {MainComponent} from "../main/main.component";
import {MessageService} from "../../services/MessageService";
import {Conversation} from "../../bo/chat/Conversation";
import {Message} from "../../bo/chat/Message";
import {AppComponent} from "../../app.component";
import {UserLight} from "../../bo/user/UserLight";

@Component({
  selector: 'app-main',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit, OnDestroy {
  mainComponentInstance: MainComponent;
  conversations: Conversation[] = [];
  messages: Message[] = [];
  conversationListFilter = {
    conversationId: null,
    start: 0,
    limit: 50
  };
  totalMessages = 0;
  currentChatSubscriptionId: string;
  currentConversation: Conversation = null;

  constructor(private messageService: MessageService) {
  }

  ngOnInit(): void {
    this.messageService.getUsersConversations().subscribe(result => {
      this.conversations = result;
    });
  }

  getConversationNames(conversation: Conversation) {
    let name = '';
    for (let user of conversation.users) {
      if (user.userId !== AppComponent.profileInfo.userId) {
        name += user.firstName + ' ' + user.lastName + ',';
      }
    }
    return name.slice(0, -1);
  }

  getConversation(conversation: Conversation) {
    this.currentConversation = conversation;
    this.openSocket();
    this.conversationListFilter.conversationId = conversation.conversationId;
    this.messageService.getMessagesOfConversation(this.conversationListFilter).subscribe(result => {
      console.log(result);
      this.messages = result.result;
      this.totalMessages = result.total;
    })
  }

  openSocket() {
    this.closeConversation();
    this.currentChatSubscriptionId = this.mainComponentInstance.stompClient.subscribe('/socket-publisher/conversation/' + this.currentConversation.conversationId, (messageJson) => {
      console.log(JSON.parse(messageJson.body))
      this.messages.push(JSON.parse(messageJson.body));
    }, {
      withCredentials: true
    }).id;
  }

  ngOnDestroy(): void {
    this.closeConversation();
  }

  closeConversation() {
    if (this.currentChatSubscriptionId != null) {
      this.mainComponentInstance.stompClient.unsubscribe(this.currentChatSubscriptionId)
      this.currentChatSubscriptionId = null;
    }
  }

  isMe(userId) {
    return AppComponent.profileInfo.userId == userId;
  }

  sendMessage(chatMessageField) {
    const message = new Message();
    const user = new UserLight();
    user.userId = AppComponent.profileInfo.userId;
    message.user = user;
    message.createTime = new Date();
    message.text = chatMessageField.value;
    message.conversation = this.currentConversation;
    this.messageService.sendMessage(message);
  }
}
