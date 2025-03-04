const BaseController = require("./BaseController");
const TikTokModel = require("../models/TikTokModel");
const TikTokView = require("../views/TikTokView");
const { randomDelay } = require("../utils/helpers.js");

class TikTokController extends BaseController {
  constructor(settings) {
    super("tiktok");
    this.model = new TikTokModel(settings);
    this.view = new TikTokView(this);
    this.initialize();
  }

  //  Creates comPort and sets up Initialization
  setup() {
    super.setup();
    this.view.render();
    this.connectModel();
    this.isActive = true;
    this.log("TikTok controller initialized");
  }

  connectModel() {
    super.setupModelListeners();
    this.model.on("scanInitiated", (data) => this.handleScan(data));
    this.model.on("actionsProcessed", (actions) =>
      this.processActions(actions)
    );
  }

  handleMessage(msg) {
    try {
      this.model.handleMessage(msg);
    } catch (error) {
      this.handleError("MessageError", error);
    }
  }

  handleScan(scanData) {
    const items = this.view.findVideoItems();
    items.forEach((item) => {
      this.sendMessage("TikTokTarget", "target", item.href);
      this.model.scrapedTags.push(this.view.extractVideoData(item));
    });
  }

  processActions(actions) {
    actions.forEach((action) => {
      switch (action.type) {
        case "follow":
          this.handleFollow(action.data);
          break;
        case "like":
          this.handleLike(action.data);
          break;
      }
      this.sendMessage(action.messageTag, "User", action.data);
    });
  }

  handleFollow(profileData) {
    if (this.model.followedAccounts.length < this.model.settings.maxFollows) {
      this.view.clickFollowButton();
      this.view.highlightVideoElement(profileData.url);
    }
  }

  handleLike(videoData) {
    if (this.model.likedVideos.length < this.model.settings.maxLikes) {
      setTimeout(() => {
        this.view.clickLikeButtons();
        this.view.highlightVideoElement(videoData.url);
      }, randomDelay());
    }
  }

  // Override sendMessage to extend the message with stats
  sendMessage(tag, msgTag, msg) {
    // Extending original message
    const extendedMsg = { ...msg, stats: this.model.getStats() };
    super.sendMessage(tag, msgTag, extendedMsg);
  }

  // Calls the BaseController.destroy() method
  destroy() {
    this.view.destroy();
    this.model.removeAllListeners();
    super.destroy();
  }
}

module.exports = TikTokController;
