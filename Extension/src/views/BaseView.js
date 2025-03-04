class BaseView {
  constructor(controller) {
    if (!controller) {
      throw new Error("Controller is required");
    }
    this.controller = controller;
    this.logs = "";
    this.wrapperID = "social-media-container"; //

    // Bind instance methods to preserve context
    this.render = this.render.bind(this);
    this.status = this.status.bind(this);
    this.handleError = this.handleError.bind(this);
    this._eventListeners = [];
    this.containerEl = null;

    this.init();
  }

  init() {
    if (!document.getElementById(this.wrapperID)) {
      const container = document.createElement("div");
      container.id = this.wrapperID;
      container.style.cssText = `
              position: fixed;
              top: 10px;
              right: 10px;
              z-index: 10000;
              background: white;
              padding: 10px;
              border: 1px solid #ccc;
            `;
      document.body.appendChild(container);
      this.containerEl = container;
    }
  }

  // Abstract method: subclasses should override this to render their UI.
  render() {
    console.warn("render method should be implemented by subclass");
  }

  status(message) {
    const statusElement =
      document.getElementById(`${this.wrapperID}-status`) ||
      this.createStatus();
    statusElement.innerHTML = message;
  }

  createStatus() {
    const statusElement = document.createElement("div");
    statusElement.id = `${this.wrapperID}-status`;
    document.getElementById(this.wrapperID).appendChild(statusElement);
    return statusElement;
  }

  handleError(error) {
    const errorElement =
      document.getElementById(`${this.wrapperID}-error`) || this.createError();
    errorElement.innerHTML = `Error: ${error}`;
  }

  createError() {
    const errorElement = document.createElement("div");
    errorElement.id = `${this.wrapperID}-error`;
    errorElement.style.color = "red";
    document.getElementById(this.wrapperID).appendChild(errorElement);
    return errorElement;
  }

  log(message) {
    this.logs += `${message}<br>`;
    this.logMessages();
  }

  logMessages() {
    const logElement =
      document.getElementById(`${this.wrapperID}-logs`) || this.createLog();
    logElement.innerHTML = this.logs;
  }

  createLog() {
    const logElement = document.createElement("div");
    logElement.id = `${this.wrapperID}-logs`;
    document.getElementById(this.wrapperID).appendChild(logElement);
    return logElement;
  }

  // Generic URL builder for all social platforms
  _buildProfileUrl(element, baseDomain) {
    try {
      const href = element?.getAttribute("href") || "";
      return new URL(href, `https://${baseDomain}`).href;
    } catch (error) {
      this.handleError(`Invalid profile URL: ${error.message}`);
      return "";
    }
  }

  // Generic username extractor
  _getUsername(element, selector = "span") {
    return (
      element?.querySelector(selector)?.textContent?.trim() || "unknown_user"
    );
  }

  // Generic image URL extractor
  _getProfileImage(element, selector) {
    return element?.querySelector(selector)?.src || "";
  }

  // Event listener management for all views
  _addEventListener(target, type, listener) {
    target.addEventListener(type, listener);
    if (!this._eventListeners) this._eventListeners = [];
    this._eventListeners.push({ target, type, listener });
  }
  _removeAllEventListeners() {
    this._eventListeners?.forEach(({ target, type, listener }) => {
      target.removeEventListener(type, listener);
    });
    this._eventListeners = [];
  }

  _highlightElement(element, style, duration = 2000) {
    if (!element) return;
    const originalStyle = element.style.cssText;
    element.style.cssText += `;${style};transition: all 0.3s;`;
    setTimeout(() => {
      element.style.cssText = originalStyle;
    }, duration);
  }

  _extractProfileData(element, options = {}) {
    try {
      return {
        username: this._getUsername(element, options.usernameSelector),
        url: this._buildProfileUrl(element, options.baseDomain),
        img: this._getProfileImage(element, options.imageSelector),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.handleError(`Profile extraction failed: ${error.message}`);
      return null;
    }
  }

  // Common cleanup logic for all views
  destroy() {
    if (this.containerEl) {
      this.containerEl.remove();
      this.containerEl = null;
    }
    this._removeAllEventListeners();
    this.controller = null;
    console.log("[BaseView] Cleanup completed");
  }
}

module.exports = BaseView;
