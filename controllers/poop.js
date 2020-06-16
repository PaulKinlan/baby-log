import { BaseController } from "./base.js";

export class PoopController extends BaseController {
  static get route() {
    return "/poops";
  }

  static get type() {
    return "poop";
  }
}
