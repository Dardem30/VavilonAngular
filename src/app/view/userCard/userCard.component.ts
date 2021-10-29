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

  ngOnInit(): void {
    this.userCardForm = new FormGroup({
      name: new FormControl(this.userCard.name, [Validators.required])
    });
    this.createBraintreeUI();
  }

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

  createBraintreeUI() {
    const button = document.querySelector('#submit-button');

    // console.log(braintree)
    // braintree.client.create({
    //   authorization: 'eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpGVXpJMU5pSXNJbXRwWkNJNklqSXdNVGd3TkRJMk1UWXRjMkZ1WkdKdmVDSXNJbWx6Y3lJNkltaDBkSEJ6T2k4dllYQnBMbk5oYm1SaWIzZ3VZbkpoYVc1MGNtVmxaMkYwWlhkaGVTNWpiMjBpZlEuZXlKbGVIQWlPakUyTXpRNU9EVTJPVE1zSW1wMGFTSTZJak01WVRrME9EaG1MV1V4Tm1RdE5ESTNNQzFoTnpBM0xXRmpaR0ZoTUdSall6VmlOeUlzSW5OMVlpSTZJbkZ1ZVRjMGJqSm9PVGh3Y25Sa2FuTWlMQ0pwYzNNaU9pSm9kSFJ3Y3pvdkwyRndhUzV6WVc1a1ltOTRMbUp5WVdsdWRISmxaV2RoZEdWM1lYa3VZMjl0SWl3aWJXVnlZMmhoYm5RaU9uc2ljSFZpYkdsalgybGtJam9pY1c1NU56UnVNbWc1T0hCeWRHUnFjeUlzSW5abGNtbG1lVjlqWVhKa1gySjVYMlJsWm1GMWJIUWlPbVpoYkhObGZTd2ljbWxuYUhSeklqcGJJbTFoYm1GblpWOTJZWFZzZENKZExDSnpZMjl3WlNJNld5SkNjbUZwYm5SeVpXVTZWbUYxYkhRaVhTd2liM0IwYVc5dWN5STZleUpqZFhOMGIyMWxjbDlwWkNJNklqZ3dPVFl6TXpNNE55SjlmUS5iQ3J2bTFMTHlDRWdKaTNYbWc2YzFMVDFOYkI0VXVqcmkwTG15elBONmhxQ2xiQlI3RWZEVGVGV0kzZnZxd0ZlTi1ZN0o1NTY3bG1OVXNIdUZGNjJoQT9jdXN0b21lcl9pZD0iLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvcW55NzRuMmg5OHBydGRqcy9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJncmFwaFFMIjp7InVybCI6Imh0dHBzOi8vcGF5bWVudHMuc2FuZGJveC5icmFpbnRyZWUtYXBpLmNvbS9ncmFwaHFsIiwiZGF0ZSI6IjIwMTgtMDUtMDgiLCJmZWF0dXJlcyI6WyJ0b2tlbml6ZV9jcmVkaXRfY2FyZHMiXX0sImhhc0N1c3RvbWVyIjp0cnVlLCJjbGllbnRBcGlVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvcW55NzRuMmg5OHBydGRqcy9jbGllbnRfYXBpIiwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwibWVyY2hhbnRJZCI6InFueTc0bjJoOThwcnRkanMiLCJhc3NldHNVcmwiOiJodHRwczovL2Fzc2V0cy5icmFpbnRyZWVnYXRld2F5LmNvbSIsImF1dGhVcmwiOiJodHRwczovL2F1dGgudmVubW8uc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbSIsInZlbm1vIjoib2ZmIiwiY2hhbGxlbmdlcyI6W10sInRocmVlRFNlY3VyZUVuYWJsZWQiOnRydWUsImFuYWx5dGljcyI6eyJ1cmwiOiJodHRwczovL29yaWdpbi1hbmFseXRpY3Mtc2FuZC5zYW5kYm94LmJyYWludHJlZS1hcGkuY29tL3FueTc0bjJoOThwcnRkanMifSwicGF5cGFsRW5hYmxlZCI6dHJ1ZSwicGF5cGFsIjp7ImJpbGxpbmdBZ3JlZW1lbnRzRW5hYmxlZCI6dHJ1ZSwiZW52aXJvbm1lbnROb05ldHdvcmsiOnRydWUsInVudmV0dGVkTWVyY2hhbnQiOmZhbHNlLCJhbGxvd0h0dHAiOnRydWUsImRpc3BsYXlOYW1lIjoiTm9uZSIsImNsaWVudElkIjpudWxsLCJwcml2YWN5VXJsIjoiaHR0cDovL2V4YW1wbGUuY29tL3BwIiwidXNlckFncmVlbWVudFVybCI6Imh0dHA6Ly9leGFtcGxlLmNvbS90b3MiLCJiYXNlVXJsIjoiaHR0cHM6Ly9hc3NldHMuYnJhaW50cmVlZ2F0ZXdheS5jb20iLCJhc3NldHNVcmwiOiJodHRwczovL2NoZWNrb3V0LnBheXBhbC5jb20iLCJkaXJlY3RCYXNlVXJsIjpudWxsLCJlbnZpcm9ubWVudCI6Im9mZmxpbmUiLCJicmFpbnRyZWVDbGllbnRJZCI6Im1hc3RlcmNsaWVudDMiLCJtZXJjaGFudEFjY291bnRJZCI6Im5vbmUiLCJjdXJyZW5jeUlzb0NvZGUiOiJVU0QifX0',
    //   container: '#dropin-container'
    // }, function (createErr, instance) {
    //   console.log(createErr)
    //   console.log(instance)
    //   button.addEventListener('click', function () {
    //     instance.requestPaymentMethod(function (requestPaymentMethodErr, payload) {
    //       console.log(payload)
    //       // Submit payload.nonce to your server
    //     });
    //   });
    // });
  }
}
