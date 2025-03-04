import BaseModel from "./BaseModel";

class LinkedInModel extends BaseModel {
  static LINKEDIN_DEFAULTS = {
    maxConnections: 100,
    scanLimit: 50,
    connectionDelay: { min: 2000, max: 5000 },
  };

  constructor(settings = {}) {
    super("linkedin", {
      ...BaseModel.DEFAULT_SETTINGS,
      ...LinkedInModel.LINKEDIN_DEFAULTS,
      ...settings,
    });

    // LinkedIn-specific state
    this.connections = [];
    this.scannedProfiles = [];
    this.pendingInvites = [];
    this.profileData = new Map();
  }

  // LinkedIn-specific methods
  addConnection(profile) {
    if (this.connections.length >= this.settings.maxConnections) {
      this.handleError("ConnectionLimit", "Maximum connections reached");
      return false;
    }

    if (this.connections.some((c) => c.id === profile.id)) {
      this.handleError("DuplicateConnection", "Already connected");
      return false;
    }

    this.connections.push(profile);
    this.recordAction("connect", profile);
    this.emit("connectionAdded", profile);
    return true;
  }

  recordProfileScan(profileData) {
    if (this.scannedProfiles.length >= this.settings.scanLimit) {
      this.handleError("ScanLimit", "Daily scan limit reached");
      return false;
    }

    this.scannedProfiles.push(profileData);
    this.profileData.set(profileData.id, profileData);
    this.recordAction("scan", profileData);
    this.emit("profileScanned", profileData);
    return true;
  }

  // Override base methods with LinkedIn-specific behavior
  recordAction(action, data) {
    const linkedinActions = {
      connect: `Connected with ${data.name}`,
      scan: `Scanned profile: ${data.name}`,
    };

    console.log(`[LinkedIn] ${linkedinActions[action] || action}`);
    super.recordAction(action, data);
  }

  getStats() {
    const baseStats = super.getStats();
    return {
      ...baseStats,
      connections: this.connections.length,
      scannedProfiles: this.scannedProfiles.length,
      pendingInvites: this.pendingInvites.length,
    };
  }

  // LinkedIn-specific error handling
  handleError(errorType, details) {
    const linkedinErrors = {
      ConnectionLimit: "warning",
      DuplicateConnection: "warning",
      ScanLimit: "info",
    };

    const level = linkedinErrors[errorType] || "error";
    console[level](`LinkedInError [${errorType}]: ${details}`);
    super.handleError(errorType, details);
  }
}

module.exports = LinkedInModel;
