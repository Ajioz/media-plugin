const BaseModel = require("./BaseModel");

class InstagramModel extends BaseModel {
  constructor(settings = {}) {
    super("instagram", {
      ...BaseModel.DEFAULT_SETTINGS,
      maxFollows: 2000,
      maxLikes: 50000,
      maxUnfollows: 2000,
      maxMessages: 50,
      maxComments: 30,
      minFollowers: 100,
      maxFollowers: 10000,
      maxFollows: 2000, // Customize max follows for Instagram
      maxLikes: 50000, // Customize max likes for Instagram
      maxUnfollows: 2000, // Max unfollows per session
      maxMessages: 50, // Max direct messages per session
      maxComments: 30, // Max comments per session
      minFollowers: 100, // Minimum followers for valid interaction
      maxFollowers: 10000, // Maximum followers for valid interaction
      ...settings, // Allow custom settings to override defaults
    });

    this.unfollowed = []; // List of unfollowed users
    this.messagesSent = []; // List of sent direct messages
    this.commentsMade = []; // List of comments made
    this.storiesReacted = []; // List of stories reacted to
  }

  /**
   * Follows a user if the max follows limit is not reached.
   * @param {Object} user - The user to follow.
   * @returns {boolean} - True if the user was followed, false otherwise.
   */
  followUser(user) {
    const result = super.followUser(user); // Use the base model's followUser method
    if (result) {
      this.emit("followedUser", user); // Emit a custom event for Instagram-specific actions
    }
    return result;
  }

  /**
   * Unfollows a user if the max unfollows limit is not reached.
   * @param {Object} user - The user to unfollow.
   * @returns {boolean} - True if the user was unfollowed, false otherwise.
   */
  unfollowUser(user) {
    if (this.unfollowed.length < this.settings.maxUnfollows) {
      if (this.followed.includes(user)) {
        this.unfollowed.push(user);
        this.followed = this.followed.filter((u) => u !== user);
        this.recordAction("unfollow", user); // Use the base model's recordAction method
        this.emit("unfollowedUser", user); // Emit a custom event for Instagram-specific actions
        return true;
      }
      this.handleError("InvalidUser", `User ${user.id} is not followed.`);
      return false;
    }
    this.handleError("MaxUnfollowsExceeded", "Cannot unfollow more users.");
    return false;
  }

  /**
   * Likes a post if the max likes limit is not reached.
   * @param {Object} post - The post to like.
   * @returns {boolean} - True if the post was liked, false otherwise.
   */
  likePost(post) {
    const result = super.likePost(post); // Use the base model's likePost method
    if (result) {
      this.emit("likedPost", post); // Emit a custom event for Instagram-specific actions
    }
    return result;
  }

  /**
   * Sends a direct message to a user if the max messages limit is not reached.
   * @param {string} user - The user to send the message to.
   * @param {string} message - The message content.
   * @returns {boolean} - True if the message was sent, false otherwise.
   */
  sendMessage(user, message) {
    if (this.messagesSent.length < this.settings.maxMessages) {
      this.messagesSent.push({ user, message });
      this.recordAction("message", { user, message }); // Use the base model's recordAction method
      this.emit("messageSent", { user, message }); // Emit a custom event for Instagram-specific actions
      return true;
    }
    this.handleError("MaxMessagesExceeded", "Cannot send more messages.");
    return false;
  }

  /**
   * Comments on a post if the max comments limit is not reached.
   * @param {Object} post - The post to comment on.
   * @param {string} comment - The comment content.
   * @returns {boolean} - True if the comment was made, false otherwise.
   */
  commentPost(post, comment) {
    if (this.commentsMade.length < this.settings.maxComments) {
      this.commentsMade.push({ post, comment });
      this.recordAction("comment", { post, comment }); // Use the base model's recordAction method
      this.emit("commentMade", { post, comment }); // Emit a custom event for Instagram-specific actions
      return true;
    }
    this.handleError("MaxCommentsExceeded", "Cannot comment on more posts.");
    return false;
  }

  /**
   * Reacts to a story with a predefined reaction.
   * @param {Object} story - The story to react to.
   * @param {string} reaction - The reaction type.
   * @returns {boolean} - True if the reaction was applied, false otherwise.
   */
  reactToStory(story, reaction) {
    if (this.storiesReacted.length < this.settings.maxLikes) {
      this.storiesReacted.push({ story, reaction });
      this.recordAction("storyReaction", { story, reaction }); // Use the base model's recordAction method
      this.emit("storyReacted", { story, reaction }); // Emit a custom event for Instagram-specific actions
      return true;
    }
    this.handleError("MaxReactionsExceeded", "Cannot react to more stories.");
    return false;
  }

  /**
   * Checks if a user is within the allowed follower range.
   * @param {Object} user - The user to check.
   * @returns {boolean} - True if the user is within the range, false otherwise.
   */
  isWithinFollowerRange(user) {
    const { followers } = user;
    return (
      followers >= this.settings.minFollowers &&
      followers <= this.settings.maxFollowers
    );
  }

  /**
   * Gets detailed statistics about the model.
   * @returns {Object} - An object containing counts of followed, liked, unfollowed, messages, and comments.
   */
  getStats() {
    const baseStats = super.getStats(); // Get base stats
    return {
      maxUnfollows: this.settings.maxUnfollows || 2000,
      unfollowedCount: this.unfollowed.length,
      messageCount: this.messagesSent.length,
      commentCount: this.commentsMade.length,
      maxFollowers: this.settings.maxFollowers || 10000,
      maxFollows: this.settings.maxFollows,
      maxLikes: this.settings.maxLikes,
      maxUnfollows: this.settings.maxUnfollows,
      maxMessages: this.settings.maxMessages,
      maxComments: this.settings.maxComments,
      minFollowers: this.settings.minFollowers,
      maxFollowers: this.settings.maxFollowers,
    };
  }

  /**
   * Collects user data (e.g., followers, following count).
   * @param {string} username - The username to collect data for.
   * @returns {Promise<Object>} - A promise that resolves with the user data.
   */
  async collectUserData(username) {
    try {
      const response = await fetch(
        `https://www.instagram.com/${username}/?__a=1`
      );
      if (!response.ok) {
        throw new Error("Failed to retrieve user data.");
      }
      const data = await response.json();
      const userData = data.graphql.user;

      this.addUser(userData); // Use the base model's addUser method
      this.recordAction("userDataCollected", userData); // Use the base model's recordAction method
      this.emit("userDataCollected", userData); // Emit a custom event for Instagram-specific actions
      return userData;
    } catch (error) {
      this.handleError(
        "UserDataError",
        `Failed to collect data for ${username}: ${error.message}`
      );
      return null;
    }
  }
}

module.exports = InstagramModel;
