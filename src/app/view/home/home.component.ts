import {Component, ViewChild} from '@angular/core';
import {AnnouncementService} from "../../services/AnnouncementService";
import {AnnouncementOverviewItem} from "../../bo/announcement/AnnouncementOverviewItem";
import {MatPaginator} from "@angular/material/paginator";
import {MainComponent, MainTabs, ModerationStatuses} from "../main/main.component";
import {AppComponent} from "../../app.component";

@Component({
  selector: 'app-main',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  showFiller = false;
  announcements: AnnouncementOverviewItem[] = [];
  mainComponentInstance: MainComponent;
  @ViewChild('paginator') paginator: MatPaginator;
  announcementSearchForm: any = {
    limit: 50,
    total: 100
  };
  isLoading:boolean = true;

  constructor(private announcementService: AnnouncementService) {
  }


  searchAnnouncement(announcementSearchForm: any) {
    announcementSearchForm.moderationStatusId = ModerationStatuses.APPROVED
    this.announcementSearchForm = announcementSearchForm;
    this.isLoading = true;
    this.announcementService.search(this.announcementSearchForm).subscribe(result => {
      this.announcements = result.result;
      this.announcementSearchForm.total = result.total;
      this.isLoading = false;
    });
  }

  pageChanged() {
    this.announcementSearchForm.start = this.announcementSearchForm.limit * this.paginator.pageIndex;
    this.searchAnnouncement(this.announcementSearchForm);
  }

  viewAnnouncement(announcement: AnnouncementOverviewItem) {
    this.mainComponentInstance.switchTab(MainTabs.ANNOUNCEMENT_VIEWER, {
      announcementId: announcement.announcementId,
      isClose: false,
      previousComponent: {
        component: MainTabs.HOME,
        params: null
      }
    }, false);
  }
  locale() {
    return AppComponent.locale;
  }
}
