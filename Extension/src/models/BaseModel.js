class BaseModel {
  static DEFAULT_SETTINGS = {
    maxFollows: 5000,
    maxLikes: Infinity, // No limit on likes
    timing: { min: 500, max: 3000 }, // Recommended timing range in ms
  };

  constructor(app, settings = {}) {
    if (!app) {
      throw new Error("App name is required");
    }

    this.app = app;
    this.settings = { ...BaseModel.DEFAULT_SETTINGS, ...settings }; // Merge default and custom settings
    this.users = [];
    this.posts = [];
    this.followed = [];
    this.liked = [];
    this.currentUser = null;
    this.isActive = false;

    // Event listeners
    this.listeners = {};
  }

  /**
   * Adds a user to the users list.
   * @param {Object|string} user - The user to add.
   */
  addUser(user) {
    if (typeof user === "string") {
      user = { id: user };
    }
    if (typeof user !== "object" || !user.id) {
      console.warn("Invalid user");
      return;
    }
    this.users.push(user);
    this.emit("addUser", user); // Emit event when a user is added
  }

  /**
   * Adds a post to the posts list.
   * @param {Object} post - The post to add.
   */
  addPost(post) {
    if (post) {
      this.posts.push(post);
      this.emit("addPost", post); // Emit event when a post is added
    } else {
      console.warn("Invalid post");
    }
  }

  /**
   * Follows a user if the max follows limit is not reached.
   * @param {Object} user - The user to follow.
   * @returns {boolean} - True if the user was followed, false otherwise.
   */
  followUser(user) {
    if (this.followed.length < this.settings.maxFollows) {
      this.followed.push(user);
      this.recordAction("follow", user); // Simulate persistence
      this.emit("follow", user); // Emit event when a user is followed
      return true;
    }
    this.handleError("MaxFollowsExceeded", "Max follows limit reached");
    return false;
  }

  /**
   * Likes a post if the max likes limit is not reached.
   * @param {Object} post - The post to like.
   * @returns {boolean} - True if the post was liked, false otherwise.
   */
  likePost(post) {
    if (this.liked.length < this.settings.maxLikes) {
      this.liked.push(post);
      this.recordAction("like", post); // Simulate persistence
      this.emit("like", post); // Emit event when a post is liked
      return true;
    }
    this.handleError("MaxLikesExceeded", "Max likes limit reached");
    return false;
  }

  /**
   * Sets the current user.
   * @param {Object} user - The user to set as current.
   */
  setCurrentUser(user) {
    this.currentUser = user;
    this.emit("setCurrentUser", user); // Emit event when the current user changes
  }

  /**
   * Toggles the active state of the model.
   * @param {boolean} state - The state to set.
   */
  toggleActive(state) {
    this.isActive = !!state; // Ensure boolean value
    this.emit("toggleActive", state); // Emit event when the active state changes
  }

  /**
   * Gets statistics about the model.
   * @returns {Object} - An object containing counts of followed, liked, users, and posts.
   */
  getStats() {
    return {
      followedCount: this.followed.length,
      likedCount: this.liked.length,
      userCount: this.users.length,
      postCount: this.posts.length,
    };
  }

  /**
   * Records an action by logging it to the console.
   * Derived models can override this method for custom persistence.
   * @param {string} action - The type of action (e.g., "follow", "like").
   * @param {*} data - The data associated with the action.
   */
  recordAction(action, data) {
    console.log(`Recorded ${action}:`, data);
  }

  /**
   * Handles errors and logs them.
   * @param {string} errorType - The type of error.
   * @param {string} details - Additional details about the error.
   */
  handleError(errorType, details) {
    console.error(`Error (${errorType}): ${details}`);
    this.emit("error", { errorType, details }); // Emit error event
  }

  /**
   * Subscribes to an event.
   * @param {string} event - The event to listen for.
   * @param {Function} callback - The callback function to execute when the event occurs.
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Unsubscribes from an event.
   * @param {string} event - The event to unsubscribe from.
   * @param {Function} callback - The callback function to remove.
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  /**
   * Emits an event to notify listeners.
   * @param {string} event - The event to emit.
   * @param {...any} args - Arguments to pass to the event listeners.
   */
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => callback(...args));
    }
  }
}

module.exports = BaseModel;