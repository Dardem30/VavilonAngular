import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {SearchResult} from "../bo/SearchResult";
import {AppComponent} from "../app.component";
import {AnnouncementOverviewItem} from "../bo/announcement/AnnouncementOverviewItem";
import {HttpClient} from "@angular/common/http";
import {AnnouncementType} from "../bo/announcement/AnnouncementType";
import {Measure} from "../bo/announcement/Measure";
import {Announcement} from "../bo/announcement/Announcement";
import {ModerationStatus} from "../bo/announcement/ModerationStatus";

@Injectable()
export class AnnouncementService {

  constructor(private http: HttpClient) {

  }
  search(listFilter: any): Observable<SearchResult<AnnouncementOverviewItem>> {
    return this.http.post<SearchResult<AnnouncementOverviewItem>>(AppComponent.apiEndpoint + 'announcement/listAnnouncements', listFilter, {
      withCredentials: true
    });
  }
  searchForUser(listFilter: any): Observable<SearchResult<AnnouncementOverviewItem>> {
    return this.http.post<SearchResult<AnnouncementOverviewItem>>(AppComponent.apiEndpoint + 'announcement/listAnnouncementsForUser', listFilter, {
      withCredentials: true
    });
  }
  getAnnouncementTypes(): Observable<AnnouncementType[]> {
    return this.http.get<AnnouncementType[]>(AppComponent.apiEndpoint + 'announcement/getAnnouncementTypes', {
      withCredentials: true
    });
  }
  getMeasures(): Observable<Measure[]> {
    return this.http.get<Measure[]>(AppComponent.apiEndpoint + 'announcement/getMeasures', {
      withCredentials: true
    });
  }
  getModerationStatuses(): Observable<ModerationStatus[]> {
    return this.http.get<ModerationStatus[]>(AppComponent.apiEndpoint + 'announcement/getModerationStatuses', {
      withCredentials: true
    });
  }
  save(announcement: Announcement): Observable<any> {
    return this.http.post(AppComponent.apiEndpoint + 'announcement/save', announcement, {
      withCredentials: true
    });
  }
  read(announcementId: number) {
    return this.http.get<Announcement>(AppComponent.apiEndpoint + 'announcement/read?announcementId=' + announcementId);
  }
  gallery(announcementId: number) {
    return this.http.get<string[]>(AppComponent.apiEndpoint + 'announcement/gallery?announcementId=' + announcementId);
  }

  updateModerationStatus(announcementId, moderationStatusId) {
    return this.http.post(AppComponent.apiEndpoint + 'announcement/updateModerationStatus', {
      announcementId: announcementId,
      moderationStatusId: moderationStatusId
    }, {
      withCredentials: true
    });
  }
}
