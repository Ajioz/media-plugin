const BaseController = require("./BaseController");
const PinterestModel = require("../models/PinterestModel");
const PinterestView = require("../views/PinterestView");
const { randomDelay } = require("../utils/helpers.js");

class PinterestController extends BaseController {
  constructor(settings) {
    super("pinterest");
    this.model = new PinterestModel(settings);
    this.view = new PinterestView(this);
    this.initialize();
  }

  //  Creates comPort and sets up Initialization
  setup() {
    super.setup();
    this.view.render();
    this.connectModel();
    this.isActive = true;
    this.log("Pinterest controller initialized");
  }

  connectModel() {
    super.setupModelListeners();
    this.model.on("scanInitiated", (data) => this.handleScanInitiated(data));
    this.model.on("actionsProcessed", (actions) => this.handleActions(actions));
  }

  handleIncomingMessage(msg) {
    try {
      // Pass message directly to model while maintaining controller mediation
      this.model.handleMessage(msg);
    } catch (error) {
      this.handleError("MessageProcessing", error);
    }
  }

  handleScanInitiated(scanData) {
    this.view.status(`Scanning depth: ${scanData.depth}`);
    const items = this.view.findResultItems();

    items.forEach((item) => {
      this.sendMessage("PinterestTarget", "target", item.href);
      this.model.scrapedData.push(this.view.extractItemData(item));
    });
  }

  handleActions(actions) {
    actions.forEach((action) => {
      switch (action.type) {
        case "follow":
          this.processFollowAction(action.data);
          break;
        case "like":
          this.processLikeAction(action.data);
          break;
      }

      this.sendMessage(action.messageTag, "User", action.data);
      this.view.logAction(action.type, action.data);
    });
  }

  processFollowAction(profileData) {
    if (this.model.followedProfiles.length < this.model.settings.maxFollows) {
      this.view.clickFollowButton();
      this.view.highlightProfile(profileData);
    }
  }

  processLikeAction(pinData) {
    if (this.model.likedPins.length < this.model.settings.maxLikes) {
      setTimeout(() => {
        this.view.clickEngagementIcons();
        this.view.highlightPin(pinData);
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

module.exports = PinterestController;
