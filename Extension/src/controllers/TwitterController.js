import BaseController from "./BaseController.js";
import TwitterModel from "../models/TwitterModel.js";
import TwitterView from "../views/TwitterView.js";

class TwitterController extends BaseController {
  constructor() {
    // Initialize our model & view
    const model = new TwitterModel();
    const view = new TwitterView();
    super(model, view);

    // Chrome extension communication port
    this.comPort = null;
  }

  init() {
    // Called when the content script runs
    this.createComPort();
    console.log("Twitter Controller Initialized!");
  }

  createComPort() {
    this.comPort = chrome.runtime.connect({ name: "twitter" });
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

    if (msg.Tag === "UpdateTwitter") {
      console.log("Update Twitter received", msg.story);
    } else if (msg.Tag === "LikeFollow") {
      this.view.scrollToBottom();

      const story = msg.story;
      if (
        story.StartTwitterLike &&
        story.LikedMediaTwitterSize < story.MaxTwitterLikes
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

      // Find all Like divs (similar to Facebook's findAddFriendDivs)
      const likeDivs = this.view.findLikeDivs();
      const total = likeDivs.length;
      const randomIndex = Math.floor(Math.random() * total);

      if (likeDivs[randomIndex]) {
        const chosenDiv = likeDivs[randomIndex];
        this.view.clickLike(chosenDiv);

        // Example: Gather some data to send back (simulate data extraction)
        const parentNode =
          chosenDiv.parentNode?.parentNode?.parentNode?.parentNode;
        if (parentNode) {
          const msgData = {
            url: window.location.href,
            username: parentNode.querySelector("a")?.innerText,
            img: parentNode.querySelector("img")?.src,
          };
          this.sendMessage("DoneTwitterLike", "User", msgData);
        }
      }

      // Repeat if num > 0
      if (num > 0) {
        this.scrollLike(num - 1);
      }
    }, delay);
  }
}

export default TwitterController;
