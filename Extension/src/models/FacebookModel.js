import BaseModel from "./BaseModel";

class FacebookModel extends BaseModel {
  constructor(settings = {}) {
    super("facebook", { ...settings, maxFollows: 50 }); // Initialize with custom settings
  }

  /**
   * Customized likeUser method for Facebook.
   * @param {Object} user - The user to follow.
   * @returns {boolean} - True if the user was followed, false otherwise.
   */
  likeUser(user) {
    const result = super.likePost(user); // Use the base model's likePost method
    if (result) {
      this.recordAction("like", user); // Record the like action
    }
    return result;
  }

  /**
   * Customized followUser method for Facebook.
   * @param {Object} user - The user to follow.
   * @returns {boolean} - True if the user was followed, false otherwise.
   */
  followUser(user) {
    const result = super.followUser(user); // Use the base model's followUser method
    if (result) {
      this.recordAction("follow", user); // Record the follow action
    }
    return result;
  }

  /**
   * Customized getStats method for Facebook.
   * @returns {Object} - Statistics specific to Facebook.
   */
  getStats() {
    const baseStats = super.getStats(); // Get base stats
    return {
      ...baseStats,
      maxFollows: this.settings.maxFollows, // Include maxFollows in the stats
    };
  }
}

module.exports = FacebookModel;
