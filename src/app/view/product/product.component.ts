import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {ProductService} from "../../services/ProductService";
import {ProductOverviewItem} from "../../bo/product/ProductOverviewItem";
import {MatPaginator} from "@angular/material/paginator";
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {Product} from "../../bo/product/Product";
import {ProductCategory} from "../../bo/product/ProductCategory";
import {Attachment} from "../../bo/Attachment";
import {DomSanitizer} from "@angular/platform-browser";
import {AppComponent} from "../../app.component";
import Swal from "sweetalert2";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-main',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  products: ProductOverviewItem[] = [];
  selectedProducts: number[] = [];
  @ViewChild('paginator') paginator: MatPaginator;
  productsSearchForm: any = {
    start: 0,
    limit: 50,
    total: 100,
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
      this.products = result.result;
      for (let product of this.products) {
        if (this.selectedProducts.indexOf(product.productId) != -1) {
          product.checked = true;
        }
      }
      this.productsSearchForm.total = result.total;
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
          AppComponent.showLoadingMask = false;
          scope.searchProducts();
        }
      }
    });
  }
  locale() {
    return AppComponent.locale;
  }

  selectProduct(product: ProductOverviewItem, event) {
    if (!event.checked) {
      product.checked = false;
      const arr = [];
      for (let selectedProductId of this.selectedProducts) {
        if (selectedProductId != product.productId) {
          arr.push(selectedProductId);
        }
      }
      this.selectedProducts = arr;
    } else {
      product.checked = true;
      this.selectedProducts.push(product.productId);
    }
  }
  deleteSelectedProducts() {
    Swal.fire({
      icon: 'warning',
      text: this.locale().label.msgAreYouSureYouWantToDeleteSelectedProducts,
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        this.productService.deleteProducts(this.selectedProducts).subscribe(result => {
          this.selectedProducts = [];
          this.searchProducts();
        });
      }
    })
  }
}

@Component({
  selector: 'user-card-details',
  templateUrl: 'product.details.html',
})
export class ProductDetails implements OnInit{
  @ViewChild("productCloseButton", {read: ElementRef}) productCloseButton: ElementRef;
  product: Product = new Product();
  productCategories: ProductCategory[] = [];
  productAttachments: Attachment[] = [];
  productForm;

  ngOnInit(): void {
    this.productForm = new FormGroup({
      name: new FormControl(this.product.name, [Validators.required]),
      productCategoryId: new FormControl(this.product.productCategory.productCategoryId, [Validators.required])
    });
  }

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
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }
    if (this.productAttachments.length == 0) {
      Swal.fire({
        title: 'Attachments are missing',
        icon: 'warning',
        text: "Please upload at least one image"
      })
      return;
    }
    const scope = this;
    AppComponent.showLoadingMask = true;
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
          attachment.main = this.productAttachments.length == 0;
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
  locale() {
    return AppComponent.locale;
  }
}
