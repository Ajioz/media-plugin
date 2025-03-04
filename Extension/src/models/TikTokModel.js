// TikTokModel.js
import BaseModel from "./BaseModel";

class TikTokModel extends BaseModel {
  static TIKTOK_DEFAULTS = {
    maxFollows: 300,
    maxLikes: 1000,
    scanDepth: 5,
    timing: { min: 2000, max: 5000 },
  };

  constructor(settings = {}) {
    super("tiktok", {
      ...TikTokModel.TIKTOK_DEFAULTS,
      ...settings,
    });

    this.followedAccounts = [];
    this.likedVideos = [];
    this.scrapedTags = [];
    this.processedUrls = new Set();
  }

  handleMessage(msg) {
    switch (msg.Tag) {
      case "UpdateTikTok":
        this.handleContentUpdate(msg.story);
        break;
      case "LikeFollow":
        this.handleActionRequest(msg.story);
        break;
      default:
        this.handleError("UnknownMessage", `Received unknown tag: ${msg.Tag}`);
    }
  }

  handleContentUpdate(story) {
    this.emit("scanInitiated", {
      depth: this.settings.scanDepth,
      target: story.target,
    });
  }

  handleActionRequest(story) {
    const actions = [];

    if (story.StartTikTokFollow) {
      actions.push(this.processFollowAction(story));
    }

    if (story.StartTikTokLike) {
      actions.push(this.processLikeAction(story));
    }

    this.emit("actionsProcessed", actions.filter(Boolean));
  }

  processFollowAction(story) {
    if (this.followedAccounts.length >= this.settings.maxFollows) {
      this.handleError("FollowLimit", "Max follows reached");
      return null;
    }

    const profileData = this.extractProfileData(story);
    if (!profileData || this.processedUrls.has(profileData.url)) return null;

    this.followedAccounts.push(profileData);
    this.processedUrls.add(profileData.url);
    return {
      type: "follow",
      data: profileData,
      messageTag: "DoneTikTokFollow",
    };
  }

  processLikeAction(story) {
    if (this.likedVideos.length >= this.settings.maxLikes) {
      this.handleError("LikeLimit", "Max likes reached");
      return null;
    }

    const videoData = this.extractVideoData(story);
    if (!videoData || this.processedUrls.has(videoData.url)) return null;

    this.likedVideos.push(videoData);
    this.processedUrls.add(videoData.url);
    return {
      type: "like",
      data: videoData,
      messageTag: "DoneTikTokLike",
    };
  }

  extractProfileData(story) {
    return {
      username: story.username || "unknown",
      url: story.url,
      avatar: story.img || "default-avatar.jpg",
      timestamp: new Date(),
    };
  }

  extractVideoData(story) {
    return {
      videoId: story.videoId || Date.now().toString(),
      url: story.url,
      author: story.username,
      timestamp: new Date(),
    };
  }

  getStats() {
    return {
      ...super.getStats(),
      followed: this.followedAccounts.length,
      liked: this.likedVideos.length,
      remainingFollows: this.settings.maxFollows - this.followedAccounts.length,
    };
  }
}

module.exports = TikTokModel;
