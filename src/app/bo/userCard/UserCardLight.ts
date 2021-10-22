import {ActionType} from "../enums/ActionType";
import {UserType} from "../enums/UserType";

export class UserCardLight {
  userCardId: number;
  name: string;
  description: string;
  actionType: ActionType;
  userType: UserType;
  checked: boolean = false;
}
