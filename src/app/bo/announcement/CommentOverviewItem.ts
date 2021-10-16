export class CommentOverviewItem {
  commentId;
  announcementId;
  text;
  username;
  createTime;
  rate;
  userId;
  childComments: CommentOverviewItem[] = [];
  showReplyDialog = false;
}
