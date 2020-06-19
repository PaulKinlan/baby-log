import { Model } from "./lib/model.js";

export class Log extends Model {
  get hasFinished() {
    return !!this.endTime;
  }

  get duration() {
    let end = this.endTime;
    if (!!end === false) {
      end = new Date();
    }
    return end - this.startTime;
  }

  constructor(
    { id, endTime, startTime, type, notes, isDuration = false },
    key
  ) {
    super(key);

    if (!!id) {
      this.id = id;
    }

    if (endTime) {
      this.endTime = new Date(endTime);
    }

    if (startTime) {
      this.startTime = new Date(startTime);
    }

    this.isDuration = isDuration;
    this.notes = notes;
    this.type = type;
  }

  static get storeName() {
    return "Log";
  }
}
