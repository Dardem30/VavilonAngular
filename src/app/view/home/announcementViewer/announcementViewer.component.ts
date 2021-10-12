import {AfterViewInit, Component, ViewChild} from '@angular/core';
import {MapLoaderService} from "../../../services/MapLoaderService";
import {ContactService} from "../../../services/ContactService";
import {Contact} from "../../../bo/contact/Contact";
import {Announcement} from "../../../bo/announcement/Announcement";
import {AnnouncementType} from "../../../bo/announcement/AnnouncementType";
import {Measure} from "../../../bo/announcement/Measure";
import {AnnouncementService} from "../../../services/AnnouncementService";
import {ProductOverviewItem} from "../../../bo/product/ProductOverviewItem";
import {ProductService} from "../../../services/ProductService";
import {AppComponent} from "../../../app.component";
import {Polygon} from "../../../bo/announcement/Polygon";
import {Coordinate} from "../../../bo/announcement/Coordinate";
import {MainComponent, MainTabs} from "../../main/main.component";
import {ModerationStatus} from "../../../bo/announcement/ModerationStatus";
import {Comment} from "../../../bo/announcement/Comment";
import {CommentOverviewItem} from "../../../bo/announcement/CommentOverviewItem";
import {MatPaginator} from "@angular/material/paginator";

declare const google: any;

@Component({
  selector: 'app-main',
  templateUrl: './announcementViewer.component.html',
  styleUrls: ['./announcementViewer.component.css']
})
export class AnnouncementViewerComponent implements AfterViewInit {
  map: any;
  drawingManager: any;
  contacts: Contact[] = [];
  announcementTypes: AnnouncementType[] = [];
  measures: Measure[] = [];
  announcement: Announcement = new Announcement();
  products: ProductOverviewItem[] = [];
  announcementId;
  images: string[] = [];
  mainComponentInstance: MainComponent;
  previousComponent = null;
  commentText: string = '';
  commentsListFilter = {
    start: 0,
    limit: 50,
    total: 100,
    announcementId: null,
    sort: {
      property: "createTime",
      direction: "DESC"
    }
  };
  comments: CommentOverviewItem[] = [];
  @ViewChild('paginator') paginator: MatPaginator;

  constructor(
    private contactService: ContactService,
    private announcementService: AnnouncementService,
    private productService: ProductService
  ) {
    this.announcement.announcementType = new AnnouncementType();
    this.announcement.measure = new Measure();
    this.announcement.moderationStatus = new ModerationStatus();
  }

  ngAfterViewInit() {
    this.announcementService.read(this.announcementId).subscribe(result => {
      this.announcement = result;
      this.commentsListFilter.announcementId = this.announcement.announcementId;
      this.readComments();
      MapLoaderService.load().then(() => {
        this.drawPolygon();
      })
    })
    this.announcementService.getAnnouncementTypes().subscribe(result => {
      this.announcementTypes = result
    })
    this.announcementService.getMeasures().subscribe(result => {
      this.measures = result
    });
    this.announcementService.gallery(this.announcementId).subscribe(result => {
      this.images = result
    });
  }

  drawPolygon() {
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 61, lng:  74},
      zoom: 2
    });

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: []
      }
    });

    this.drawingManager.setMap(this.map);
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      // Polygon drawn
      if (event.type === google.maps.drawing.OverlayType.POLYGON) {
        //this is the coordinate, you can assign it to a variable or pass into another function.
        const polygon = new Polygon();
        const coordinates = [];
        for (let point of event.overlay.getPath().getArray()) {
          const coordinate = new Coordinate();
          coordinate.lng = point.lng();
          coordinate.lat = point.lat();
          coordinates.push(coordinate);
        }
        polygon.coordinates = coordinates;
        if (this.announcement.polygons == null) {
          this.announcement.polygons = [];
        }
        this.announcement.polygons.push(polygon);
      }
    });
    for (let polygon of this.announcement.polygons) {
      const coordinates = [];
      for (let coordinate of polygon  .coordinates) {
        coordinates.push({lat: coordinate.lat, lng: coordinate.lng})
      }
      new google.maps.Polygon({
        paths: coordinates,
        strokeColor: "#FF0000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#FF0000",
        fillOpacity: 0.35,
      }).setMap(this.map);
    }
  }

  getCurrencySigns() {
    return AppComponent.currencySigns;
  }

  expandImage(event) {
    const expandImg: any = document.getElementById("expandedImg");
    const imgText = document.getElementById("imgtext");
    expandImg.src = event.target.src;
    imgText.innerHTML = event.target.alt;
    expandImg.parentElement.style.display = "block";
  }

  close() {
    this.mainComponentInstance.switchTab(this.previousComponent.component, this.previousComponent.params, false);
  }

  chat() {
    this.mainComponentInstance.startChat(this.announcement.user);
  }

  getProfileInfo() {
    return AppComponent.profileInfo;
  }

  updateModerationStatus() {
    this.announcementService.updateModerationStatus(this.announcement.announcementId, this.announcement.moderationStatus.moderationStatusId).subscribe(result => {
      this.close();
    });
  }

  rate() {
    this.announcementService.rate(this.announcement.announcementId, this.announcement.rating).subscribe(result => {
      this.announcement.rating = result;
    })
  }

  submitComment(rootComment) {
    const comment = new Comment();
    comment.createTime = new Date();
    comment.announcementId = this.announcement.announcementId;
    comment.text = this.commentText;
    comment.userId = AppComponent.profileInfo.userId;
    if (rootComment != null) {
      comment.rootCommentId = rootComment.commentId;
      rootComment.showReplyDialog = false;
    }
    this.announcementService.createComment(comment).subscribe(() => {
      this.readComments();
    });
  }
  readComments() {
    this.announcementService.readComments(this.commentsListFilter).subscribe(result => {
      this.comments = result.result;
      this.commentsListFilter.total = result.total;
    })
  }

  pageChanged() {
    this.commentsListFilter.start = this.commentsListFilter.limit * this.paginator.pageIndex;
    this.readComments();
  }

  sellerProfile() {
    this.mainComponentInstance.switchTab(MainTabs.PROFILE, {
      userId: this.announcement.user.userId,
      previousComponent: {
        component: MainTabs.ANNOUNCEMENT_VIEWER,
        params: {
          previousComponent: this.previousComponent,
          announcementId: this.announcementId
        }
      }
    }, false);
  }
}
