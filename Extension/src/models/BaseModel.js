class BaseModel {
  constructor() {
    // A generic data store. Subclasses can expand or override this.
    this.data = {};
  }

  /**
   * Fetch data from a source.
   * Subclasses should override this method if they have specific data fetching needs.
   */
  fetchData() {
    console.log("BaseModel: Fetching data...");
    // Placeholder: Implement generic or dummy fetch logic.
  }

  /**
   * Save or update data.
   * Override this method in subclasses for specific saving mechanisms.
   */
  saveData() {
    console.log("BaseModel: Saving data...");
    // Placeholder: Implement saving logic.
  }

  /**
   * Update internal data.
   * @param {Object} newData - Key/value pairs to update in the model.
   */
  setData(newData) {
    this.data = { ...this.data, ...newData };
  }

  /**
   * Retrieve the current data.
   * @returns {Object} The stored data.
   */
  getData() {
    return this.data;
  }
}

export default BaseModel;
