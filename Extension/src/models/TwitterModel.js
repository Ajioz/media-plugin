import BaseModel from "./BaseModel";

class TwitterModel extends BaseModel {
  static TWITTER_DEFAULTS = {
    maxRetweets: 50,
    dailyActionLimit: 300,
    scrollDepth: 3,
    timing: { min: 500, max: 3000 },
  };

  constructor(settings = {}) {
    super("twitter", {
      ...TwitterModel.TWITTER_DEFAULTS,
      ...settings,
    });

    this.lastMessage = null; // Store the last received message
    this.sharedData = null; // Store shared data from the raw code
    this.retweets = []; // Track retweeted posts
    this.actionsToday = []; // Track actions performed today
  }

  /**
   * Handles incoming messages from the raw code.
   * @param {Object} msg - The incoming message object.
   */
  handleIncomingMessage(msg) {
    this.lastMessage = msg;

    if (msg.Tag === "UpdateTwitter") {
      this.storeSharedData(msg.story);
      console.log("Updating Twitter state:", msg.story);
    } else if (msg.Tag === "LikeFollow") {
      this.emit("likeFollowTriggered");
      this.performScroll(this.settings.scrollDepth);
    }
  }

  /**
   * Stores shared data in the model.
   * @param {Object} data - The shared data object.
   */
  storeSharedData(data) {
    this.sharedData = data;
    this.emit("dataStored", data);
  }

  /**
   * Simulates scrolling behavior.
   * @param {number} depth - The number of scrolls to perform.
   */
  performScroll(depth) {
    if (depth > 0) {
      window.scrollTo(0, document.body.scrollHeight);
      setTimeout(() => this.performScroll(depth - 1), this.settings.timing.min);
    }
  }

  /**
   * Follows a user with rate limiting.
   * @param {Object} user - The user to follow.
   * @returns {boolean} - True if the user was followed, false otherwise.
   */
  followUser(user) {
    const result = super.followUser(user);
    if (result) {
      this.recordAction("follow", user);
      this.throttleAction();
      console.log(`Followed user: ${user.id}`);
    }
    return result;
  }

  /**
   * Likes a post with rate limiting.
   * @param {Object} post - The post to like.
   * @returns {boolean} - True if the post was liked, false otherwise.
   */
  likePost(post) {
    const result = super.likePost(post);
    if (result) {
      this.recordAction("like", post);
      this.throttleAction();
      console.log(`Liked post: ${post.id}`);
    }
    return result;
  }

  /**
   * Registers a retweet with rate limiting.
   * @param {Object} post - The post to retweet.
   * @returns {boolean} - True if the post was retweeted, false otherwise.
   */
  registerRetweet(post) {
    if (this.retweets.length >= this.settings.maxRetweets) {
      this.handleError("RetweetLimitExceeded", "Maximum retweets reached");
      return false;
    }

    this.retweets.push(post);
    this.recordAction("retweet", post);
    this.throttleAction();
    this.emit("retweetRegistered", post);
    console.log(`Retweeted post: ${post.id}`);
    return true;
  }

  /**
   * Gets statistics about the model.
   * @returns {Object} - An object containing counts of followed, liked, retweeted, and other metrics.
   */
  getStats() {
    return {
      ...super.getStats(),
      retweetCount: this.retweets.length,
      actionCountToday: this.actionsToday.length,
    };
  }

  /**
   * Records an action and logs it to the console.
   * @param {string} action - The type of action (e.g., "follow", "like", "retweet").
   * @param {*} data - The data associated with the action.
   */
  recordAction(action, data) {
    console.log(`Recorded ${action}:`, data);
    this.actionsToday.push({ action, data, timestamp: new Date() });
  }

  /**
   * Throttles actions based on timing settings.
   */
  throttleAction() {
    const now = new Date().getTime();
    const lastActionTime =
      this.actionsToday[this.actionsToday.length - 1]?.timestamp || 0;
    const cooldown = this.settings.timing.min;

    if (now - lastActionTime < cooldown) {
      setTimeout(
        () => console.log("Action throttled due to cooldown"),
        cooldown - (now - lastActionTime)
      );
    }
  }

  /**
   * Handles errors and logs them.
   * @param {string} errorType - The type of error.
   * @param {string} details - Additional details about the error.
   */
  handleError(errorType, details) {
    super.handleError(errorType, details);
    this.emit("error", { errorType, details });
  }
}

module.exports = TwitterModel;
