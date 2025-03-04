class BaseController {
  constructor(appName) {
    this.appName = appName || "Instagram"; // "default Platform app from the old extension"
    this.comPort = null;
    this.currentUser = null;
    this.sharedData = null;
    this.lastUsername = "";

    // Initialize when the document is ready
    document.addEventListener("DOMContentLoaded", () => {
      this.setup();
    });
  }

  setup() {
    this.createComPort();
    console.log("Setup complete!");
  }

  createComPort() {
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.connect
    ) {
      this.comPort = chrome.runtime.connect({ name: this.appName });
      this.comPort.onMessage.addListener((msg) => {
        if (
          this.onMessageReceive !== BaseController.prototype.onMessageReceive
        ) {
          this.onMessageReceive(msg);
        } else {
          console.error("onMessageReceive should be implemented by subclass");
        }
      });
    } else {
      console.error("chrome.runtime.connect is not available.");
    }

    window.addEventListener(
      "message",
      (event) => {
        // Only accept messages from the same window
        if (event.source !== window) return;
        if (event.data && event.data.Tag === "SharedData") {
          this.sharedData = event.data.SharedData;
        }
      },
      false
    );
  }

  /**
   * Sets up listeners for the model events.
   *
   * This method attaches event listeners to the model for handling specific events.
   * It listens for the "contactExtracted" event to process contact data and the "error" event to handle errors.
   *
   * @throws {Error} If the model is not defined in the controller.
   */
  setupModelListeners() {
    if (!this.model) {
      console.error("Model is not defined in the controller.");
      return;
    }
    this.model.on("contactExtracted", (data) => this.handleContactData(data));
    this.model.on("error", (error) => this.handleModelError(error));
  }

  /**
   * Handles the success response for a like action.
   *
   * @param {Object} data - The data returned from the like action.
   * @param {string} data.username - The username of the profile that was liked.
   */
  handleLikeSuccess(data) {
    if (!this.view) {
      console.error("View is not defined in the controller.");
      return;
    }
    this.view.showSuccessAlert(`Liked ${data.username}`);
    this.log(`Successfully liked profile: ${data.username}`);
  }

  handleUpdate(story) {
    this.model.updateScanConfig(story);
    this.view.status(`Scan depth: ${story.scanDepth}`);
  }
  
  sendMessage(tag, msgTag, msg) {
    const message = { Tag: tag, [msgTag]: msg };
    console.log("Sending message:", message);
    if (this.comPort) {
      this.comPort.postMessage(message);
    }
  }

  /**
   * abstract method: subclasses should implement custom message handling.
   * @abstract
   * @param {Object} _msg - The message received.
   */
  onMessageReceive(_msg) {
    throw new Error("onMessageReceive should be implemented by subclass");
  }

  /**
   * Generic contact data handler for all controllers
   * @param {Object} data - Contact data received from model
   */
  handleContactData(data) {
    // Base implementation with common functionality
    console.log(`[${this.appName}] Base contact data handling:`, data);

    // Generic validation
    if (!data || typeof data !== "object") {
      this.handleModelError(new Error("Invalid contact data format"));
      return;
    }
  }

  /**
   * Generic model error handler.
   * Logs the error, displays it via the view, and sends an error message.
   * @param {Error} error - The error object.
   */
  handleModelError(error) {
    console.error(`[${this.appName}Controller Model Error]:`, error);

    if (this.view) {
      if (typeof this.view.handleError === "function") {
        this.view.handleError(error.details || error.message);
      } else if (typeof this.view.showErrorNotification === "function") {
        this.view.showErrorNotification(error.message);
      }
    }

    this.sendMessage("ModelError", "Details", {
      platform: this.appName.toLowerCase(),
      errorType: error.code || "UnknownModelError",
      error: error.message,
      stack: error.stack,
    });
  }

  /**
   * Validates if the follow request can be processed.
   * @param {Object} story - The story object containing follow details.
   * @returns {boolean} - True if the follow request is valid, false otherwise.
   */
  validateFollowRequest(story) {
    // Check if the story object is valid and has the necessary properties
    if (!story || typeof story.MaxFollows !== "number") {
      console.warn("Invalid story object");
      return false;
    }
    if (!this.model) {
      console.error("Model is not defined in the controller.");
      return;
    }

    // Check if the max follows limit is not exceeded
    if (this.model.followed.length >= this.model.settings.maxFollows) {
      console.warn("Max follows limit reached");
      return false;
    }

    return true;
  }

  /**
   * Initiates the follow sequence for the given number of follows.
   * @param {number} maxFollows - The maximum number of follows to initiate.
   */
  initiateFollowSequence(maxFollows) {
    if (!this.model) {
      console.error("Model is not defined in the controller.");
      return;
    }

    // Ensure maxFollows is a valid number
    if (typeof maxFollows !== "number" || maxFollows <= 0) {
      console.warn("Invalid maxFollows value");
      return;
    }

    // For the follow sequence
    for (let i = 0; i < maxFollows; i++) {
      // Assuming followUser is a method in model to follow a user
      const user = this.model.users[i];
      if (user && this.model.followUser(user)) {
        console.log(`Followed user: ${user.name}`);
      } else {
        console.warn("Unable to follow user");
      }
    }
  }

  /**
   * Handles the like and follow action for a given story.
   *
   * @param {Object} story - The story object containing details for the follow action.
   * @param {number} story.maxFollows - The maximum number of Facebook follows allowed for the story.
   * @returns {void}
   */
  handleLikeFollow(story) {
    if (this.validateFollowRequest(story)) {
      this.initiateFollowSequence(story.maxFollows);
    }
  }

  /**
   * Cleanup method to destroy the controller.
   * It checks for view and model and calls their cleanup methods if available,
   * and disconnects the communication port.
   */
  destroy() {
    if (this.view && typeof this.view.destroy === "function") {
      this.view.destroy();
    }
    if (this.model && typeof this.model.removeAllListeners === "function") {
      this.model.removeAllListeners();
    }
    if (this.comPort && typeof this.comPort.disconnect === "function") {
      this.comPort.disconnect();
    }
    console.log("BaseController destroyed");
  }
}

module.exports = BaseController;
