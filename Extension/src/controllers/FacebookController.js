import BaseController from "./BaseController.js";
import FacebookModel from "../models/FacebookModel.js";
import FacebookView from "../views/FacebookView.js";

class FacebookController extends BaseController {
  constructor() {
    // Initialize our model & view
    const model = new FacebookModel();
    const view = new FacebookView();
    super(model, view);

    // Chrome extension communication port
    this.comPort = null;
  }

  init() {
    // This is called when the content script runs
    this.createComPort();
    console.log("Facebook Controller Initialized!");
  }

  createComPort() {
    this.comPort = chrome.runtime.connect({ name: "facebook" });
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

    if (msg.Tag === "Updatefacebook") {
      // Maybe do something with msg.story
      console.log("Update facebook:", msg.story);
    } else if (msg.Tag === "LikeFollow") {
      this.view.scrollToBottom();

      const story = msg.story;
      if (
        story.StartfacebookFollow &&
        story.FollowedPoolfacebookSize < story.MaxfacebookFollows
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

      const addFriendDivs = this.view.findAddFriendDivs();
      const total = addFriendDivs.length;
      const randomIndex = Math.floor(Math.random() * total);

      // Click the randomly chosen 'Add Friend' div
      if (addFriendDivs[randomIndex]) {
        const chosenDiv = addFriendDivs[randomIndex];
        this.view.clickAddFriend(chosenDiv);

        // Example: Gather some data to send back
        const parentNode =
          chosenDiv.parentNode?.parentNode?.parentNode?.parentNode?.parentNode;
        if (parentNode) {
          const msgData = {
            url:
              "https://facebook.com/" +
              parentNode.querySelector("a")?.getAttribute("href"),
            username: parentNode.querySelector("a")?.innerText,
            img: parentNode.querySelector("svg")?.getAttribute("xlink:href"),
          };
          this.sendMessage("DonefacebookFollow", "User", msgData);
        }
      }

      // Repeat if num > 0
      if (num > 0) {
        this.scrollLike(num - 1);
      }
    }, delay);
  }
}

export default FacebookController;
