export class CommentOverviewItem {
  commentId;
  announcementId;
  text;
  username;
  createTime;
  rate;
  childComments: CommentOverviewItem[] = [];
  showReplyDialog = false;
}
