const BaseView = require("./BaseView.js");

class FacebookView extends BaseView {
  constructor(controller) {
    super(controller);
    this._config = {
      baseDomain: "facebook.com",
      selectors: {
        profileImage: '[data-testid="profile-image"]',
        addFriendButton: '[data-testid="friend-request-button"]',
        profileLink: 'a[role="link"][data-testid="profile-link"]',
        username: "span", // Facebook-specific username selector
      },
    };
    this._activeLiveUpdates = false;
  }

  render() {
    this.status("Facebook Extension Active");
    this.log("View initialized");
    this._setupLiveUpdates();
  }

  async scrollToBottom() {
    try {
      window.scrollTo(0, document.body.scrollHeight);
      this.log("Scrolled to page bottom");
      return true;
    } catch (error) {
      this.handleError(`Scroll failed: ${error.message}`);
      return false;
    }
  }

  findAddFriendButtons() {
    try {
      const buttons = Array.from(
        document.querySelectorAll(this._config.selectors.addFriendButton)
      );
      this.log(`Found ${buttons.length} Add Friend buttons`);
      return buttons;
    } catch (error) {
      this.handleError(`Element search failed: ${error.message}`);
      return [];
    }
  }

  async clickAddFriend(buttonElement) {
    try {
      buttonElement.click();
      this.log("Clicked Add Friend button");

      const profileData = await new Promise((resolve) => {
        setTimeout(() => {
          resolve(this._extractProfileData(buttonElement));
        }, 500);
      });

      if (profileData && this.controller?.handleProfileAction) {
        this.controller.handleProfileAction(profileData);
      }

      return true;
    } catch (error) {
      this.handleError(`Click failed: ${error.message}`);
      return false;
    }
  }

  destroy() {
    console.log("Cleaning up Facebook view");
    this._cleanupProfilePreview();
    this._stopLiveUpdates();
    super.destroy(); // Now handles event listeners via base class
  }

  // Private methods
  _setupLiveUpdates() {
    this._activeLiveUpdates = true;
    // Implementation would use base class _addEventListener
    this._addEventListener(window, "scroll", this._handleScroll.bind(this));
  }

  _stopLiveUpdates() {
    this._activeLiveUpdates = false;
  }

  _cleanupProfilePreview() {
    const preview = document.getElementById("fb-profile-preview");
    preview?.remove();
  }

  _extractProfileData(buttonElement) {
    try {
      const parentNode = buttonElement.closest(
        this._config.selectors.profileLink
      );
      if (!parentNode) throw new Error("Profile parent element not found");

      // Use base class implementations with Facebook-specific config
      return {
        url: super._buildProfileUrl(parentNode, this._config.baseDomain),
        username: super._getUsername(
          parentNode,
          this._config.selectors.username
        ),
        img: super._getProfileImage(
          parentNode,
          this._config.selectors.profileImage
        ),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(`Data extraction failed: ${error.message}`);
      return null;
    }
  }

  // Removed redundant methods now in base:
  // _getProfileUrl(), _getUsername(), _getProfileImage()
  // _addEventListener(), _removeAllEventListeners()
}

module.exports = FacebookView;
