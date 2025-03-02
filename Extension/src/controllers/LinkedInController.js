import BaseController from "./BaseController.js";
import LinkedInModel from "../models/LinkedInModel.js";
import LinkedInView from "../views/LinkedInView.js";

class LinkedInController extends BaseController {
  constructor() {
    const model = new LinkedInModel();
    const view = new LinkedInView();
    super(model, view);

    this.comPort = null;
  }

  init() {
    this.createComPort();
    console.log("LinkedIn Controller Initialized!");
  }

  createComPort() {
    this.comPort = chrome.runtime.connect({ name: "linkedin" });
    this.comPort.onMessage.addListener((msg) => this.onMessageReceive(msg));

    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      if (event.data.Tag === "SharedData") {
        this.model.setSharedData(event.data.SharedData);
      }
    });
  }

  onMessageReceive(msg) {
    console.log("Message Received:", msg);

    if (msg.Tag === "UpdateLinkedIn") {
      this.view.scrollToBottom();
    } else if (msg.Tag === "LikeFollow") {
      this.handleConnections(msg.story);
    }
  }

  sendMessage(tag, msgTag, msg) {
    const sendObj = { Tag: tag };
    sendObj[msgTag] = msg;
    console.log("Sending message to background:", sendObj);
    this.comPort.postMessage(sendObj);
  }

  handleConnections(story) {
    if (
      story.StartLinkedInConnect &&
      story.ConnectedPoolSize < story.MaxLinkedInConnections
    ) {
      setTimeout(() => {
        const connectButtons = this.view.findConnectButtons();
        if (connectButtons.length > 0) {
          const randomIndex = Math.floor(Math.random() * connectButtons.length);
          const selectedButton = connectButtons[randomIndex];

          this.view.clickConnect(selectedButton);

          const msgData = {
            url: window.location.href,
            username: this.extractUsername(),
          };

          this.sendMessage("DoneLinkedInConnect", "User", msgData);
        }
      }, Math.random() * 3000 + 1000);
    }
  }

  extractUsername() {
    const profileLink = document.querySelector(this.view.userTag);
    return profileLink ? profileLink.innerText.trim() : "Unknown";
  }
}

export default LinkedInController;
