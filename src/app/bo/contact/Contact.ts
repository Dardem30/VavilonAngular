import {ContactType} from "./ContactType";

export class Contact {
  contactId: any;
  name: any;
  value: any;
  contactType: ContactType = new ContactType();
  checked: boolean = false;
}
