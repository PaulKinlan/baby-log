import { Controller } from "../lib/controller.js";

// This will be a server only route;
export class StaticController extends Controller {
  static get route() {
    return ""; // Match everything.
  }

  constructor(paths) {
    super();
  }

  async get(url, id, request) {
    return caches.match(request).then((response) => {
      if (!!response) return response;
      return fetch(url);
    });
  }

  /*
    url: URL
  */
  async getAll(url, request) {
    return this.get(url, undefined, request);
  }
}
