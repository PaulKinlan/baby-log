import Controller from "./lib/controller.js";
import Feed from '../models/feed.js';
import FeedView from '../views/feed.js';

export default class FeedController extends Controller {
  static get route() {
    return '/feeds';
  }

  render(url) {
    // Get the Data.
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.render();
  }
}