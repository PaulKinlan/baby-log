import { Controller } from './lib/controller.js';
import { Sleep as Model } from '../models/sleep.js';
import { NotFoundException } from './exception/notfound.js';
import { getFormData } from './helpers/formData.js';


export class SleepController extends Controller {
  static get route() {
    return '/sleeps';
  }

  async create(url, request) {
    // Show the create an entry UI.
    return this.view.create(new Model);
  }

  async post(url, request) {

    const formData = await getFormData(request);

    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const sleep = new Model({ startTime, endTime });

    sleep.put();

    return this.redirect(SleepController.route);
  }

  async edit(url, id) {
    // Get the Data.
    const sleep = await Model.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);;
    
    return this.view.edit(sleep);
  }

  async put(url, id, request) {
    // Get the Data.
    const sleep = await Model.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);

    const formData = await getFormData(request);

    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');

    sleep.startTime = new Date(startTime);
    sleep.endTime = new Date(endTime);
    sleep.put();

    return this.redirect(SleepController.route);
  }

  async get(url, id) {
    // Get the Data.
    const sleep = await Model.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);

    return this.view.get(sleep);
  }

  async getAll(url) {
    // Get the Data.....
    const sleeps = await Model.getAll('type,startTime', { filter: ['BETWEEN', ['sleep', new Date(0)], ['sleep', new Date(99999999999999)]], order: Model.DESCENDING }) || [];

    return this.view.getAll(sleeps);
  }

  async del(url, id) {
    // Get the Data.
    const model = await Model.get(parseInt(id, 10));

    if (!!model == false) throw new NotFoundException(`Sleep ${id} not found`);

    await model.delete();
    return this.redirect(SleepController.route);
  }
}