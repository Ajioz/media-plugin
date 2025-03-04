const BaseView = require("./BaseView");

class PinterestView extends BaseView {
  constructor(controller) {
    super(controller);
    this._config = {
      baseDomain: "pinterest.com",
      selectors: {
        resultItem: ".result-item",
        pinLink: "a[href*='/pin/']",
        followButton: "button[data-test-id='follow-button']",
        engagementIcon: "[data-test-id='engagement-icon']",
        creatorProfile: "[data-test-id='creator-profile-name']",
        pinImage: "img[data-test-id='pin-image']",
        username: "[data-test-id='profile-name']",
      },
    };
  }

  extractItemData(item) {
    return {
      url: super._buildProfileUrl(item, this._config.baseDomain),
      timestamp: new Date(),
      elementType: item.classList.contains("result-item") ? "result" : "pin",
    };
  }

  extractProfileData() {
    const element = document.querySelector(
      this._config.selectors.creatorProfile
    );
    return super._extractProfileData(element, {
      baseDomain: this._config.baseDomain,
      usernameSelector: this._config.selectors.username,
      imageSelector: this._config.selectors.pinImage,
    });
  }

  highlightProfile(profileData) {
    const elements = document.querySelectorAll(
      this._config.selectors.creatorProfile
    );
    elements.forEach((el) => {
      if (el.textContent === profileData.username) {
        super._highlightElement(el, "border: 2px solid #e60023", 2000);
      }
    });
  }

  highlightPin(pinData) {
    const pin = document.querySelector(`a[href*='${pinData.url}']`);
    if (pin) {
      super._highlightElement(pin, "outline: 2px solid #e60023", 2000);
    }
  }

  // Pinterest-specific methods
  findResultItems() {
    return Array.from(
      document.querySelectorAll(this._config.selectors.resultItem)
    );
  }

  clickFollowButton() {
    const followButton = document.querySelector(
      this._config.selectors.followButton
    );
    if (followButton && !followButton.textContent.includes("Following")) {
      followButton.click();
      super._highlightElement(followButton, "background-color: #e60023", 1000);
    }
  }

  clickEngagementIcons() {
    document
      .querySelectorAll(this._config.selectors.engagementIcon)
      .forEach((icon) => {
        icon.click();
        super._highlightElement(icon, "transform: scale(1.2)", 500);
      });
  }

  // Cleanup uses base implementation
  destroy() {
    super.destroy();
  }
}

module.exports = PinterestView;
