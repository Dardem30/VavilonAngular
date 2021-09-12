import {AnnouncementType} from "./AnnouncementType";
import {Product} from "../product/Product";
import {Measure} from "./Measure";
import {Contact} from "../contact/Contact";
import {Polygon} from "./Polygon";

export class Announcement {
  announcementId;
  userId;
  contacts: Contact[];
  announcementType: AnnouncementType;
  product: Product;
  measure: Measure;
  price;
  currencySign;
  text;
  announcementDate;
  polygons: Polygon[];
}
