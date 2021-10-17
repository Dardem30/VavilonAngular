import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {Contact} from "../../bo/contact/Contact";
import {ContactService} from "../../services/ContactService";
import {ContactType} from "../../bo/contact/ContactType";
import {AppComponent} from "../../app.component";

@Component({
  selector: 'app-main',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contacts: Contact[] = [];

  constructor(private contactService: ContactService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.contactService.getContacts().subscribe(result => {
      console.log(result);
      this.contacts = result
    })
  }

  openContactDetails(contact: any) {
    const scope = this;
    this.dialog.open(ContactDetails, {
      data: {
        contact: contact,
        contactService: this.contactService,
        onCloseHandler: function () {
          scope.contactService.getContacts().subscribe(result => {
            console.log(result)
            scope.contacts = result
          })
        }
      }
    });
  }

  locale() {
    return AppComponent.locale;
  }
}

@Component({
  selector: 'contact-details',
  templateUrl: 'contact.details.html',
})
export class ContactDetails {
  @ViewChild("contactCloseButton", {read: ElementRef}) contactCloseButton: ElementRef;
  contactTypes: ContactType[] = [];
  contact: Contact = new Contact();

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.contact != null) {
      this.contact = data.contact;
    }
    data.contactService.getContactTypes().subscribe(result => this.contactTypes = result);
  }

  saveContact() {
    console.log(this.contact);
    this.data.contactService.save(this.contact).subscribe((result: any) => {
      console.log(result);
      this.data.onCloseHandler();
    });
    this.contactCloseButton.nativeElement.click();
  }

  locale() {
    return AppComponent.locale;
  }
}
