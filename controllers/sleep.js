import { DurationController } from "./duration.js";

export class SleepController extends DurationController {
  static get route() {
    return "/sleeps";
  }

  static get type() {
    return "sleep";
  }
}
