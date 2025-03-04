const BaseView = require("./BaseView.js");

class LinkedInView extends BaseView {
  constructor(controller) {
    super(controller);
    this._selectors = {
      profileLink: 'a[data-control-name="search_srp_result"]',
      contactSection: "div.section-info",
      seeMoreButton: 'a[data-control-name="contact_see_more"]',
      resultContainer: "#linkedin-results-container",
    };
    this._observer = null;
    this._processedProfiles = new Set();
  }

  // Override base render method
  render() {
    super.render();
    this._createResultsContainer();
    this._setupMutationObserver();
    this.status("LinkedIn Extension Active");
  }

  _createResultsContainer() {
    const container = document.createElement("div");
    container.id = "linkedin-results-container";
    container.style.cssText = `
      background-color: white;
      opacity: 0.9;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      padding: 10px;
    `;
    this.containerEl.appendChild(container);
  }

  _setupMutationObserver() {
    this._observer = new MutationObserver((mutations) => {
      this._handleDOMChanges(mutations);
    });

    this._observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  _handleDOMChanges(mutations) {
    if (!this.controller) return;

    const newProfiles = this._findUnprocessedProfiles();
    newProfiles.forEach((profile) => {
      this._highlightProfile(profile);
      this.controller.handleProfileFound(profile);
    });
  }

  _findUnprocessedProfiles() {
    return Array.from(
      document.querySelectorAll(this._selectors.profileLink)
    ).filter((link) => !this._processedProfiles.has(link.href));
  }

  _highlightProfile(element) {
    element.classList.add("linkedin-highlight");
    setTimeout(() => {
      element.classList.remove("linkedin-highlight");
    }, 2000);
  }

  async processProfile(link, remaining) {
    if (!this.controller?.navigateToProfile) {
      this.handleError("Controller methods not available");
      return;
    }

    try {
      this._markProfileProcessing(link);
      await this.controller.navigateToProfile(link);

      const contactInfo = await this._extractContactDetails();
      this._displayContactInfo(contactInfo);

      await this.controller.returnToSearch();
      this._updateProgress(remaining);
    } catch (error) {
      this.handleError(`Profile processing failed: ${error.message}`);
    }
  }

  _markProfileProcessing(link) {
    this._processedProfiles.add(link.href);
    link.style.opacity = "0.5";
    this.log(`Processing: ${link.href}`);
  }

  async _extractContactDetails() {
    await this._expandContactSection();
    const section = document.querySelector(this._selectors.contactSection);

    return {
      email: this._findContactField(section, "Email"),
      phone: this._findContactField(section, "Phone"),
      linkedIn: this._findContactField(section, "LinkedIn"),
    };
  }

  _findContactField(section, label) {
    const element = section?.querySelector(`span:contains('${label}') + span`);
    return element?.textContent?.trim() || "Not available";
  }

  async _expandContactSection() {
    const seeMore = document.querySelector(this._selectors.seeMoreButton);
    if (!seeMore) return;

    try {
      seeMore.click();
      await this._waitForElement(".expanded-contact-section", 5000);
    } catch (error) {
      this.handleError("Failed to expand contact section");
    }
  }

  _displayContactInfo(info) {
    const container = document.querySelector(this._selectors.resultContainer);
    const entry = document.createElement("div");
    entry.className = "contact-entry";

    entry.innerHTML = `
      <h4>Contact Information</h4>
      <p>Email: ${this._sanitizeHTML(info.email)}</p>
      <p>Phone: ${this._sanitizeHTML(info.phone)}</p>
      <p>LinkedIn: ${this._sanitizeHTML(info.linkedIn)}</p>
    `;

    container.appendChild(entry);
  }

  _sanitizeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  _updateProgress(remaining) {
    this.status(`Remaining profiles: ${remaining}`);
    if (this.controller?.continueProcessing) {
      this.controller.continueProcessing(remaining);
    }
  }

  async _waitForElement(selector, timeout = 3000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      const check = () => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);

        if (Date.now() - start > timeout) {
          reject(new Error("Element timeout"));
        } else {
          setTimeout(check, 100);
        }
      };

      check();
    });
  }

  destroy() {
    if (this._observer) {
      this._observer.disconnect();
      this._observer = null;
    }
    this._processedProfiles.clear();
    super.destroy();
  }
}

module.exports = LinkedInView;
