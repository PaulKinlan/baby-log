import Controller from "../lib/controller.js";

// This will be a server only route;
export default class StaticController extends Controller {

  static get route() {
    return ''; // Match everything.
  }

  constructor(paths) {
    super();
  }

  async get(url, id, request) {
    return caches.match(request);
  }

  /*
    url: URL
  */
  async getAll(url, request) {
    return this.get(url, undefined, request);
  }
}