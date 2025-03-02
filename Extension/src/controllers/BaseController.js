class BaseController {
  /**
   * @param {Object} model - An instance of a model (data layer).
   * @param {Object} view - An instance of a view (UI layer).
   */
  constructor(model, view) {
    this.model = model;
    this.view = view;
  }

  /**
   * Initializes the controller by:
   * - Fetching initial data via the model.
   * - Rendering the view.
   * - Binding event listeners in the view.
   */
  init() {
    if (this.model && typeof this.model.fetchData === "function") {
      this.model.fetchData();
    }
    if (this.view && typeof this.view.render === "function") {
      this.view.render();
    }
    if (this.view && typeof this.view.bindEvents === "function") {
      this.view.bindEvents();
    }
  }

  /**
   * A generic action handler.
   * Subclasses can override or extend this to process specific actions.
   *
   * @param {String} action - Identifier for the action to handle.
   * @param {Object} payload - Additional data for the action.
   */
  handleAction(action, payload) {
    console.log(
      `BaseController: Handling action "${action}" with payload:`,
      payload
    );
  }
}

export default BaseController;
