const BaseView = require("./BaseView");

class TwitterView extends BaseView {
  constructor(controller) {
    super(controller);
    this._config = {
      baseDomain: "twitter.com",
      selectors: {
        tweet: '[data-testid="tweet"]',
        likeButton: '[data-testid="like"]',
        retweetButton: '[data-testid="retweet"]',
        username: '[data-testid="User-Name"]',
        content: '[data-testid="tweetText"]',
      },
    };

    this._enhanceUI();
    this._setupEventListeners();
  }

  render() {
    super.render();
    this.containerEl.innerHTML = `
      <div class="twitter-ui">
        <h3>Twitter Bot Controller</h3>
        <div class="stats-container">
          <span class="stat">Likes: <em id="twitter-likes">0</em></span>
          <span class="stat">Retweets: <em id="twitter-retweets">0</em></span>
        </div>
        <div class="activity-log"></div>
      </div>
    `;
  }

  _enhanceUI() {
    this.containerEl.style.cssText += `
      width: 300px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;
  }

  _setupEventListeners() {
    this._addEventListener(document.body, "click", (e) => {
      const tweet = e.target.closest(this._config.selectors.tweet);
      if (!tweet) return;

      if (e.target.closest(this._config.selectors.likeButton)) {
        this._handleLikeAction(tweet);
      } else if (e.target.closest(this._config.selectors.retweetButton)) {
        this._handleRetweetAction(tweet);
      }
    });
  }

  _handleLikeAction(tweetElement) {
    const data = this._extractTweetData(tweetElement);
    this.controller.handleLike(data);
    this._animateInteraction(tweetElement, "like");
  }

  _handleRetweetAction(tweetElement) {
    const data = this._extractTweetData(tweetElement);
    this.controller.handleRetweet(data);
    this._animateInteraction(tweetElement, "retweet");
  }

  _extractTweetData(element) {
    return {
      element,
      username: super._getUsername(element, this._config.selectors.username),
      content: element.querySelector(this._config.selectors.content)
        ?.textContent,
      url: super._buildProfileUrl(element, this._config.baseDomain),
    };
  }

  _animateInteraction(element, actionType) {
    const color = actionType === "like" ? "#e0245e" : "#17bf63";
    super._highlightElement(
      element,
      `transform: scale(1.02); box-shadow: 0 2px 8px ${color}`,
      500
    );
  }

  updateStats({ likes, retweets }) {
    const updateField = (id, value) => {
      const el = this.containerEl.querySelector(`#${id}`);
      if (el) el.textContent = value;
    };

    updateField("twitter-likes", likes);
    updateField("twitter-retweets", retweets);
  }

  addToLog(action) {
    const logEntry = document.createElement("div");
    logEntry.className = "log-entry";
    logEntry.innerHTML = `
      <span class="action-type ${action.type}">${action.type}</span>
      <span class="username">@${action.username}</span>
      <time>${new Date().toLocaleTimeString()}</time>
    `;

    const logContainer = this.containerEl.querySelector(".activity-log");
    if (logContainer) logContainer.prepend(logEntry);
  }

  destroy() {
    super.destroy();
  }
}

module.exports = TwitterView;
