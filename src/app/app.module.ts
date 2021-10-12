import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MainComponent} from './view/main/main.component';
import {RouterModule, Routes} from "@angular/router";
import {MatCardModule} from "@angular/material/card";
import {MatSliderModule} from "@angular/material/slider";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatDatepickerModule} from "@angular/material/datepicker";
import {MatIconModule} from "@angular/material/icon";
import {MatAutocompleteModule} from "@angular/material/autocomplete";
import {MatOptionModule} from "@angular/material/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatInputModule} from "@angular/material/input";
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatGridListModule} from "@angular/material/grid-list";
import {MatSidenavModule} from "@angular/material/sidenav";
import {MatDividerModule} from "@angular/material/divider";
import {MatButtonModule} from "@angular/material/button";
import {AnnouncementService} from "./services/AnnouncementService";
import {HttpClientModule} from '@angular/common/http';
import {MatPaginatorModule} from "@angular/material/paginator";
import {SecurityService} from "./services/SecurityService";
import {HomeComponent} from "./view/home/home.component";
import {UserCardComponent, UserCardDetails} from "./view/userCard/userCard.component";
import {MatDialogModule} from "@angular/material/dialog";
import {MatRadioModule} from "@angular/material/radio";
import {UserCardService} from "./services/UserCardService";
import {ProductComponent, ProductDetails} from "./view/product/product.component";
import {ProductService} from "./services/ProductService";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {ContactComponent, ContactDetails} from "./view/contact/contact.component";
import {ContactService} from "./services/ContactService";
import {AnnouncementComponent} from "./view/announcement/announcement.component";
import {AnnouncementDetailsComponent} from "./view/announcement/announcementDetails/announcementDetails.component";
import {AnnouncementViewerComponent} from "./view/home/announcementViewer/announcementViewer.component";
import {MessageService} from "./services/MessageService";
import {MessagesComponent} from "./view/messages/messages.component";
import {ApproveAnnouncementOverviewComponent} from "./view/approveAnnouncementOverview/approveAnnouncementOverview.component";
import {NgxMaterialRatingModule} from "ngx-material-rating";
import {ProfileComponent} from "./view/profile/profile.component";
import {MatTooltipModule} from "@angular/material/tooltip";

const routes: Routes = [
  {path: '*', component: MainComponent},
  {path: '**', component: MainComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    MainComponent,
    HomeComponent,
    UserCardDetails,
    ProductDetails,
    ProductComponent,
    UserCardComponent,
    ContactComponent,
    ContactDetails,
    AnnouncementComponent,
    AnnouncementDetailsComponent,
    AnnouncementViewerComponent,
    MessagesComponent,
    ApproveAnnouncementOverviewComponent,
    ProfileComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(routes),
    MatCardModule,
    MatSliderModule,
    FormsModule,
    HttpClientModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatIconModule,
    MatAutocompleteModule,
    MatOptionModule,
    ReactiveFormsModule,
    MatInputModule,
    MatToolbarModule,
    MatGridListModule,
    MatDialogModule,
    MatSidenavModule,
    MatButtonModule,
    MatDividerModule,
    MatPaginatorModule,
    MatRadioModule,
    MatSelectModule,
    MatCheckboxModule,
    NgxMaterialRatingModule,
    MatTooltipModule
  ],
  providers: [AnnouncementService, SecurityService, UserCardService, ProductService, ContactService, MessageService],
  bootstrap: [AppComponent]
})
export class AppModule {
}
