import BaseView from "./BaseView.js";

class LinkedInView extends BaseView {
  constructor() {
    super();
    this.userTag = ".profile-rail-card__actor-link"; // Adjust if necessary
  }

  scrollToBottom() {
    window.scrollTo(0, document.body.scrollHeight);
  }

  findConnectButtons() {
    return [...document.querySelectorAll("button")].filter(
      (button) => button.innerText.trim().toLowerCase() === "connect"
    );
  }

  clickConnect(buttonEl) {
    buttonEl.click();
  }
}

export default LinkedInView;
