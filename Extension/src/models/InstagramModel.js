import BaseModel from "./BaseModel";

class InstagramModel extends BaseModel {
  constructor() {
    super();
    this.followedUsers = new Set();
    this.likedPosts = new Set();
    this.commentedPosts = new Set();
  }

  extractProfileInfo() {
    const usernameElement = document.querySelector("header section h2");
    return {
      username: usernameElement?.innerText || "",
      followers: this.extractStat("followers"),
      following: this.extractStat("following"),
      posts: this.extractStat("posts"),
    };
  }

  extractStat(type) {
    const statMap = {
      followers: "followers",
      following: "following",
      posts: "posts",
    };
    const element = document.querySelector(`a[href*="${statMap[type]}"] span`);
    return element
      ? parseInt(element.title || element.innerText.replace(/,/g, ""))
      : 0;
  }

  extractPostInfo(element) {
    return {
      id: element.closest("article")?.dataset?.id || "",
      shortcode:
        element
          .closest("article")
          ?.querySelector('a[href*="/p/"]')
          ?.href.split("/p/")[1] || "",
      caption: element.querySelector("img")?.alt || "",
      isVideo: !!element.querySelector("video"),
    };
  }

  trackAction(type, id) {
    this[`${type}Posts`].add(id);
  }

  hasPerformedAction(type, id) {
    return this[`${type}Posts`].has(id);
  }
}

export default InstagramModel;
