import BaseView from "./BaseView.js";

class FacebookView extends BaseView {
  constructor() {
    super();
    this.userTag = "._7UhW9";
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  clickAddFriend(divEl) {
    divEl.click();
  }

  // Helper to find all "Add Friend" divs
  findAddFriendDivs() {
    const allDivs = document.getElementsByTagName("div");
    return [...allDivs].filter((div) => {
      return (
        div.getAttribute("aria-label") &&
        div.getAttribute("aria-label").includes("Add Friend")
      );
    });
  }

}


