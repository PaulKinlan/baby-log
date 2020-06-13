import { Controller } from './lib/controller.js';
import { Feed as Model } from '../models/feed.js';
import { NotFoundException } from './exception/notfound.js';
import { getFormData } from './helpers/formData.js';


export class FeedController extends Controller {
  static get route() {
    return '/feeds';
  }

  async create(url, request) {
    // Show the create an entry UI.
    return this.view.create(new Model);
  }

  async post(url, request) {

    const formData = await getFormData(request);
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const feed = new Model({ startTime, endTime });

    feed.put();

    return this.redirect(FeedController.route);
  }

  async edit(url, id) {
    // Get the Data.
    const feed = await Model.get(parseInt(id, 10));

    if (!!feed == false) throw new NotFoundException(`Feed ${id} not found`);;
    
    return this.view.edit(feed);
  }

  async put(url, id, request) {
    // Get the Data.
    const feed = await Model.get(parseInt(id, 10));

    if (!!feed == false) throw new NotFoundException(`Feed ${id} not found`);

    const formData = await getFormData(request);

    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');

    feed.startTime = new Date(startTime);
    feed.endTime = new Date(endTime);

    feed.put();

    return this.redirect(FeedController.route);
  }

  async get(url, id) {
    // Get the Data.
    const feed = await Model.get(parseInt(id, 10));

    if (!!feed == false) throw new NotFoundException(`Feed ${id} not found`);

    return this.view.get(feed);
  }

  async getAll(url) {
    // Get the Data.....
    const feeds = await Model.getAll('type,startTime', { filter: ['BETWEEN', ['feed', new Date(0)], ['feed', new Date(99999999999999)]], order: Model.DESCENDING }) || [];

    // Get the View.
    return this.view.getAll(feeds);
  }

  async del(url, id) {
    // Get the Data.
    const model = await Model.get(parseInt(id, 10));

    if (!!model == false) throw new NotFoundException(`Feed ${id} not found`);

    await model.delete();
    return this.redirect(FeedController.route);
  }
}