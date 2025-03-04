const BaseController = require("./BaseController.js");
const InstagramModel = require("../models/InstagramModel.js");
const InstagramView = require("../views/InstagramView.js");
const { selectRandomElement, randomDelay } = require("../utils/helpers.js");

class InstagramController extends BaseController {
  constructor() {
    super("instagram");
    this.model = new InstagramModel();
    this.view = new InstagramView(this);
    this.actionDelay = { min: 1500, max: 25000 };
    this.initializeDependencies();
  }

  initializeDependencies() {
    this.actions = {
      follow: this.handleFollow.bind(this),
      like: this.handleLike.bind(this),
      story: this.handleStoryView.bind(this),
    };
  }

  //  Creates comPort and sets up Initialization
  setup() {
    super.setup();
    this.view.render();
    this.connectModel();
    this.isActive = true;
    this.log("Instagram controller initialized");
  }

  connectModel() {
    super.setupModelListeners();
    this.model.on("followSuccess", (data) => this.performFollowAction(data));
    this.model.on("likeSuccess", (data) => this.performLikeAction(data));
  }

  // Message handling
  onMessageReceive(msg) {
    super.onMessageReceive(msg);
    try {
      switch (msg.Tag) {
        case "UpdateInstagram":
          this.handleInstagramUpdate(msg.story);
          break;
        case "LikeFollow":
          this.handleInstagramAction(msg.story);
          break;
        case "CollectData":
          this.handleDataCollection(msg.params);
          break;
        default:
          this.handleUnknownMessage(msg);
      }
    } catch (error) {
      this.handleError("MessageProcessing", error.message);
    }
  }

  // Action handlers
  async handleInstagramAction(story) {
    if (this.validateActionRequest(story)) {
      await this.initiateActionSequence({
        follow: story.MaxInstagramFollows,
        like: story.MaxInstagramLikes,
      });
    }
  }

  async initiateActionSequence(targets) {
    try {
      for (let i = 0; i < targets.follow; i++) {
        await this.performFollowAction();
        await randomDelay();
      }

      for (let i = 0; i < targets.like; i++) {
        await this.performLikeAction();
        await randomDelay();
      }

      this.model.emit("actionSequenceComplete");
    } catch (error) {
      this.handleError("ActionSequence", error.message);
    }
  }

  // Core actions
  async performFollowAction() {
    try {
      await this.view.scrollToElement();
      const followButtons = this.view.getFollowButtons();

      if (followButtons.length > 0) {
        const targetButton = selectRandomElement(followButtons);
        const profileData = this.view.extractProfileData(targetButton);

        await this.view.clickFollowButton(targetButton);
        this.model.registerFollow(profileData);
        this.sendFollowMessage(profileData);
      }
    } catch (error) {
      this.handleError("FollowAction", error.message);
    }
  }

  async performLikeAction() {
    try {
      await this.view.scrollToElement();
      const likeButtons = this.view.getLikeButtons();
      if (likeButtons.length > 0) {
        const targetButton = selectRandomElement(likeButtons);
        const mediaData = this.view.extractMediaData(targetButton);

        await this.view.clickLikeButton(targetButton);
        this.model.registerLike(mediaData);
        this.sendLikeMessage(mediaData);
      }
    } catch (error) {
      this.handleError("LikeAction", error.message);
    }
  }

  // Validation and helpers
  validateActionRequest(story) {
    return (
      story.StartInstagramFollow &&
      story.FollowedPoolSize < story.MaxInstagramFollows &&
      this.model.actionsRemaining() > 0
    );
  }

  // Message handlers
  sendFollowMessage(data) {
    this.sendMessage("DoneInstagramFollow", "User", {
      username: data.username,
      profileUrl: data.url,
      avatar: data.image,
    });
  }

  sendLikeMessage(data) {
    this.sendMessage("DoneInstagramLike", "Media", {
      shortcode: data.shortcode,
      mediaUrl: data.url,
      timestamp: new Date().toISOString(),
    });
  }

  // Calls the BaseController.destroy() method
  destroy() {
    this.view.destroy();
    this.model.removeAllListeners();
    super.destroy();
  }
}

module.exports = InstagramController;
