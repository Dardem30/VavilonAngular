import {Component, ElementRef, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog} from "@angular/material/dialog";
import {UserType} from "../../bo/enums/UserType";
import {ActionType} from "../../bo/enums/ActionType";
import {UserCard} from "../../bo/userCard/UserCard";
import {UserCardService} from "../../services/UserCardService";
import {UserCardLight} from "../../bo/userCard/UserCardLight";
import {AppComponent} from "../../app.component";
import Swal from "sweetalert2";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-main',
  templateUrl: './userCard.component.html',
  styleUrls: ['./userCard.component.css']
})
export class UserCardComponent implements OnInit {
  userCards: UserCardLight[] = [];
  selectedCards: number[] = [];

  constructor(private userCardService: UserCardService,
              private dialog: MatDialog) {
  }

  ngOnInit(): void {
    this.userCardService.getUserCards().subscribe(result => this.userCards = result);
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

  locale() {
    return AppComponent.locale;
  }

  selectCard(userCard: UserCardLight, event) {
    if (!event.checked) {
      userCard.checked = false;
      const arr = [];
      for (let selectedCard of this.selectedCards) {
        if (selectedCard != userCard.userCardId) {
          arr.push(selectedCard);
        }
      }
      this.selectedCards = arr;
    } else {
      userCard.checked = true;
      this.selectedCards.push(userCard.userCardId);
    }
  }

  deleteSelectedCards() {
    Swal.fire({
      icon: 'warning',
      text: this.locale().label.msgAreYouSureYouWantToDeleteSelectedCards,
      showCancelButton: true,
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.isConfirmed) {
        this.userCardService.deleteCards(this.selectedCards).subscribe(result => {
          this.selectedCards = [];
          this.userCardService.getUserCards().subscribe(result => this.userCards = result)
        });
      }
    })
  }
}

@Component({
  selector: 'user-card-details',
  templateUrl: 'userCard.details.html',
})
export class UserCardDetails implements OnInit {
  @ViewChild("userCardCloseButton", {read: ElementRef}) userCardCloseButton: ElementRef;
  userTypes = UserType;
  actionTypes = ActionType;
  userCardForm;
  userCard: UserCard = {
    userCardId: null,
    description: null,
    inn: null,
    name: null,
    actionType: ActionType.BUYER,
    userType: UserType.INDIVIDUAL
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    if (data.userCardId != null) {
      data.userCardService.readUserCard(data.userCardId).subscribe((result: UserCard) => {
        this.userCard = result
      });
    }
  }

  saveCard() {
    if (!this.userCardForm.invalid) {
      this.data.userCardService.save(this.userCard).subscribe((result: any) => {
        console.log(result);
        this.data.onCloseHandler();
      });
      this.userCardCloseButton.nativeElement.click();
    }
  }

  locale() {
    return AppComponent.locale;
  }

  ngOnInit(): void {
    this.userCardForm = new FormGroup({
      name: new FormControl(this.userCard.name, [Validators.required])
    });
  }
}
