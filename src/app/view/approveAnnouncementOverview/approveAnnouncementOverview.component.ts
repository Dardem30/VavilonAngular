import {Component, OnInit, ViewChild} from '@angular/core';
import {AnnouncementService} from "../../services/AnnouncementService";
import {AnnouncementOverviewItem} from "../../bo/announcement/AnnouncementOverviewItem";
import {MatPaginator} from "@angular/material/paginator";
import {MainComponent, MainTabs, ModerationStatuses} from "../main/main.component";
import {AppComponent} from "../../app.component";

@Component({
  selector: 'app-main',
  templateUrl: './approveAnnouncementOverview.component.html',
  styleUrls: ['./approveAnnouncementOverview.component.css']
})
export class ApproveAnnouncementOverviewComponent implements OnInit {
  showFiller = false;
  announcements: AnnouncementOverviewItem[] = [];
  mainComponentInstance: MainComponent;
  cols = 3;
  @ViewChild('paginator') paginator: MatPaginator;
  announcementSearchForm: any = {
    limit: 50,
    total: 100
  };
  isLoading:boolean = true;

  constructor(private announcementService: AnnouncementService) {
  }
  ngOnInit(): void {
    this.cols = Math.round(window.innerWidth / 750);
  }
  onResize(event: any) {
    this.cols = Math.round(event.target.innerWidth / 750);
  }

  searchAnnouncement(announcementSearchForm: any) {
    announcementSearchForm.moderationStatusIds = [ModerationStatuses.TO_BE_REVIEWED, ModerationStatuses.DECLINED]
    announcementSearchForm.readyForReview = true;
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
      previousComponent: {
        component: MainTabs.APPROVE_ANNOUNCEMENT_OVERVIEW,
        params: null
      }
    }, false);
  }

  locale() {
    return AppComponent.locale;
  }
}
