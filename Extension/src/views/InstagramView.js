const BaseView = require("./BaseView.js");

class InstagramView extends BaseView {
  constructor(controller) {
    super(controller);
    this._selectors = {
      userTag: 'div[role="link"]', // More reliable Instagram selector
      profileLink: 'a[href^="/"]', // Instagram-specific profile links
      storyButton: '[aria-label="Story"]', // Better accessibility-based selector
      followButton: 'div[role="button"]:has(div:contains("Follow"))', // Instagram 2023 pattern
      likeButton: '[aria-label="Like"]', // Accessibility-first selector
    };
    this._observer = null;
    this._eventListeners = [];
    this._highlightTimeout = null;
  }

  render() {
    super.render();
    this._createUIElements();
    this._setupMutationObserver();
    this._setupEventListeners();
    this.status("Instagram Extension Active");
  }

  _createUIElements() {
    const panel = document.createElement("div");
    panel.className = "ig-automation-panel";
    panel.innerHTML = `
      <h3>Instagram Automation Controller</h3>
      <div class="stats-container">
        <div class="stat-item processed">Processed: 0</div>
        <div class="stat-item likes">Likes: 0</div>
        <div class="stat-item follows">Follows: 0</div>
      </div>
      <div class="results-pane"></div>
    `;
    this.containerEl.appendChild(panel);
  }

  _setupMutationObserver() {
    this._observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            this._handleNewElements(node);
          }
        });
      });
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributeFilter: ["href"],
    });
  }

  _handleNewElements(node) {
    const profiles = node.querySelectorAll(this._selectors.profileLink);
    profiles.forEach((profile) => {
      if (!profile.dataset.igProcessed) {
        this._highlightProfile(profile);
      }
    });
  }

  _setupEventListeners() {
    const clickHandler = (e) => {
      const profile = e.target.closest(this._selectors.profileLink);
      const story = e.target.closest(this._selectors.storyButton);

      if (profile) this.controller?.handleProfileClick(profile);
      if (story) this.controller?.handleStoryView(story);
    };

    document.addEventListener("click", clickHandler);
    this._eventListeners.push({ type: "click", handler: clickHandler });
  }

  _highlightProfile(element) {
    element.classList.add("ig-highlight");
    this._highlightTimeout = setTimeout(() => {
      element.classList.remove("ig-highlight");
    }, 2000);
  }

  markProcessed(element) {
    element.dataset.igProcessed = "true";
    element.style.opacity = "0.5";
    this.log(`Processed profile: ${element.href}`);
  }

  updateStats({ processed, likes, follows }) {
    const updateField = (selector, text) => {
      const el = this.containerEl.querySelector(selector);
      if (el) el.textContent = text;
    };

    updateField(".processed", `Processed: ${processed}`);
    updateField(".likes", `Likes: ${likes}`);
    updateField(".follows", `Follows: ${follows}`);
  }

  showResults(content) {
    const sanitized = this._sanitizeHTML(content);
    const container = this.containerEl.querySelector(".results-pane");
    if (container) {
      container.insertAdjacentHTML("afterbegin", sanitized);
    }
  }

  _sanitizeHTML(html) {
    const div = document.createElement("div");
    div.textContent = html;
    return div.innerHTML;
  }

  destroy() {
    // Cleanup observers
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }

    // Remove event listeners
    this._eventListeners.forEach(({ type, handler }) => {
      document.removeEventListener(type, handler);
    });
    this._eventListeners = [];

    // Clear timeouts
    if (this._highlightTimeout) {
      clearTimeout(this._highlightTimeout);
    }

    super.destroy();
  }
}

module.exports = InstagramView;
