const BaseController = require("./BaseController.js");
const FacebookModel = require("../models/FacebookModel.js");
const FacebookView = require("../views/FacebookView.js");
const { selectRandomElement, randomDelay } = require("../utils/helpers.js");

class FacebookController extends BaseController {
  constructor() {
    super("facebook");
    this.model = new FacebookModel();
    this.view = new FacebookView(this);
    this.actionDelay = { min: 1000, max: 30000 };
  }

  // Creates comPort and sets up Initialization
  setup() {
    super.setup(); // Creates comPort and sets up message listeners
    this.view.render();
    this.connectModel();
    this.isActive = true;
    this.log("Facebook controller initialized");
  }

  /**
   *  Generic contact data handler for all controllers
   *  @param {Object} data - The data received.
   */
  connectModel() {
    super.setupModelListeners();
    this.model.on("LikeFollow", (data) => this.handleLikeFollow(data));
    this.model.on("Updatefacebook", (data) => this.handleUpdate(data));
  }

  // Message handling
  onMessageReceive(msg) {
    super.onMessageReceive(msg);
    try {
      switch (msg.Tag) {
        case "Updatefacebook":
          this.handleUpdate(msg.story);
          break;
        case "LikeFollow":
          this.handleLikeFollow(msg.story);
          break;
        default:
          this.handleUnknownMessage(msg);
      }
    } catch (error) {
      this.handleError("MessageProcessing", error.message);
    }
  }

  handleUpdate(story) {
    this.model.updateStory(story);
    this.view.status(`Processing story: ${story.title}`);
    this.log(`Updated story: ${story.title}`);
  }


  // Action management
  async initiateFollowSequence(iterations = 5) {
    try {
      for (let i = 0; i < iterations; i++) {
        await this.performFollowAction();
        await randomDelay();
      }
      this.model.emit("followSequenceComplete");
    } catch (error) {
      this.handleError("FollowSequence", error.message);
    }
  }

  async performFollowAction() {
    try {
      await this.view.scrollToBottom();
      const buttons = this.view.findAddFriendButtons();

      if (buttons.length > 0) {
        const targetButton = selectRandomElement(buttons);
        await this.view.clickAddFriend(targetButton);

        const profileData = this.view.extractProfileData(targetButton);
        if (profileData) {
          this.sendFollowMessage(profileData);
          this.model.registerFollow(profileData);
        }
      }
    } catch (error) {
      this.handleError("FollowAction", error.message);
    }
  }

  validateFollowRequest(story) {
    return (
      story.StartfacebookFollow &&
      story.FollowedPoolfacebookSize < story.MaxfacebookFollows &&
      this.model.canPerformAction("follow")
    );
  }

  sendFollowMessage(data) {
    this.sendMessage("DonefacebookFollow", "User", {
      url: data.url,
      username: data.username,
      img: data.img,
    });
  }

  // Calls the BaseController.destroy() method
  destroy() {
    this.view.destroy();
    this.model.removeAllListeners();
    super.destroy();
  }
}

module.exports = FacebookController;
