import Controller from "./lib/controller.js";
import FeedModel from '../models/feed.js';
import FeedView from '../views/feed.js';
import Feed from "../models/feed.js";

export default class FeedController extends Controller {
  static get route() {
    return '/feeds';
  }

  async create(url, request) {
    // Show the create an entry UI.
    const feedView = new FeedView();
    return feedView.create(new FeedModel);
  }

  async post(url, request) {

    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const feed = new Feed({startTime, endTime});
    
    feed.put();
  
    // Get the View.
    const feedView = new FeedView(feed);

    return feedView.post(feed);
  }

  async edit(url) {
    // Get the Data.
    const feed = FeedModel.getAll('_startTime', FeedModel.DESCENDING);
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.edit(feed);
  }

  async get(url) {
    // Get the Data.
    const feed = FeedModel.get('_startTime', FeedModel.DESCENDING);
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.get(feed);
  }

  async getAll(url) {
    // Get the Data.
    const feeds = await FeedModel.getAll('_type,_startTime', {filter: ['BETWEEN', ['feed', '0'], ['feed', '9']], order:FeedModel.DESCENDING}) || [];
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.getAll(feeds);
  }
}