import {Injectable} from "@angular/core";
import {SearchResult} from "../bo/SearchResult";
import {AppComponent} from "../app.component";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {ProductOverviewItem} from "../bo/product/ProductOverviewItem";
import {Product} from "../bo/product/Product";
import {ProductCategory} from "../bo/product/ProductCategory";
import {Attachment} from "../bo/Attachment";

@Injectable()
export class ProductService {

  constructor(private http: HttpClient) {

  }

  search(listFilter: any): Observable<SearchResult<ProductOverviewItem>> {
    return this.http.post<SearchResult<ProductOverviewItem>>(AppComponent.apiEndpoint + 'product/listProducts', listFilter, {
      withCredentials: true
    });
  }

  readProduct(productId: number) {
    return this.http.get<Product>(AppComponent.apiEndpoint + 'product/read?productId=' + productId, {
      withCredentials: true
    });
  }

  save(product: Product): Observable<any> {
    return this.http.post<any>(AppComponent.apiEndpoint + 'product/saveProduct', product, {
      withCredentials: true
    });
  }

  readProductCategories() {
    return this.http.get<ProductCategory[]>(AppComponent.apiEndpoint + 'product/productCategories', {
      withCredentials: true
    });
  }

  readAttachments(productId: any) {
    return this.http.get<Attachment[]>(AppComponent.apiEndpoint + 'product/readProductAttachments?productId=' + productId, {
      withCredentials: true
    });
  }

  uploadAttachments(formDataForUploadingFiles: FormData) {
    console.log(formDataForUploadingFiles);
    return this.http.post<any>(AppComponent.apiEndpoint + 'product/uploadProductAttachment', formDataForUploadingFiles, {
      withCredentials: true
    });
  }

  deleteAttachments(ids: any[]) {
    return this.http.post<any>(AppComponent.apiEndpoint + 'product/deleteProductAttachments', {ids: ids}, {
      withCredentials: true
    });
  }

  updateMainPhoto(productId: any, mainImageId: any) {
    return this.http.get<ProductCategory[]>(AppComponent.apiEndpoint + 'product/updateMainPhotoForProduct?productId=' + productId + '&attachmentId=' + mainImageId, {
      withCredentials: true
    });

  }
}
