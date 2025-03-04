import BaseModel from "./BaseModel";

class TinderModel extends BaseModel {
  constructor(settings = {}) {
    super("tinder", {
      ...BaseModel.DEFAULT_SETTINGS,
      maxLikes: 100, // Customize max likes limit for Tinder
      timing: { min: 4000, max: 8000 }, // Adjust timing range for Tinder
      ...settings,
    });

    this.likedUsers = []; // List of liked users
  }

  /**
   * Likes a user if the max likes limit is not reached.
   * @param {Object} user - The user to like.
   * @returns {boolean} - True if the user was liked, false otherwise.
   */
  likeUser(user) {
    if (this.likedUsers.length < this.settings.maxLikes) {
      const result = super.likePost(user); // Use the base model's likePost method
      if (result) {
        this.likedUsers.push(user);
        this.emit("userLiked", user); // Emit event when a user is liked
      }
      return result;
    }
    this.handleError("MaxLikesExceeded", "Cannot like more users.");
    return false;
  }

  /**
   * Unlikes a user if they are in the likedUsers list.
   * @param {Object} user - The user to unlike.
   * @returns {boolean} - True if the user was unliked, false otherwise.
   */
  unlikeUser(user) {
    if (this.likedUsers.includes(user)) {
      this.likedUsers = this.likedUsers.filter((u) => u !== user);
      this.recordAction("unlike", user); // Use the base model's recordAction method
      this.emit("userUnliked", user); // Emit event when a user is unliked
      return true;
    }
    this.handleError("InvalidUser", `User ${user.id} is not liked.`);
    return false;
  }

  /**
   * Gets detailed statistics about the model.
   * @returns {Object} - An object containing counts of liked users and other stats.
   */
  getStats() {
    const baseStats = super.getStats(); // Get base stats
    return {
      ...baseStats,
      likedCount: this.likedUsers.length,
      maxLikes: this.settings.maxLikes,
    };
  }

  /**
   * Handles errors and logs them.
   * @param {string} errorType - The type of error.
   * @param {string} details - Additional details about the error.
   */
  handleError(errorType, details) {
    super.handleError(errorType, details); // Use the base model's handleError method
  }
}

module.exports = TinderModel;
