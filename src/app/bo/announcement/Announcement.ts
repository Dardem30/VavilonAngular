import {AnnouncementType} from "./AnnouncementType";
import {Product} from "../product/Product";
import {Measure} from "./Measure";
import {Contact} from "../contact/Contact";
import {Polygon} from "./Polygon";
import {UserLight} from "../user/UserLight";
import {ModerationStatus} from "./ModerationStatus";

export class Announcement {
  announcementId;
  user: UserLight;
  contacts: Contact[];
  announcementType: AnnouncementType;
  product: Product;
  measure: Measure;
  price;
  currencySign;
  text;
  announcementDate;
  polygons: Polygon[];
  moderationStatus: ModerationStatus;
}
