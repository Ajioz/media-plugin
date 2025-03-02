import BaseController from "./BaseController.js";
import PinterestModel from "../models/PinterestModel.js";
import PinterestView from "../views/PinterestView.js";

class PinterestController extends BaseController {
  constructor() {
    const model = new PinterestModel();
    const view = new PinterestView();
    super(model, view);

    this.comPort = null;
  }

  init() {
    this.createComPort();
    console.log("Pinterest Controller Initialized!");
  }

  createComPort() {
    this.comPort = chrome.runtime.connect({ name: "pinterest" });
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

    if (msg.Tag === "UpdatePinterest") {
      this.view.scrollToBottom();
      this.sendMessage("GetPinterest", "target", "");
    } else if (msg.Tag === "LikeFollow") {
      this.handleLikeFollow(msg.story);
    }
  }

  sendMessage(tag, msgTag, msg) {
    const sendObj = { Tag: tag };
    sendObj[msgTag] = msg;
    console.log("Sending message to background:", sendObj);
    this.comPort.postMessage(sendObj);
  }

  handleLikeFollow(story) {
    setTimeout(() => {
      const url = window.location.href;
      const username = this.extractUsername();
      const img = this.extractProfileImage();
      const msgData = { url, username, img };

      this.sendMessage("DonePinterestData", "User", msgData);

      if (
        story.StartPinterestFollow &&
        story.FollowedPoolPinterestSize < story.MaxPinterestFollows
      ) {
        this.followUser(msgData);
      }

      if (
        story.StartPinterestLike &&
        story.LikedMediaPinterestSize < story.MaxPinterestLikes
      ) {
        this.likePost(msgData);
      }
    }, 5000);
  }

  extractUsername() {
    const divs = document.getElementsByTagName("div");
    for (const div of divs) {
      if (div.getAttribute("data-test-id")?.includes("creator-profile-name")) {
        return div.innerText;
      }
    }
    return "Unknown";
  }

  extractProfileImage() {
    const images = document.getElementsByTagName("img");
    let counter = 0;
    for (const img of images) {
      if (img.getAttribute("src")?.includes("pinimg")) {
        counter++;
        if (counter === 2) {
          return img.src;
        }
      }
    }
    return "https://instoo.com/logo.png";
  }

  followUser(msgData) {
    const followButtons = this.view.findFollowButtons();
    if (followButtons.length > 0) {
      followButtons[0].click();
      this.sendMessage("DonePinterestFollow", "User", msgData);
    }
  }

  likePost(msgData) {
    setTimeout(() => {
      const likeButtons = this.view.findLikeButtons();
      if (likeButtons.length > 0) {
        likeButtons[0].click();
      }

      const reactionButtons = this.view.findReactionButtons();
      if (reactionButtons.length > 0) {
        reactionButtons[0].click();
      }

      this.sendMessage("DonePinterestLike", "User", msgData);
    }, 4000);
  }
}

export default PinterestController;
