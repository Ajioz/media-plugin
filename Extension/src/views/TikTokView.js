const BaseView = require("./BaseView");

class TikTokView extends BaseView {
  constructor(controller) {
    super(controller);
    this._config = {
      baseDomain: "tiktok.com",
      selectors: {
        videoItem: '[data-e2e="video-item"]',
        userAvatar: '[data-e2e="user-avatar"] img',
        followButton: '[data-e2e="follow-button"]',
        likeButton: '[data-e2e="like-button"]',
        username: '[data-e2e="user-unique-id"]',
      },
    };
  }

  findVideoItems() {
    return Array.from(
      document.querySelectorAll(this._config.selectors.videoItem)
    );
  }

  extractVideoData(item) {
    return {
      url: super._buildProfileUrl(item, this._config.baseDomain),
      timestamp: new Date(),
      elementType: "video",
    };
  }

  extractProfileData() {
    const element = document.querySelector(this._config.selectors.username);
    return super._extractProfileData(element, {
      baseDomain: this._config.baseDomain,
      usernameSelector: this._config.selectors.username,
      imageSelector: this._config.selectors.userAvatar,
    });
  }

  clickFollowButton() {
    const followButton = document.querySelector(
      this._config.selectors.followButton
    );
    if (followButton && !followButton.textContent.includes("Following")) {
      followButton.click();
      super._highlightElement(followButton, "transform: scale(1.1)", 500);
    }
  }

  clickLikeButtons() {
    document
      .querySelectorAll(this._config.selectors.likeButton)
      .forEach((btn) => {
        btn.click();
        super._highlightElement(btn, "color: #ff004f", 500);
      });
  }

  highlightVideoElement(url) {
    const element = document.querySelector(`[href='${url}']`);
    if (element) {
      super._highlightElement(element, "outline: 2px solid #ff004f", 2000);
    }
  }

  // Cleanup uses base implementation
  destroy() {
    super.destroy();
  }
}

module.exports = TikTokView;
