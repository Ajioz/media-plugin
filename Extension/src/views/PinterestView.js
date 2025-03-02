import BaseView from "./BaseView.js";

class PinterestView extends BaseView {
  constructor() {
    super();
    this.userTag = "._7UhW9";
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  findFollowButtons() {
    const buttons = document.getElementsByTagName("button");
    return [...buttons].filter(
      (btn) =>
        btn.innerText.includes("Follow") && !btn.innerText.includes("Following")
    );
  }

  findLikeButtons() {
    const divs = document.getElementsByTagName("div");
    return [...divs].filter(
      (div) =>
        div.getAttribute("class") &&
        div.getAttribute("class").includes("engagement-icon")
    );
  }

  findReactionButtons() {
    const buttons = document.getElementsByTagName("button");
    return [...buttons].filter(
      (btn) =>
        btn.getAttribute("aria-label") &&
        btn.getAttribute("aria-label").includes("reaction")
    );
  }
}

export default PinterestView;
