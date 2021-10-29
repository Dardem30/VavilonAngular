import {Component, OnInit, ViewChild} from '@angular/core';
import {AnnouncementOverviewItem} from "../../bo/announcement/AnnouncementOverviewItem";
import {AnnouncementService} from "../../services/AnnouncementService";
import {AppComponent} from "../../app.component";
import {MatPaginator} from "@angular/material/paginator";
import {MainComponent, MainTabs} from "../main/main.component";
import Swal from "sweetalert2";

@Component({
  selector: 'app-main',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.css']
})
export class AnnouncementComponent implements OnInit {
  announcements: AnnouncementOverviewItem[] = [];
  @ViewChild('paginator') paginator: MatPaginator;
  mainComponentInstance: MainComponent;
  selectedAnnouncements: number[] = [];
  cols = 3;
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
    this.cols = Math.round(window.innerWidth / 750);
    this.searchAnnouncements();
  }
  onResize(event: any) {
    this.cols = Math.round(event.target.innerWidth / 750);
  }

  searchAnnouncements() {
    this.announcementService.searchForUser(this.announcementSearchForm).subscribe(result => {
      this.announcements = result.result;
      for (let announcement of this.announcements) {
        if (this.selectedAnnouncements.indexOf(announcement.announcementId) != -1) {
          announcement.checked = true;
        }
      }
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
  locale() {
    return AppComponent.locale;
  }

  selectAnnouncement(announcement: AnnouncementOverviewItem, event) {
    if (!event.checked) {
      announcement.checked = false;
      const arr = [];
      for (let selectedAnnouncementId of this.selectedAnnouncements) {
        if (selectedAnnouncementId != announcement.announcementId) {
          arr.push(selectedAnnouncementId);
        }
      }
      this.selectedAnnouncements = arr;
    } else {
      announcement.checked = true;
      this.selectedAnnouncements.push(announcement.announcementId);
    }
  }
  deleteSelectedAnnouncements() {
    Swal.fire({
      icon: 'warning',
      text: this.locale().label.msgAreYouSureYouWantToDeleteSelectedAnnouncements,
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        this.announcementService.deleteAnnouncements(this.selectedAnnouncements).subscribe(result => {
          this.selectedAnnouncements = [];
          this.searchAnnouncements();
        });
      }
    })
  }
}
