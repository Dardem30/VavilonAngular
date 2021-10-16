import {AfterViewInit, Component} from '@angular/core';
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
import {Product} from "../../../bo/product/Product";
import {MainComponent, MainTabs} from "../../main/main.component";
import {ContactDetails} from "../../contact/contact.component";
import {MatDialog} from "@angular/material/dialog";
import {ProductDetails} from "../../product/product.component";
import {DomSanitizer} from "@angular/platform-browser";
import {ModerationStatus} from "../../../bo/announcement/ModerationStatus";

declare const google: any;

@Component({
  selector: 'app-main',
  templateUrl: './announcementDetails.component.html',
  styleUrls: ['./announcementDetails.component.css']
})
export class AnnouncementDetailsComponent implements AfterViewInit {
  announcementId;
  map: any;
  drawingManager: any;
  contacts: Contact[] = [];
  announcementTypes: AnnouncementType[] = [];
  measures: Measure[] = [];
  announcement: Announcement = new Announcement();
  products: ProductOverviewItem[] = [];
  mainComponentInstance: MainComponent;
  productsSearchForm: any = {
    start: 0,
    limit: 50,
    total: 100,
    sort: {
      property: "productId",
      direction: "DESC"
    }
  };

  constructor(
    private contactService: ContactService,
    private announcementService: AnnouncementService,
    private productService: ProductService,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer
  ) {
    this.announcement.announcementType = new AnnouncementType();
    this.announcement.measure = new Measure();
    this.announcement.moderationStatus = new ModerationStatus();
  }

  ngAfterViewInit() {
    if (this.announcementId != null) {
      this.announcementService.read(this.announcementId).subscribe(result => {
        this.announcement = result;
        MapLoaderService.load().then(() => {
          this.drawPolygon();
        });
        this.contactService.getContacts().subscribe(result => {
          console.log(result);
          for (let contact of result) {
            for (let index = 0; index < this.announcement.contacts.length; index++) {
              if (this.announcement.contacts[index].contactId == contact.contactId) {
                this.announcement.contacts[index] = contact;
              }
            }
          }
          this.contacts = result
        });
        this.productService.search(this.productsSearchForm).subscribe(result => {
          this.products = result.result
          this.productsSearchForm.total = result.total;
          for (let product of this.products) {
            product.selectedForAnnouncement = this.announcement.product.productId == product.productId;
          }
        });
      })
    } else {
      MapLoaderService.load().then(() => {
        this.drawPolygon();
      });
      this.contactService.getContacts().subscribe(result => {
        this.contacts = result
      });
      this.productService.search(this.productsSearchForm).subscribe(result => {
        this.products = result.result
        this.productsSearchForm.total = result.total;
      });
    }
    this.announcementService.getAnnouncementTypes().subscribe(result => {
      this.announcementTypes = result
    })
    this.announcementService.getMeasures().subscribe(result => {
      this.measures = result
    });
  }

  drawPolygon() {

    this.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 61, lng: 74},
      zoom: 2
    });

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: google.maps.drawing.OverlayType.POLYGON,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: ['polygon']
      }
    });

    this.drawingManager.setMap(this.map);
    google.maps.event.addListener(this.drawingManager, 'overlaycomplete', (event) => {
      console.log(event);
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
      console.log(this.announcement.polygons)
    });

    if (this.announcementId != null) {
      for (let polygon of this.announcement.polygons) {
        const coordinates = [];
        for (let coordinate of polygon.coordinates) {
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
  }

  getCurrencySigns() {
    return AppComponent.currencySigns;
  }

  save() {
    this.announcement.announcementDate = new Date();
    this.announcementService.save(this.announcement).subscribe(result => {
      console.log(result);
      this.close();
    })
  }

  selectProduct(selectedProduct: ProductOverviewItem, event) {
    if (!event.checked) {
      return;
    }
    this.announcement.product = new Product();
    this.announcement.product.productId = selectedProduct.productId;
    for (let product of this.products) {
      if (product != selectedProduct) {
        product.selectedForAnnouncement = false;
      }
    }
  }

  close() {
    this.mainComponentInstance.switchTab(MainTabs.ANNOUNCEMENT, {
      isClose: false
    }, false);
  }

  openContactDetails() {
    const scope = this;
    this.dialog.open(ContactDetails, {
      data: {
        contact: null,
        contactService: this.contactService,
        onCloseHandler: function () {
          scope.contactService.getContacts().subscribe(result => {
            scope.contacts = result
          })
        }
      }
    });
  }

  openProductDetails(productId: any) {
    const scope = this;
    this.dialog.open(ProductDetails, {
      data: {
        productId: productId,
        sanitizer: this.sanitizer,
        productService: this.productService,
        onCloseHandler: function () {
          scope.productService.search(scope.productsSearchForm).subscribe(result => {
            scope.products = result.result
            scope.productsSearchForm.total = result.total;
            for (let product of scope.products) {
              product.selectedForAnnouncement = scope.announcement.product.productId == product.productId;
            }
          });
        }
      }
    });
  }

  getModerationTextAsHtml(moderationText) {
    console.log(moderationText.replace('\n', '<br>'));
    return 'Decline cause: ' + moderationText.replace(/\n/g, '<br>');
  }
}
