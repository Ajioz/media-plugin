import BaseView from "./BaseView.js";

class TikTokView extends BaseView {
  constructor() {
    super();
    // Use the same userTag as Facebook (adjust if you have a TikTok-specific selector)
    this.userTag = "._7UhW9";
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  // Instead of "clickAddFriend", we use "clickLike" for TikTok
  clickLike(divEl) {
    divEl.click();
  }

  // Helper to find all "Like" divs on the page, analogous to Facebook's findAddFriendDivs
  findLikeDivs() {
    const allDivs = document.getElementsByTagName("div");
    return [...allDivs].filter((div) => {
      return (
        div.getAttribute("aria-label") &&
        div.getAttribute("aria-label").includes("Like")
      );
    });
  }
}

export default TikTokView;
