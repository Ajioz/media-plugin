const BaseController = require("./BaseController.js");
const TinderModel = require("../models/TinderModel.js");
const TinderView = require("../views/TinderView.js");
const { randomDelay } = require("../utils/helpers.js");

class TinderController extends BaseController {
  constructor() {
    super("tinder");
    this.model = new TinderModel();
    this.view = new TinderView(this);
    this.actionDelay = { min: 1000, max: 4000 };
    this.isActive = false;
  }

  //  Creates comPort and sets up Initialization
  setup() {
    super.setup();
    this.view.render();
    this.connectModel();
    this.isActive = true;
    this.log("Tinder controller initialized");
  }

  /**
   * Connects the model by setting up model listeners and handling specific events.
   *
   * This method sets up listeners for the "like" and "limitReached" events on the model.
   * When the "like" event is triggered, it calls the handleLikeSuccess method with the event data.
   * When the "limitReached" event is triggered, it calls the handleLimitReached method.
   */
  connectModel() {
    super.setupModelListeners();
    this.model.on("like", (data) => this.handleLikeSuccess(data));
    this.model.on("limitReached", () => this.handleLimitReached());
  }

  onMessageReceive(msg) {
    try {
      switch (msg.Tag) {
        case "UpdateTinder":
          this.handleUpdate(msg.story);
          break;
        case "LikeFollow":
          this.handleLikeFollow(msg.story);
          break;
        case "StopActions":
          this.stopAllActions();
          break;
        default:
          this.handleUnknownMessage(msg);
      }
    } catch (error) {
      this.handleError("MessageProcessing", error);
    }
  }

  handleUpdate(story) {
    if (!this.isActive) return;
    this.model.updateSettings(story);
    this.view.status(`Processing update: ${story.title}`);
    this.log(`New settings: ${JSON.stringify(story)}`);
  }

  async handleLikeFollow(story) {
    if (!this.validateLikeRequest(story)) return;

    try {
      await this.initiateLikeSequence();
      this.sendStatusUpdate();
    } catch (error) {
      this.handleError("LikeFollowError", error);
    }
  }

  validateLikeRequest(story) {
    return (
      this.isActive &&
      story.StartTinderLike &&
      story.LikedMediaTinderSize < story.MaxTinderLikes &&
      this.model.canLike()
    );
  }

  async initiateLikeSequence() {
    // Replicate raw code's scroll behavior
    this.view.scrollTop(20);

    await randomDelay();

    const buttons = this.view.findLikeButtons();
    if (buttons.length === 0) {
      this.handleError("NoLikeButtons", "No like buttons found");
      return;
    }

    const targetButton = buttons[0];
    await this.view.clickLikeButton(targetButton);

    const profileData = this.view.extractProfileData();
    if (profileData) {
      this.sendLikeMessage(profileData);
      this.model.registerLike(profileData);
    }

    await this.view.dismissModals();
  }

  sendLikeMessage(data) {
    this.sendMessage("DoneTinderLike", "User", {
      url: "tinder.com", // Matching raw code's hardcoded value
      username: data.username,
      img: data.img,
    });
  }

  sendStatusUpdate() {
    this.sendMessage("StatusUpdate", "Stats", this.model.getStats());
  }

  handleLimitReached() {
    this.view.showWarning("Daily like limit reached");
    this.stopAllActions();
  }

  stopAllActions() {
    this.isActive = false;
    this.view.cleanup();
    this.log("All actions stopped");
  }

  // Subclass (override)
  handleModelError(error) {
    super.handleModelError(error);
    console.error(`[TinderController] Custom Handling:`, error);
    this.sendMessage("Error", "Details", {
      platform: "tinder",
      errorType: error.code || "CustomError",
      error: error.message,
    });
  }

  // Calls the BaseController.destroy() method
  destroy() {
    this.view.destroy();
    this.model.removeAllListeners();
    super.destroy();
  }
}

module.exports = TinderController;
