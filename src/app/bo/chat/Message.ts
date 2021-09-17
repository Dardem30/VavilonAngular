import {UserLight} from "../user/UserLight";
import {Conversation} from "./Conversation";

export class Message {
  messageId;
  text;
  user: UserLight;
  createTime;
  conversation: Conversation;
}
