import BaseModel from "./BaseModel.js";

class LinkedInModel extends BaseModel {
  constructor() {
    super();
    this.currentUser = null;
    this.sharedData = null;
    this.completedProfiles = [];
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  setSharedData(data) {
    this.sharedData = data;
  }

  addCompletedProfile(profileUrl) {
    this.completedProfiles.push(profileUrl);
  }

  isProfileCompleted(profileUrl) {
    return this.completedProfiles.includes(profileUrl);
  }
}

export default LinkedInModel;
