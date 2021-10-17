import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  allConversations: Conversation[] = null;
  conversations: Conversation[] = [];
  messages: Message[] = [];
  conversationListFilter = {
    conversationId: null,
    start: 0,
    limit: 50,
    total: 100
  };
  totalMessages = 0;
  currentChatSubscriptionId: string;
  currentConversation: Conversation = null;
  searchConversationText: string;
  @ViewChild('chat') chat: ElementRef;

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
    this.conversationListFilter.start = 0;
    this.currentConversation = conversation;
    this.openSocket();
    this.conversationListFilter.conversationId = conversation.conversationId;
    this.messageService.getMessagesOfConversation(this.conversationListFilter).subscribe(result => {
      this.messages = result.result;
      this.conversationListFilter.total = result.total;
      this.totalMessages = result.total;
      const scope = this;
      setTimeout(function () {
        scope.chat.nativeElement.scrollTop = scope.chat.nativeElement.scrollHeight;
      }, 200);
    })
  }

  openSocket() {
    this.closeConversation();
    this.currentChatSubscriptionId = this.mainComponentInstance.stompClient.subscribe('/socket-publisher/conversation/' + this.currentConversation.conversationId, (messageJson) => {
      this.messages.push(JSON.parse(messageJson.body));
      this.totalMessages += 1;
      const scope = this;
      setTimeout(function () {
        scope.chat.nativeElement.scrollTop = scope.chat.nativeElement.scrollHeight;
      }, 200);
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
    chatMessageField.value = '';
  }

  searchConversations() {
    if (this.allConversations == null) {
      this.allConversations = this.conversations;
    }
    this.conversations = this.allConversations.filter(record => {
      for (let word of this.searchConversationText.split(' ')) {
        if (this.getConversationNames(record).toLowerCase().indexOf(word.toLowerCase()) === -1) {
          return false;
        }
      }
      return true;
    });
  }

  getConversationPhoto(conversation: Conversation) {
    if (conversation != null) {
      for (let user of conversation.users) {
        if (!this.isMe(user.userId) && user.photo != null) {
          return 'https://drive.google.com/uc?export=view&id=' + user.photo;
        }
      }
    }
    return 'assets/nophoto.png';
  }

  onChatScroll(event) {
    if (event.target.scrollTop == 0 && this.conversationListFilter.start < this.totalMessages) {
      this.conversationListFilter.start += 50;
      this.messageService.getMessagesOfConversation(this.conversationListFilter).subscribe(result => {
        const firstMessageId = this.messages[0].messageId;
        const resultMessages = [];
        for (let message of result.result) {
          resultMessages.push(message);
        }
        for (let message of this.messages) {
          resultMessages.push(message);
        }
        this.messages = resultMessages;
        const scope = this;
        setTimeout(function () {
          scope.chat.nativeElement.scrollTop = document.getElementById('message-' + firstMessageId).offsetHeight - 120;
        }, 200)
      });
    }
  }
  locale() {
    return AppComponent.locale;
  }
}
