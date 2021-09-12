import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {UserType} from "../../bo/enums/UserType";
import {ActionType} from "../../bo/enums/ActionType";
import {UserCard} from "../../bo/userCard/UserCard";
import {UserCardService} from "../../services/UserCardService";
import {UserCardLight} from "../../bo/userCard/UserCardLight";

@Component({
  selector: 'app-main',
  templateUrl: './userCard.component.html',
  styleUrls: ['./userCard.component.css']
})
export class UserCardComponent implements OnInit {
  userCards: UserCardLight[] = [];

  constructor(private userCardService: UserCardService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.userCardService.getUserCards().subscribe(result => this.userCards = result)
  }

  openUserCardDetails(userCardId: any) {
    const scope = this;
    this.dialog.open(UserCardDetails, {
      data: {
        userCardId: userCardId,
        userCardService: this.userCardService,
        onCloseHandler: function () {
          scope.userCardService.getUserCards().subscribe(result => {
            console.log(result)
            scope.userCards = result
          })
        }
      }
    });
  }
}

@Component({
  selector: 'user-card-details',
  templateUrl: 'userCard.details.html',
})
export class UserCardDetails {
  @ViewChild("userCardCloseButton", { read: ElementRef }) userCardCloseButton: ElementRef;
  userTypes = UserType;
  actionTypes = ActionType;
  userCard: UserCard = {
    userCardId: null,
    description: null,
    inn: null,
    name: null,
    actionType: ActionType.BUYER,
    userType: UserType.INDIVIDUAL
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    console.log(data.userCardId)
    if (data.userCardId != null) {
      data.userCardService.readUserCard(data.userCardId).subscribe((result: UserCard) => {
        this.userCard = result
      });
    }
  }

  saveCard() {
    console.log(this.userCard);
    this.data.userCardService.save(this.userCard).subscribe((result: any) => {
      console.log(result);
      this.data.onCloseHandler();
    });
    this.userCardCloseButton.nativeElement.click();
  }
}
