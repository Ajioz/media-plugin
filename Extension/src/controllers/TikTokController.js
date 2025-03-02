import BaseController from "./BaseController.js";
import TikTokModel from "../models/TikTokModel.js";
import TikTokView from "../views/TikTokView.js";

class TikTokController extends BaseController {
  constructor() {
    const model = new TikTokModel();
    const view = new TikTokView();
    super(model, view);
    this.comPort = null;
  }

  init() {
    this.createComPort();
    console.log("TikTok Controller Initialized!");
  }

  createComPort() {
    this.comPort = chrome.runtime.connect({ name: "tiktok" });
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

    if (msg.Tag === "UpdateTikTok") {
      this.processVideoLinks();
    } else if (msg.Tag === "LikeFollow") {
      this.processLikeFollow(msg.story);
    }
  }

  processVideoLinks() {
    const videos = this.view.findVideoLinks();
    videos.forEach((video) => {
      this.sendMessage("TikTokTarget", "target", video.getAttribute("href"));
    });
  }

  processLikeFollow(story) {
    this.sendMessage("DoneTikTok", "target", window.location.href);

    const followBtn = this.view.findFollowButton();
    if (
      story.StartTikTokFollow &&
      story.FollowedPoolTikTokSize < story.MaxTikTokFollows &&
      followBtn
    ) {
      followBtn.click();
      this.sendUserData("DoneTikTokFollow");
    }

    setTimeout(() => {
      const likeBtn = this.view.findLikeButton();
      if (
        story.StartTikTokLike &&
        story.LikedMediaTikTokSize < story.MaxTikTokLikes &&
        likeBtn
      ) {
        likeBtn.click();
        this.sendUserData("DoneTikTokLike");
      }
    }, 4000);
  }

  sendUserData(tag) {
    const url = window.location.href;
    const username = url.split("/")[3];
    const img = this.view.findUserAvatar();

    const msgData = { url, username, img };
    this.sendMessage(tag, "User", msgData);
  }

  sendMessage(tag, msgTag, msg) {
    const sendObj = { Tag: tag, [msgTag]: msg };
    console.log("Sending message to background:", sendObj);
    this.comPort.postMessage(sendObj);
  }
}

export default TikTokController;
