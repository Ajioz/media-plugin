import BaseView from "./BaseView.js";

class TwitterView extends BaseView {
  constructor() {
    super();
    // Set a selector (this is analogous to Facebook's "._7UhW9")
    // Adjust this selector as needed for Twitter
    this.userTag = "div[data-testid='like']";
  }

  // Scrolls to the bottom of the page
  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  // Click method analogous to clickAddFriend in FacebookView
  clickLike(divEl) {
    divEl.click();
  }

  // Helper method to find all "Like" divs (similar to findAddFriendDivs)
  findLikeDivs() {
    const allDivs = document.getElementsByTagName("div");
    return [...allDivs].filter((div) => {
      return (
        div.getAttribute("aria-label") &&
        div.getAttribute("aria-label").includes("Like") &&
        div.getAttribute("data-testid") &&
        div.getAttribute("data-testid") === "like"
      );
    });
  }
}

export default TwitterView;
