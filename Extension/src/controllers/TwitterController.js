const BaseController = require("./BaseController.js");
const TwitterModel = require("../models/TwitterModel.js");
const TwitterView = require("../views/TwitterView.js");
const { randomDelay } = require("../utils/helpers.js");

class TwitterController extends BaseController {
  constructor() {
    super("twitter");
    this.model = new TwitterModel();
    this.view = new TwitterView(this);
    this.actionDelay = { min: 1000, max: 5000 };
    this.isActive = false;
  }

  //  Creates comPort and sets up Initialization
  setup() {
    super.setup();
    this.view.render();
    this.connectModel();
    this.isActive = true;
    this.log("Twitter controller initialized");
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
        case "UpdateTwitter":
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
      story.StartTwitterLike &&
      story.LikedMediaTwitterSize < story.MaxTwitterLikes &&
      this.model.canLike()
    );
  }

  async initiateLikeSequence() {
    this.view.scrollToBottom();
    await randomDelay();

    const likeDivs = this.view.findLikeDivs();
    if (likeDivs.length === 0) {
      this.handleError("NoLikeDivs", "No like divs found");
      return;
    }

    const targetDiv = likeDivs[0];
    await this.view.clickLike(targetDiv);

    const profileData = this.view.extractProfileData();
    if (profileData) {
      this.sendLikeMessage(profileData);
      this.model.registerLike(profileData);
    }

    await this.view.dismissModals();
  }

  sendLikeMessage(data) {
    this.sendMessage("DoneTwitterLike", "User", {
      url: window.location.href,
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

  // Calls the BaseController.destroy() method
  destroy() {
    this.view.destroy();
    this.model.removeAllListeners();
    super.destroy();
  }
}

module.exports = TwitterController;
