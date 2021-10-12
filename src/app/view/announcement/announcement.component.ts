import {Component, OnInit, ViewChild} from '@angular/core';
import {AnnouncementOverviewItem} from "../../bo/announcement/AnnouncementOverviewItem";
import {AnnouncementService} from "../../services/AnnouncementService";
import {AppComponent} from "../../app.component";
import {MatPaginator} from "@angular/material/paginator";
import {MainComponent, MainTabs} from "../main/main.component";

@Component({
  selector: 'app-main',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {
  announcements: AnnouncementOverviewItem[] = [];
  @ViewChild('paginator') paginator: MatPaginator;
  mainComponentInstance: MainComponent;
  announcementSearchForm: any = {
    userId: AppComponent.profileInfo.userId,
    start: 0,
    limit: 50,
    total: 100,
    sort: {
      property: "announcementId",
      direction: "DESC"
    }
  };

  constructor(private announcementService: AnnouncementService) {
  }

  ngOnInit(): void {
    this.searchAnnouncements();
  }

  searchAnnouncements() {
    this.announcementService.searchForUser(this.announcementSearchForm).subscribe(result => {
      this.announcements = result.result
      this.announcementSearchForm.total = result.total;
    });
  }

  pageChanged() {
    this.announcementSearchForm.start = this.announcementSearchForm.limit * this.paginator.pageIndex;
    this.searchAnnouncements();
  }

  openAnnouncementDetails(announcementId: any) {
    this.mainComponentInstance.switchTab(MainTabs.ANNOUNCEMENT_DETAILS, {
      announcementId: announcementId
    }, false);
  }
}
