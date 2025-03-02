import BaseController from "./BaseController";
import InstagramModel from "./InstagramModel";
import InstagramView from "./InstagramView";

class InstagramController extends BaseController {
  constructor() {
    super(new InstagramModel(), new InstagramView());
    this.initializeMessaging();
    this.actionQueue = [];
    this.isProcessing = false;
  }

  initializeMessaging() {
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === "startInstagramAction") {
        this.queueAction(message.action);
      }
    });
  }

  async handleAction(action, payload) {
    switch (action) {
      case "follow":
        await this.handleFollow(payload);
        break;
      case "like":
        await this.handleLike(payload);
        break;
      case "comment":
        await this.handleComment(payload);
        break;
      case "storyView":
        this.handleStoryView();
        break;
      case "postInteraction":
        this.handlePostInteraction(payload);
        break;
      default:
        super.handleAction(action, payload);
    }
    this.updateStats();
  }

  async handleFollow(userElement) {
    const followButton = userElement.querySelector("button:not([disabled])");
    if (followButton && !followButton.textContent.includes("Following")) {
      followButton.click();
      const userId = this.extractUserId(userElement);
      this.model.followedUsers.add(userId);
      await this.delay(1500);
    }
  }

  async handleLike(postElement) {
    const postInfo = this.model.extractPostInfo(postElement);
    if (!this.model.hasPerformedAction("liked", postInfo.id)) {
      const likeButton = postElement.querySelector('[aria-label="Like"]');
      if (likeButton) {
        likeButton.click();
        this.model.trackAction("liked", postInfo.id);
        await this.delay(1000);
      }
    }
  }

  async handleComment(postElement) {
    const postInfo = this.model.extractPostInfo(postElement);
    if (!this.model.hasPerformedAction("commented", postInfo.id)) {
      const commentButton = postElement.querySelector('[aria-label="Comment"]');
      if (commentButton) {
        commentButton.click();
        await this.delay(500);

        const textarea = document.querySelector(
          'textarea[aria-label="Add a comment"]'
        );
        if (textarea) {
          textarea.value = this.generateComment();
          textarea.dispatchEvent(new Event("input", { bubbles: true }));

          const postButton = document.querySelector('[aria-label="Post"]');
          if (postButton) {
            postButton.click();
            this.model.trackAction("commented", postInfo.id);
            await this.delay(1000);
          }
        }
      }
    }
  }

  handleStoryView() {
    const storyLikeButton = document.querySelector('[aria-label="Like"]');
    if (storyLikeButton) {
      storyLikeButton.click();
    }
  }

  updateStats() {
    this.view.updateStats({
      followed: this.model.followedUsers.size,
      liked: this.model.likedPosts.size,
      commented: this.model.commentedPosts.size,
    });
  }

  generateComment() {
    const comments = ["Great post! 👍", "Awesome! 😍", "Love this! ❤️"];
    return comments[Math.floor(Math.random() * comments.length)];
  }

  extractUserId(element) {
    const link = element.querySelector('a[href^="/"]');
    return link ? link.href.split("/").filter(Boolean).pop() : "";
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export default InstagramController;
