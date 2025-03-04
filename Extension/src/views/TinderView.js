const BaseView = require("./BaseView");

class TinderView extends BaseView {
  constructor(controller) {
    super(controller);
    this._config = {
      baseDomain: "tinder.com",
      selectors: {
        profileCard: '[data-testid="recommendation"]',
        likeButton: '[data-testid="gamepadLike"]',
        dislikeButton: '[data-testid="gamepadDislike"]',
        profileName: '[data-testid="name"]',
        profileAge: '[data-testid="age"]',
        profileImage: '[data-testid="avatarImage"]',
        bioSection: '[data-testid="bio"]',
        matchPopup: '[data-testid="match"]',
      },
    };
    this._observedProfiles = new Set();
  }

  render() {
    super.render();
    this._createTinderUI();
    this._setupMutationObserver();
  }

  _createTinderUI() {
    this.containerEl.innerHTML = `
      <div class="tinder-bot-ui">
        <h3>Tinder Automation Controller</h3>
        <div class="stats-container">
          <div class="stat-item">
            <span class="stat-label">Likes:</span>
            <span class="stat-value" id="tinder-like-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Dislikes:</span>
            <span class="stat-value" id="tinder-dislike-count">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Matches:</span>
            <span class="stat-value" id="tinder-match-count">0</span>
          </div>
        </div>
        <div class="activity-feed">
          <h4>Recent Actions</h4>
          <div id="tinder-action-log"></div>
        </div>
      </div>
    `;
  }

  _setupMutationObserver() {
    this._observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (
            node.nodeType === 1 &&
            node.matches(this._config.selectors.profileCard)
          ) {
            this._processNewProfile(node);
          }
        });
      });
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  _processNewProfile(profileElement) {
    if (!this._observedProfiles.has(profileElement)) {
      this._observedProfiles.add(profileElement);
      this._enhanceProfileUI(profileElement);
      this._attachProfileListeners(profileElement);
    }
  }

  _enhanceProfileUI(profileElement) {
    super._highlightElement(profileElement, "border: 2px solid #FE3C72", 1000);
  }

  _attachProfileListeners(profileElement) {
    this._addEventListener(profileElement, "click", () =>
      this._handleProfileSelect(profileElement)
    );
  }

  _handleProfileSelect(profileElement) {
    const profileData = this._extractProfileData(profileElement);
    this.controller.handleProfileSelection(profileData);
  }

  _extractProfileData(profileElement) {
    return {
      element: profileElement,
      name: super._getUsername(
        profileElement,
        this._config.selectors.profileName
      ),
      age: profileElement.querySelector(this._config.selectors.profileAge)
        ?.textContent,
      bio: profileElement.querySelector(this._config.selectors.bioSection)
        ?.textContent,
      images: Array.from(
        profileElement.querySelectorAll(this._config.selectors.profileImage)
      ).map((img) => img.src),
      timestamp: new Date().toISOString(),
    };
  }

  performSwipe(swipeType) {
    const button =
      swipeType === "like"
        ? document.querySelector(this._config.selectors.likeButton)
        : document.querySelector(this._config.selectors.dislikeButton);

    if (button) {
      button.click();
      this._animateSwipeFeedback(swipeType);
    }
  }

  _animateSwipeFeedback(swipeType) {
    const color = swipeType === "like" ? "#4CD964" : "#FF3B30";
    const currentProfile = document.querySelector(
      this._config.selectors.profileCard
    );
    if (currentProfile) {
      super._highlightElement(
        currentProfile,
        `border: 4px solid ${color}`,
        500
      );
    }
  }

  handleMatch() {
    const matchPopup = document.querySelector(
      this._config.selectors.matchPopup
    );
    if (matchPopup) {
      super._highlightElement(matchPopup, "transform: scale(1.1)", 1000);
      this.log("New match detected!");
    }
  }

  updateStats({ likes, dislikes, matches }) {
    const updateField = (id, value) => {
      const el = this.containerEl.querySelector(`#${id}`);
      if (el) el.textContent = value;
    };

    updateField("tinder-like-count", likes);
    updateField("tinder-dislike-count", dislikes);
    updateField("tinder-match-count", matches);
  }

  logAction(action) {
    const logEntry = document.createElement("div");
    logEntry.className = "action-entry";
    logEntry.innerHTML = `
      <div class="action-icon ${action.type}"></div>
      <div class="action-details">
        <div class="action-meta">
          <span class="action-type">${action.type}</span>
          <span class="action-time">${new Date().toLocaleTimeString()}</span>
        </div>
        ${action.name ? `<span class="action-user">${action.name}</span>` : ""}
        ${action.age ? `<span class="action-age">${action.age}</span>` : ""}
      </div>
      ${
        action.images?.length
          ? `<img src="${action.images[0]}" class="action-preview">`
          : ""
      }
    `;

    const logContainer = this.containerEl.querySelector("#tinder-action-log");
    if (logContainer) {
      logContainer.prepend(logEntry);
      if (logContainer.children.length > 10)
        logContainer.lastElementChild.remove();
    }
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    this._observedProfiles.clear();
    super.destroy();
  }
}

module.exports = TinderView;
