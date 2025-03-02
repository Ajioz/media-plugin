import BaseView from "./BaseView.js";

class TinderView extends BaseView {
  constructor() {
    super();
    this.userTag = "span[itemprop='name']"; // Selector for Tinder usernames
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  findLikeButtons() {
    const allButtons = document.getElementsByTagName("button");
    return [...allButtons].filter((button) => {
      return (
        button.innerHTML.includes("Like") &&
        !button.innerHTML.includes("Super Like")
      );
    });
  }

  clickLikeButton(buttonEl) {
    buttonEl.click();
  }

  findUserProfile() {
    let username = "";
    let img = "";

    const nameElement = document.querySelector("span[itemprop='name']");
    if (nameElement) {
      username = nameElement.innerText;
    }

    const imageDiv = document.querySelector(
      `div[aria-label="${username}"][style]`
    );
    if (imageDiv) {
      img = imageDiv.getAttribute("style").split('"')[1];
    }

    return { username, img };
  }
}

export default TinderView;
