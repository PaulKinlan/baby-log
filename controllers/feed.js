import { DurationController } from "./duration.js";

export class FeedController extends DurationController {
  static get route() {
    return "/feeds";
  }

  static get type() {
    return "feed";
  }
}
