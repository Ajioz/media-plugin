import BaseController from "./BaseController.js";
import TinderModel from "../models/TinderModel.js";
import TinderView from "../views/TinderView.js";

class TinderController extends BaseController {
  constructor() {
    const model = new TinderModel();
    const view = new TinderView();
    super(model, view);

    this.comPort = null;
  }

  init() {
    this.createComPort();
    console.log("Tinder Controller Initialized!");
  }

  createComPort() {
    this.comPort = chrome.runtime.connect({ name: "tinder" });
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

    if (msg.Tag === "UpdateTinder") {
      console.log("Update Tinder:", msg.story);
    } else if (msg.Tag === "LikeFollow") {
      this.view.scrollToBottom();
      const story = msg.story;

      if (
        story.StartTinderLike &&
        story.LikedMediaTinderSize < story.MaxTinderLikes
      ) {
        this.scrollLike(5);
      }
    }
  }

  sendMessage(tag, msgTag, msg) {
    const sendObj = { Tag: tag };
    sendObj[msgTag] = msg;
    console.log("Sending message to background:", sendObj);
    this.comPort.postMessage(sendObj);
  }

  scrollLike(num) {
    const delay = Math.floor(Math.random() * 30000) + 1000;
    setTimeout(() => {
      this.view.scrollToBottom();

      const likeButtons = this.view.findLikeButtons();
      const total = likeButtons.length;
      const randomIndex = Math.floor(Math.random() * total);

      if (likeButtons[randomIndex]) {
        const chosenButton = likeButtons[randomIndex];
        this.view.clickLikeButton(chosenButton);

        const userProfile = this.view.findUserProfile();
        if (userProfile.username) {
          const msgData = {
            url: "https://tinder.com",
            username: userProfile.username,
            img: userProfile.img,
          };
          this.sendMessage("DoneTinderLike", "User", msgData);
        }
      }

      if (num > 0) {
        this.scrollLike(num - 1);
      }
    }, delay);
  }
}

export default TinderController;
