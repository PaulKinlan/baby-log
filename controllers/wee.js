import { BaseController } from "./base.js";

export class WeeController extends BaseController {
  static get route() {
    return "/wees";
  }

  static get type() {
    return "wee";
  }
}
