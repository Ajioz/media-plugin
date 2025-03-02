import BaseView from "./BaseView";

class InstagramView extends BaseView {
  constructor() {
    super();
    this.injectControlPanel();
  }

  injectControlPanel() {
    const existingPanel = document.getElementById("ig-control-panel");
    if (!existingPanel) {
      const panel = document.createElement("div");
      panel.id = "ig-control-panel";
      panel.style.position = "fixed";
      panel.style.top = "20px";
      panel.style.right = "20px";
      panel.style.zIndex = "10000";
      panel.style.background = "white";
      panel.style.padding = "10px";
      panel.style.borderRadius = "5px";
      panel.innerHTML = `
        <h3 style="margin:0">Instagram Bot</h3>
        <div id="ig-stats"></div>
      `;
      document.body.appendChild(panel);
    }
  }

  updateStats(stats) {
    const statsElement = document.getElementById("ig-stats");
    if (statsElement) {
      statsElement.innerHTML = `
        <p>Followed: ${stats.followed}</p>
        <p>Liked: ${stats.liked}</p>
        <p>Commented: ${stats.commented}</p>
      `;
    }
  }

  bindPostInteractions() {
    document.addEventListener("click", (event) => {
      const postElement = event.target.closest("article");
      if (postElement) {
        this.controller.handleAction("postInteraction", postElement);
      }
    });
  }

  bindStoryInteractions() {
    document.addEventListener("click", (event) => {
      if (event.target.closest('[aria-label="Story"]')) {
        this.controller.handleAction("storyView");
      }
    });
  }
}

export default InstagramView;
