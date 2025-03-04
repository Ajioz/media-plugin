const BaseController = require("./BaseController.js");
const LinkedInModel = require("../models/LinkedInModel.js");
const LinkedInView = require("../views/LinkedInView.js");
const { randomDelay } = require("../utils/helpers.js");

class LinkedInController extends BaseController {
  constructor() {
    super("linkedin");
    this.model = new LinkedInModel();
    this.view = new LinkedInView(this);
    this.actionDelay = { min: 3000, max: 7000 };
  }

  //  Creates comPort and sets up Initialization
  setup() {
    super.setup();
    this.view.render();
    this.connectModel();
    this.isActive = true;
    this.log("LinkedIn controller initialized");
  }

  connectModel() {
    super.setupModelListeners();
  }

  onMessageReceive(msg) {
    super.onMessageReceive(msg);
    try {
      switch (msg.Tag) {
        case "UpdateLinkedIn":
          this.handleUpdate(msg.story);
          break;
        case "LikeFollow":
          this.handleScanRequest(msg.story);
          break;
        default:
          this.handleUnknownMessage(msg);
      }
    } catch (error) {
      this.handleError("MessageProcessing", error.message);
    }
  }

  handleUpdate(story) {
    this.model.updateScanConfig(story);
    this.view.status(`Scan depth: ${story.scanDepth}`);
  }

  async handleScanRequest(config) {
    if (this.validateScanRequest(config)) {
      await this.initiateProfileScan(config.scanDepth);
    }
  }

  validateScanRequest(config) {
    return (
      config.scanDepth > 0 &&
      this.model.remainingScans() > 0 &&
      !this.model.isScanning()
    );
  }

  async initiateProfileScan(iterations) {
    try {
      for (let i = 0; i < iterations; i++) {
        await this.view.scroll();
        await this.processProfile();
        await randomDelay();
      }
    } catch (error) {
      this.handleError("ScanSequence", error.message);
    }
  }

  async processProfile() {
    const profileLinks = this.view.findProfileLinks();

    for (const link of profileLinks) {
      if (!this.model.isProcessed(link.href)) {
        await this.view.clickElement(link);
        await this.view.clickElement(this.view.selectors.seeMoreButton);

        const contactData = this.view.extractContactInfo();
        this.model.storeContactData(contactData);

        await this.view.navigateBack(2);
        break;
      }
    }
  }

  // Calls the BaseController.destroy() method
  destroy() {
    this.view.destroy();
    this.model.removeAllListeners();
    super.destroy();
  }
}

module.exports = LinkedInController;
