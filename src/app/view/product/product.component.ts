import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {ProductService} from "../../services/ProductService";
import {ProductOverviewItem} from "../../bo/product/ProductOverviewItem";
import {MatPaginator} from "@angular/material/paginator";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {Product} from "../../bo/product/Product";
import {ProductCategory} from "../../bo/product/ProductCategory";
import {Attachment} from "../../bo/Attachment";
import {DomSanitizer} from "@angular/platform-browser";

@Component({
  selector: 'app-main',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  products: ProductOverviewItem[] = [];
  @ViewChild('paginator') paginator: MatPaginator;
  productsSearchForm: any = {
    start: 0,
    limit: 50,
    sort: {
      property: "productId",
      direction: "DESC"
    }
  };

  constructor(private productService: ProductService,
              private dialog: MatDialog,
              private sanitizer: DomSanitizer) {
  }


  searchProducts() {
    this.productService.search(this.productsSearchForm).subscribe(result => {
      this.products = result.result
    });
  }

  pageChanged() {
    this.productsSearchForm.start = this.productsSearchForm.limit * this.paginator.pageIndex;
    this.searchProducts();
  }

  ngOnInit(): void {
    this.searchProducts();
  }

  openProductDetails(productId: any) {
    const scope = this;
    this.dialog.open(ProductDetails, {
      data: {
        productId: productId,
        sanitizer: this.sanitizer,
        productService: this.productService,
        onCloseHandler: function () {
          scope.searchProducts();
        }
      }
    });
  }
}

@Component({
  selector: 'user-card-details',
  templateUrl: 'product.details.html',
})
export class ProductDetails {
  @ViewChild("productCloseButton", {read: ElementRef}) productCloseButton: ElementRef;
  product: Product = new Product();
  productCategories: ProductCategory[] = [];
  productAttachments: Attachment[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    data.productService.readProductCategories().subscribe((result: ProductCategory[]) => {
      this.productCategories = result
    });
    if (data.productId != null) {
      data.productService.readProduct(data.productId).subscribe((result: Product) => {
        result.productCategory = this.productCategories[0];
        this.product = result
      });
      data.productService.readAttachments(data.productId).subscribe((result: Attachment[]) => {
        console.log(result);
        this.productAttachments = result
      });
    }
  }

  saveProduct() {
    const scope = this;
    this.data.productService.save(this.product).subscribe((result: any) => {
      const productId = result.productId;
      const filesForDeleting: Attachment[] = [];
      let index = 0;
      let indexOfMainPhoto;
      const formDataForUploadingFiles = new FormData();
      formDataForUploadingFiles.append('productId', productId);
      for (let attachment of this.productAttachments) {
        if (attachment.fileItem != null) {
          if (!attachment.delete) {
            formDataForUploadingFiles.append('inputFiles', attachment.fileItem, index + '_' + attachment.fileItem.name);
            if (attachment.main) {
              indexOfMainPhoto = index;
            }
            index++;
          }
        } else if (attachment.delete) {
          filesForDeleting.push(attachment);
        }
      }
      if (indexOfMainPhoto != null) {
        formDataForUploadingFiles.append('indexOfMainPhoto', indexOfMainPhoto);
      }
      scope.data.productService.uploadAttachments(formDataForUploadingFiles).subscribe((result: any) => {
        scope.data.productService.deleteAttachments(filesForDeleting.map(record => record.attachmentId)).subscribe((result: any) => {
          if (indexOfMainPhoto == null) {
            let mainImageId;
            for (let attachment of this.productAttachments) {
              if (attachment.main) {
                mainImageId = attachment.attachmentId;
                break;
              }
            }
            if (mainImageId != null) {
              scope.data.productService.updateMainPhoto(productId, mainImageId).subscribe((result: any) => {
                scope.data.onCloseHandler();
                scope.productCloseButton.nativeElement.click();
              })
            } else {
              scope.data.onCloseHandler();
              scope.productCloseButton.nativeElement.click();
            }
          } else {
            scope.data.onCloseHandler();
            scope.productCloseButton.nativeElement.click();
          }
        })
      })
    });
  }

  filesUploaded(fileInputEvent: any) {
    if (fileInputEvent.target.files.length != 0) {
      for (let file of fileInputEvent.target.files) {
        const reader = new FileReader();
        reader.onload = () => {
          const attachment = new Attachment();
          attachment.main = false;
          attachment.delete = false;
          attachment.fileItem = file;
          attachment.fileSrc = reader.result as string;
          this.productAttachments.push(attachment)
        }
        reader.readAsDataURL(file);
      }
    }
  }

  mainImageChanged(index: number) {
    for (let attIndex = 0; attIndex < this.productAttachments.length; attIndex++) {
      if (attIndex != index) {
        this.productAttachments[attIndex].main = false;
      }
    }
  }
}
