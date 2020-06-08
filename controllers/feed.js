import Controller from './lib/controller.js';
import FeedModel from '../models/feed.js';
import FeedView from '../views/feed.js';
import Feed from "../models/feed.js";
import NotFoundException from './exception/notfound.js';

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
    const feed = new Feed({ startTime, endTime });

    feed.put();

    // Get the View.
    const feedView = new FeedView(feed);

    return feedView.post(feed);
  }

  async edit(url, id) {
    // Get the Data.
    const feed = await FeedModel.get(parseInt(id, 10));

    if (!!feed == false) throw new NotFoundException(`Feed ${id} not found`);;
    // Get the View.
    const feedView = new FeedView();

    return feedView.edit(feed);
  }

  async put(url, id, request) {
    // Get the Data.
    const feed = await FeedModel.get(parseInt(id, 10));

    if (!!feed == false) throw new NotFoundException(`Feed ${id} not found`);
    
    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    
    feed.startTime = startTime;
    feed.endTime = endTime;

    feed.put();

    // Get the View.
    const feedView = new FeedView(feed);

    return feedView.put(feed);
  }

  async get(url, id) {
    // Get the Data.
    const feed = await FeedModel.get(parseInt(id, 10));

    if (!!feed == false) throw new NotFoundException(`Feed ${id} not found`);

    // Get the View.
    const feedView = new FeedView();

    return feedView.get(feed);
  }

  async getAll(url) {
    // Get the Data.....
    const feeds = await FeedModel.getAll('type,startTime', { filter: ['BETWEEN', ['feed', new Date(0)], ['feed', new Date(9999999999999)]], order: FeedModel.DESCENDING }) || [];

    // Get the View.
    const feedView = new FeedView();

    return feedView.getAll(feeds);
  }
}