import Controller from "./lib/controller.js";
import FeedModel from '../models/feed.js';
import FeedView from '../views/feed.js';

export default class FeedController extends Controller {
  static get route() {
    return '/feeds';
  }

  async create(url, request) {
    // Get the Data.
    const feedView = new FeedView();

    // Save the data.

    return feedView.create(new FeedModel);
  }

  async edit(url) {
    // Get the Data.
    const feed = FeedModel.getAll('startTime', FeedModel.DESCENDING);
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.edit(feed);
  }

  async get(url) {
    // Get the Data.
    const feed = FeedModel.getAll('startTime', FeedModel.DESCENDING);
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.get(feed);
  }

  async getAll(url) {
    // Get the Data.
    const feeds = await FeedModel.getAll('startTime', FeedModel.DESCENDING) || [];
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.getAll(feeds);
  }
}