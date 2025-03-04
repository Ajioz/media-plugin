import BaseModel from "./BaseModel";

class PinterestModel extends BaseModel {
  static PINTEREST_DEFAULTS = {
    maxFollows: 200,
    maxLikes: 500,
    scanDepth: 3,
    timing: { min: 1500, max: 4000 },
  };

  constructor(settings = {}) {
    super("pinterest", {
      ...PinterestModel.PINTEREST_DEFAULTS,
      ...settings,
    });

    this.followedProfiles = [];
    this.likedPins = [];
    this.scrapedData = [];
    this.processedUrls = new Set();
  }

  /**
   * Handles incoming messages from the Controller
   * @param {Object} msg - Message object matching raw code structure
   */
  handleMessage(msg) {
    switch (msg.Tag) {
      case "UpdatePinterest":
        this.handleContentUpdate(msg.story);
        break;

      case "LikeFollow":
        this.handleActionRequest(msg.story);
        break;

      default:
        this.handleError(
          "UnknownMessage",
          `Received unknown message tag: ${msg.Tag}`
        );
    }
  }

  /**
   * Processes content update requests from raw code
   * @param {Object} story - Story configuration from raw code
   */
  handleContentUpdate(story) {
    this.emit("scanInitiated", {
      depth: this.settings.scanDepth,
      target: story.target,
    });
  }

  /**
   * Processes action requests from raw code
   * @param {Object} story - Action configuration from raw code
   */
  handleActionRequest(story) {
    const actions = [];

    if (story.StartPinterestFollow) {
      actions.push(this.processFollowAction(story));
    }

    if (story.StartPinterestLike) {
      actions.push(this.processLikeAction(story));
    }

    this.emit("actionsProcessed", actions.filter(Boolean));
  }

  /**
   * Processes follow action from raw code structure
   */
  processFollowAction(story) {
    if (this.followedProfiles.length >= this.settings.maxFollows) {
      this.handleError("FollowLimit", "Maximum follows reached");
      return null;
    }

    const profileData = this.extractProfileData(story);
    if (!profileData || this.processedUrls.has(profileData.url)) {
      return null;
    }

    this.followedProfiles.push(profileData);
    this.processedUrls.add(profileData.url);
    this.recordAction("follow", profileData);

    return {
      type: "follow",
      data: profileData,
      messageTag: "DonePinterestFollow",
    };
  }

  /**
   * Processes like action from raw code structure
   */
  processLikeAction(story) {
    if (this.likedPins.length >= this.settings.maxLikes) {
      this.handleError("LikeLimit", "Maximum likes reached");
      return null;
    }

    const pinData = this.extractPinData(story);
    if (!pinData || this.processedUrls.has(pinData.url)) {
      return null;
    }

    this.likedPins.push(pinData);
    this.processedUrls.add(pinData.url);
    this.recordAction("like", pinData);

    return {
      type: "like",
      data: pinData,
      messageTag: "DonePinterestLike",
    };
  }

  /**
   * Extracts profile data matching raw code structure
   */
  extractProfileData(story) {
    return {
      username: story.username || "unknown",
      url: story.url,
      img: story.img || "default-image.jpg",
      timestamp: new Date(),
    };
  }

  /**
   * Extracts pin data matching raw code structure
   */
  extractPinData(story) {
    return {
      pinId: story.pinId || Date.now().toString(),
      url: story.url,
      img: story.img,
      author: story.username,
      timestamp: new Date(),
    };
  }

  /**
   * Gets enhanced statistics including Pinterest-specific metrics
   */
  getStats() {
    return {
      ...super.getStats(),
      followedProfiles: this.followedProfiles.length,
      likedPins: this.likedPins.length,
      scrapedData: this.scrapedData.length,
      remainingFollows: this.settings.maxFollows - this.followedProfiles.length,
    };
  }

  /**
   * Enhanced error handling with Pinterest-specific errors
   */
  handleError(errorType, details) {
    const pinterestErrors = {
      FollowLimit: "warning",
      LikeLimit: "warning",
      DataValidation: "error",
    };

    const level = pinterestErrors[errorType] || "error";
    console[level](`[Pinterest] ${errorType}: ${details}`);
    super.handleError(errorType, details);
  }
}

module.exports = PinterestModel;
