import {Component, OnInit, ViewChild} from '@angular/core';
import {AnnouncementService} from "../../services/AnnouncementService";
import {AppComponent} from "../../app.component";
import {AnnouncementOverviewItem} from "../../bo/announcement/AnnouncementOverviewItem";
import {MatPaginator} from "@angular/material/paginator";
import {SecurityService} from "../../services/SecurityService";
import {UserProfileInfo} from "../../bo/user/UserProfileInfo";
import {MainComponent, MainTabs} from "../main/main.component";

@Component({
  selector: 'app-main',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit{
  @ViewChild('paginator') paginator: MatPaginator;
  announcements: AnnouncementOverviewItem[] = [];
  activeTab: ProfileTabs = ProfileTabs.HOME;
  tabs = ProfileTabs;
  userId = AppComponent.profileInfo.userId;
  mainComponentInstance: MainComponent;
  announcementSearchForm: any = {
    userId: this.userId,
    start: 0,
    limit: 50,
    total: 100,
    sort: {
      property: "announcementId",
      direction: "DESC"
    }
  };
  userProfileInfo: UserProfileInfo = new UserProfileInfo();
  previousComponent = null;

  constructor(private announcementService: AnnouncementService,
              private securityService: SecurityService) {
  }

  ngOnInit(): void {
    this.announcementSearchForm.userId = this.userId;
    this.securityService.getUserProfileInfo(this.userId).subscribe(result => this.userProfileInfo = result);
    console.log(this.getAuthInfo().photo)
  }


  changeTab(tab: ProfileTabs) {
    if (tab == ProfileTabs.ANNOUNCEMENTS && this.announcements.length == 0) {
      this.searchAnnouncements();
    }
    this.activeTab = tab;
  }
  searchAnnouncements() {
    this.announcementService.searchForUser(this.announcementSearchForm).subscribe(result => {
      this.announcements = result.result;
      this.announcementSearchForm.total = result.total;
    });
  }

  pageChanged() {
    this.announcementSearchForm.start = this.announcementSearchForm.limit * this.paginator.pageIndex;
    this.searchAnnouncements();
  }
  getCurrentUserInfo() {
    return AppComponent.profileInfo;
  }

  saveInfo() {
    this.securityService.saveUserProfileInfo(this.userId, this.userProfileInfo.info).subscribe();
  }

  close() {
    if (this.previousComponent.params == null) {
      this.previousComponent.params = {
        isClose: true
      };
    } else {
      this.previousComponent.params.isClose = true;
    }
    this.mainComponentInstance.switchTab(this.previousComponent.component, this.previousComponent.params, false);
  }

  viewAnnouncement(announcement: AnnouncementOverviewItem) {
    this.mainComponentInstance.switchTab(MainTabs.ANNOUNCEMENT_VIEWER, {
      announcementId: announcement.announcementId,
      previousComponent: {
        component: MainTabs.PROFILE,
        params: {
          previousComponent: this.previousComponent,
          userId: this.userId
        }
      }
    }, false);
  }
  getAuthInfo() {
    return AppComponent.profileInfo;
  }

  profilePhotoUploaded(fileInputEvent: any) {
    if (fileInputEvent.target.files.length != 0) {
     this.securityService.uploadProfileImage(fileInputEvent.target.files[0]).subscribe(result => {
       console.log(result);
       AppComponent.profileInfo.photo = 'https://drive.google.com/uc?export=view&id=' + result.fileId;
     });
    }
  }
  locale() {
    return AppComponent.locale;
  }
}

export enum ProfileTabs {
  HOME,
  ANNOUNCEMENTS
}
