import {
  AfterViewInit,
  Component,
  ComponentFactoryResolver,
  ElementRef,
  OnInit,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import {AnnouncementService} from "../../services/AnnouncementService";
import {AnnouncementOverviewItem} from "../../bo/announcement/AnnouncementOverviewItem";
import {MatPaginator} from "@angular/material/paginator";
import {SecurityService} from "../../services/SecurityService";
import {MatSidenav} from "@angular/material/sidenav";
import {AppComponent, Locale} from "../../app.component";
import {ErrorStateMatcher} from "@angular/material/core";
import {FormControl, FormGroupDirective, NgForm, Validators} from "@angular/forms";
import {HomeComponent} from "../home/home.component";
import {UserCardComponent} from "../userCard/userCard.component";
import {ProductComponent} from "../product/product.component";
import {ContactComponent} from "../contact/contact.component";
import {AnnouncementComponent} from "../announcement/announcement.component";
import {AnnouncementDetailsComponent} from "../announcement/announcementDetails/announcementDetails.component";
import {AnnouncementViewerComponent} from "../home/announcementViewer/announcementViewer.component";
import {MapLoaderService} from "../../services/MapLoaderService";
import {Stomp} from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import {MessageService} from "../../services/MessageService";
import {Conversation} from "../../bo/chat/Conversation";
import {Message} from "../../bo/chat/Message";
import {UserLight} from "../../bo/user/UserLight";
import {MessagesComponent} from "../messages/messages.component";
import {ApproveAnnouncementOverviewComponent} from "../approveAnnouncementOverview/approveAnnouncementOverview.component";
import {ModerationStatus} from "../../bo/announcement/ModerationStatus";
import {ProfileComponent} from "../profile/profile.component";

declare const google: any;

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit, AfterViewInit {
  showFiller = false;
  panelOpenState = false;
  announcementSearchForm: any = {
    start: 0,
    limit: 50,
    total: 100,
    coordinates: [],
    sort: {
      property: "rating",
      direction: "DESC"
    }
  };
  sortOptions: string[] = ['rating', 'price', 'productName']
  directionOptions: string[] = ['ASC', 'DESC']
  authForm: any = {
    login: null,
    password: null
  };
  verificationModel: any = {
    userId: null,
    activationCode: null
  };
  registrationModel: any = {
    firstName: null,
    lastName: null,
    login: null,
    password: null,
    email: null
  };
  openChat = true;
  heightChecked = false;
  initHeight = 0;
  langs = [{
    locale: Locale.EN,
    src: 'assets/en.png'
  }, {
    locale: Locale.RU,
    src: 'assets/ru.png'
  }];
  selectedLanguage = this.langs[0];
  announcements: AnnouncementOverviewItem[] = [];
  @ViewChild('accordionHeader') accordionHeader: any;
  @ViewChild('paginator') paginator: MatPaginator;
  @ViewChild('loginForm') loginForm: ElementRef;
  @ViewChild('chatHistory') chatHistory: ElementRef;
  @ViewChild('registrationForm') registrationForm: ElementRef;
  @ViewChild('verificationForm') verificationForm: ElementRef;
  @ViewChild('authSideNav') authSideNav: MatSidenav;
  @ViewChild('sidenav') profileSideNav: MatSidenav;
  @ViewChild('mainContent', {read: ViewContainerRef}) mainContent: ViewContainerRef;
  authStates = AuthState;
  authState: AuthState;
  verificationEmail: string;
  matcher = new Validator();
  currentComponent: any;
  activeTab: MainTabs = MainTabs.HOME;
  tabs = MainTabs;
  map: any;
  drawingManager: any;
  stompClient;
  showChat = false;
  conversation: Conversation = null;
  messages: Message[] = [];
  conversationListFilter = {
    conversationId: null,
    start: 0,
    limit: 50,
    total: 100
  };
  totalMessages = 0;
  usersInCurrentConversation: UserLight[] = [];
  currentChatSubscriptionId: string;
  moderationStatuses: ModerationStatus[] = [];

  constructor(private announcementService: AnnouncementService,
              private componentFactoryResolver: ComponentFactoryResolver,
              private messageService: MessageService,
              private securityService: SecurityService) {
  }

  ngOnInit(): void {
    const scope = this;
    AppComponent.updateLocaleFn = function (selectedLocale) {
      for (let lang of scope.langs) {
        if (lang.locale == selectedLocale) {
          scope.selectedLanguage = lang;
          break;
        }
      }
    }
    AppComponent.onReceivingProfileInfo = function () {
      scope.initializeWebSocketConnection();
    };
    const activateUser = localStorage.getItem('activateUser');
    if (activateUser != null && activateUser == 'true') {
      localStorage.setItem('activateUser', 'false');
      this.authState = this.authStates.VerificationCode;
      const scope = this;
      setTimeout(function () {
        scope.authSideNav.toggle();
      }, 500)
    } else {
      this.authState = this.authStates.Login
    }
    setTimeout(function () {
      let factory = scope.componentFactoryResolver.resolveComponentFactory(HomeComponent);
      let ref: any = scope.mainContent.createComponent(factory);
      scope.animateDiv(ref._rootLView[0], null)
      ref.instance.mainComponentInstance = scope;
      ref.changeDetectorRef.detectChanges();
      scope.currentComponent = ref;
      scope.searchAnnouncement();
    }, 300);
    this.announcementService.getModerationStatuses().subscribe(result => this.moderationStatuses = result);
    this.slideToggle();
  }
  ngAfterViewInit() {
    MapLoaderService.load().then(() => {
      this.drawMap();
    })
  }
  drawMap() {

    this.map = new google.maps.Map(document.getElementById('main-map'), {
      center: {lat: 61, lng:  74},
      zoom: 2
    });

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.MARKER,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['marker']
      }
    });

    this.drawingManager.setMap(this.map);
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      this.announcementSearchForm.coordinates.push({lat: event.overlay.position.lat(), lng: event.overlay.position.lng()})
    });


    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
    this.map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);
    const scope = this;
    this.map.addListener("bounds_changed", () => {
      searchBox.setBounds(scope.map.getBounds());
    });
    let markers = [];
    searchBox.addListener("places_changed", () => {
      const map = scope.map;
      const places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }

      // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];

      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();

      places.forEach((place) => {
        if (!place.geometry || !place.geometry.location) {
          console.log("Returned place contains no geometry");
          return;
        }

        const icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25),
        };

        // Create a marker for each place.
        markers.push(
          new google.maps.Marker({
            map,
            icon,
            title: place.name,
            position: place.geometry.location,
          })
        );
        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });
  }
  animateDiv(div, params) {
    if (params != null && params.isClose) {
      console.log('test')
      div.classList.add('main-content_slide-in-right');
      setTimeout(function () {
        div.classList.remove('main-content_slide-in-right');
      }, 510);
   } else {
      div.classList.add('main-content_slide-in-left');
      setTimeout(function () {
        div.classList.remove('main-content_slide-in-left');
      }, 510);
   }
  }
  switchTab(tab: MainTabs, params, toggle: boolean): void {
    if (this.panelOpenState) {
      this.accordionHeader.close();
      this.panelOpenState = false
    }
    const viewRef: any = this.mainContent.get(0);
    if (params != null && params.isClose) {
      viewRef._view[0].classList.add('main-content_slide-out-left');
    } else {
      viewRef._view[0].classList.add('main-content_slide-out-right');
    }
    const scope = this;
    setTimeout(function () {
      if (params != null && params.isClose) {
        viewRef._view[0].classList.remove('main-content_slide-out-left');
      } else {
        viewRef._view[0].classList.remove('main-content_slide-out-right');
      }
      scope.mainContent.remove(0);
      scope.activeTab = tab;
      let factory;
      let ref;
      switch (tab) {
        case MainTabs.HOME:
          factory = scope.componentFactoryResolver.resolveComponentFactory(HomeComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.instance.mainComponentInstance = scope;
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          scope.searchAnnouncement();
          break
        case MainTabs.APPROVE_ANNOUNCEMENT_OVERVIEW:
          factory = scope.componentFactoryResolver.resolveComponentFactory(ApproveAnnouncementOverviewComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.instance.mainComponentInstance = scope;
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          scope.searchAnnouncement();
          break
        case MainTabs.CARDS:
          factory = scope.componentFactoryResolver.resolveComponentFactory(UserCardComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          break
        case MainTabs.PRODUCTS:
          factory = scope.componentFactoryResolver.resolveComponentFactory(ProductComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          break
        case MainTabs.CONTACT:
          factory = scope.componentFactoryResolver.resolveComponentFactory(ContactComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          break
        case MainTabs.ANNOUNCEMENT:
          factory = scope.componentFactoryResolver.resolveComponentFactory(AnnouncementComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.instance.mainComponentInstance = scope;
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          break
        case MainTabs.MESSAGES:
          factory = scope.componentFactoryResolver.resolveComponentFactory(MessagesComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.instance.mainComponentInstance = scope;
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          break
        case MainTabs.PROFILE:
          factory = scope.componentFactoryResolver.resolveComponentFactory(ProfileComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.instance.mainComponentInstance = scope;
          if (params != null) {
            for (let name in params) {
              ref.instance[name] = params[name];
            }
          }
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          break
        case MainTabs.ANNOUNCEMENT_DETAILS:
          factory = scope.componentFactoryResolver.resolveComponentFactory(AnnouncementDetailsComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.instance.mainComponentInstance = scope;
          if (params != null) {
            for (let name in params) {
              ref.instance[name] = params[name];
            }
          }
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          break
        case MainTabs.ANNOUNCEMENT_VIEWER:
          factory = scope.componentFactoryResolver.resolveComponentFactory(AnnouncementViewerComponent);
          ref = scope.mainContent.createComponent(factory);
          scope.animateDiv(ref._rootLView[0], params)
          ref.instance.mainComponentInstance = scope;
          if (params != null) {
            for (let name in params) {
              ref.instance[name] = params[name];
            }
          }
          ref.changeDetectorRef.detectChanges();
          scope.currentComponent = ref;
          break
      }
      if (toggle) {
        scope.profileSideNav.toggle();
      }
    }, 500);
  }

  onSearchIconClick(): void {
    this.panelOpenState = !this.panelOpenState
    if (this.panelOpenState) {
      this.accordionHeader.open();
    } else {
      this.accordionHeader.close();
    }
  }

  searchAnnouncement() {
    this.currentComponent.instance.searchAnnouncement(this.announcementSearchForm);
  }

  login() {
    if (!this.isLoginFormInvalid()) {
      this.securityService.login(this.authForm).subscribe(result => {
        if (result.success) {
          this.authSideNavErrorMessage = '';
          this.authSideNav.toggle();
          this.securityService.getProfileInfo().subscribe(profileInfo => {
            profileInfo.photo = profileInfo.photo == null ? 'assets/nophoto.png' : 'https://drive.google.com/uc?export=view&id=' + profileInfo.photo;
            AppComponent.profileInfo = profileInfo;
            AppComponent.profileInfo.loggedIn = true;
          });
          this.initializeWebSocketConnection();
        } else {
          this.authSideNavErrorMessage = 'Login or password is/are incorrect'
        }
      }, () => this.authSideNavErrorMessage = 'Login or password is/are incorrect')
    }
  }

  registration() {
    if (!this.isRegistrationFormInvalid()) {
      this.securityService.registration(this.registrationModel).subscribe(result => {
        if (result.success) {
          this.authSideNavErrorMessage = '';
          localStorage.setItem('userId', result.userId);
          this.verificationEmail = this.registrationModel.email;
          this.switchAuthForm(this.authStates.VerificationCode);
        } else {
          this.authSideNavErrorMessage = result.message
        }
      }, () => this.authSideNavErrorMessage = 'Something is wrong on our side. Please contact administrator')
    }
  }

  activateUser() {
    if (!this.isVerificationCodeFormInvalid()) {
      // @ts-ignore
      this.verificationModel.userId = parseInt(localStorage.getItem('userId'))
      this.securityService.activateUser(this.verificationModel).subscribe(result => {
        if (result.success) {
          this.authSideNavErrorMessage = '';
          this.switchAuthForm(this.authStates.Login)
        } else {
          this.authSideNavErrorMessage = result.message
        }
      })
    }
  }

  switchAuthForm(state: AuthState) {
    this.authSideNavErrorMessage = '';
    const scope = this;
    let previousForm: any;
    if (this.authState == AuthState.Login) {
      previousForm = scope.loginForm;
      scope.loginForm.nativeElement.classList.remove('slide-in-left');
      scope.loginForm.nativeElement.classList.add('slide-out-right');
    } else if (this.authState == AuthState.Registration) {
      previousForm = scope.registrationForm;
      scope.registrationForm.nativeElement.classList.remove('slide-in-left');
      scope.registrationForm.nativeElement.classList.add('slide-out-right');
    } else if (this.authState == AuthState.VerificationCode) {
      previousForm = scope.verificationForm;
      scope.verificationForm.nativeElement.classList.remove('slide-in-left');
      scope.verificationForm.nativeElement.classList.add('slide-out-right');
    }
    setTimeout(function () {
      scope.authState = state;
      previousForm.nativeElement.classList.remove('slide-out-right');
      if (state == AuthState.Login) {
        scope.loginForm.nativeElement.classList.add('slide-in-left');
      } else if (state == AuthState.Registration) {
        scope.registrationForm.nativeElement.classList.add('slide-in-left');
      } else if (state == AuthState.VerificationCode) {
        scope.verificationForm.nativeElement.classList.add('slide-in-left');
      }
    }, 500);
  }

  getProfileInfo() {
    return AppComponent.profileInfo;
  }

  logout() {
    this.securityService.logout();
    AppComponent.logout();
    this.switchTab(MainTabs.HOME, {
      isClose: true
    }, false);
  }


  loginValidator = new FormControl('', [
    Validators.required
  ]);
  passwordValidator = new FormControl('', [
    Validators.required
  ]);

  isLoginFormInvalid() {
    return this.loginValidator.invalid || this.passwordValidator.invalid
  }

  verificationCodeValidator = new FormControl('', [
    Validators.required
  ]);

  isVerificationCodeFormInvalid() {
    return this.verificationCodeValidator.invalid
  }

  firstNameValidator = new FormControl('', [
    Validators.required
  ]);
  lastNameValidator = new FormControl('', [
    Validators.required
  ]);
  registrationLoginValidator = new FormControl('', [
    Validators.required
  ]);
  registrationPasswordValidator = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(18)
  ]);
  emailValidator = new FormControl('', [
    Validators.required,
    Validators.email
  ]);
  authSideNavErrorMessage: string;

  isRegistrationFormInvalid() {
    return this.firstNameValidator.invalid
      || this.lastNameValidator.invalid
      || this.registrationLoginValidator.invalid
      || this.registrationPasswordValidator.invalid
      || this.emailValidator.invalid
  }

  slideToggle() {
    const chat = document.getElementById('main-chat');
    if (!this.heightChecked) {
      this.initHeight = chat.offsetHeight;
      this.heightChecked = true;
    }
    if (this.openChat) {
      this.openChat = false;
      chat.style.height = '0px';
    }
    else {
      this.openChat = true;
      chat.style.height = this.initHeight + 'px';
    }
  }
  initializeWebSocketConnection() {
    let ws = new SockJS(AppComponent.apiEndpoint + 'vavilon-websocket');
    this.stompClient = Stomp.over(ws);
    this.stompClient.connect({
      withCredentials: true
    }, () => {});
  }
  openSocket() {
    this.closeChat();
    this.showChat = true;
    this.currentChatSubscriptionId = this.stompClient.subscribe('/socket-publisher/conversation/' + this.conversation.conversationId, (messageJson) => {
      this.messages.push(JSON.parse(messageJson.body));
      this.totalMessages += 1;
      const scope = this;
      setTimeout(function () {
        scope.chatHistory.nativeElement.scrollTop = scope.chatHistory.nativeElement.scrollHeight;
      }, 200);
    }, {
      withCredentials: true
    }).id;
  }

  startChat(user) {
    this.conversationListFilter.start = 0;
    this.showChat = true;
    this.usersInCurrentConversation = [user];
    this.messageService.getConversation(this.getUserIdsInCurrentConversation()).subscribe(conversation => {
      this.conversation = conversation;
      console.log(conversation);
      if (conversation != null) {
        this.openSocket();
        this.conversationListFilter.conversationId = this.conversation.conversationId;
        this.messageService.getMessagesOfConversation(this.conversationListFilter).subscribe(result => {
          this.messages = result.result;
          this.conversationListFilter.total = result.total;
          this.totalMessages = result.total;
          const scope = this;
          setTimeout(function () {
            scope.chatHistory.nativeElement.scrollTop = scope.chatHistory.nativeElement.scrollHeight;
          }, 200);
        })
      }
    })
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
          scope.chatHistory.nativeElement.scrollTop = document.getElementById('chatMessage-' + firstMessageId).offsetTop - 70;
        }, 100);
      });
    }
  }

  sendMessage(chatMessageField: HTMLInputElement) {
    const message = new Message();
    const user = new UserLight();
    user.userId = AppComponent.profileInfo.userId;
    message.user = user;
    message.createTime = new Date();
    message.text = chatMessageField.value;
    if (this.conversation == null) {
      this.messageService.startConversation(message, this.getUserIdsInCurrentConversation()).subscribe(conversation => {
        this.messages.push(message);
        this.conversation = conversation;
        this.openSocket();
      })
    } else {
      message.conversation = this.conversation;
      this.messageService.sendMessage(message);
    }
    chatMessageField.value = '';
  }
  getUserIdsInCurrentConversation() : number[] {
    return this.usersInCurrentConversation.map(user => user.userId);
  }
  getUsersInCurrentConversation() : string {
    let name = '';
    for (let user of this.usersInCurrentConversation) {
      name += user.firstName + ' ' + user.lastName + ',';
    }
    return name.slice(0, -1);
  }

  isYou(userId) {
    return AppComponent.profileInfo.userId == userId;;
  }

  closeChat() {
    if (this.currentChatSubscriptionId != null) {
      this.stompClient.unsubscribe(this.currentChatSubscriptionId)
      this.showChat = false;
      this.currentChatSubscriptionId = null;
    }
  }

  getCurrencySigns() {
    return AppComponent.currencySigns;
  }
  formatLabel(value: number) {
    if (value >= 1000) {
      return value / 1000.0 + 'k';
    }

    return value;
  }
  changeLocale() {
    AppComponent.switchLocale(this.selectedLanguage.locale);
  }
  locale() {
    return AppComponent.locale;
  }
}

export enum AuthState {
  Login,
  Registration,
  VerificationCode
}

export enum MainTabs {
  HOME,
  CARDS,
  PRODUCTS,
  CONTACT,
  ANNOUNCEMENT,
  APPROVE_ANNOUNCEMENT_OVERVIEW,
  ANNOUNCEMENT_DETAILS,
  ANNOUNCEMENT_VIEWER,
  MESSAGES,
  PROFILE
}
export enum ModerationStatuses {
  TO_BE_REVIEWED = 1,
  APPROVED = 2,
  DECLINED = 3
}

export class Validator implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control && control.invalid && (control.dirty || control.touched));

  }
}
