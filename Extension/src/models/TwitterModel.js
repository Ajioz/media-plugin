import BaseModel from "./BaseModel.js";

class TwitterModel extends BaseModel {
  constructor() {
    super();
    this.currentUser = null;
    this.sharedData = null;
    this.lastUsername = "";
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  setSharedData(data) {
    this.sharedData = data;
  }
}

export default TwitterModel;
