import {Component, ViewChild} from '@angular/core';
import {AnnouncementService} from "../../services/AnnouncementService";
import {AnnouncementOverviewItem} from "../../bo/announcement/AnnouncementOverviewItem";
import {MatPaginator} from "@angular/material/paginator";
import {MainComponent, MainTabs, ModerationStatuses} from "../main/main.component";

@Component({
  selector: 'app-main',
  templateUrl: './approveAnnouncementOverview.component.html',
  styleUrls: ['./approveAnnouncementOverview.component.css']
})
export class ApproveAnnouncementOverviewComponent {
  showFiller = false;
  announcements: AnnouncementOverviewItem[] = [];
  mainComponentInstance: MainComponent;
  @ViewChild('paginator') paginator: MatPaginator;
  announcementSearchForm: any;
  isLoading:boolean = true;

  constructor(private announcementService: AnnouncementService) {
  }


  searchAnnouncement(announcementSearchForm: any) {
    announcementSearchForm.moderationStatusId = ModerationStatuses.TO_BE_REVIEWED
    this.announcementSearchForm = announcementSearchForm;
    this.isLoading = true;
    this.announcementService.search(this.announcementSearchForm).subscribe(result => {
      this.announcements = result.result
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
      previousComponent: MainTabs.APPROVE_ANNOUNCEMENT_OVERVIEW
    }, false);
  }
}
