import { Controller } from './lib/controller.js';
import { NotFoundException } from './exception/notfound.js';
import { getFormData } from './helpers/formData.js';


export class SleepController extends Controller {
  static get route() {
    return '/sleeps';
  }

  async create(url, request) {
    // Show the create an entry UI.
    return this.view.create(new this.Model);
  }

  async post(url, request) {

    const formData = await getFormData(request);
    
    const startDate = formData.get('startDate');
    const startTime = formData.get('startTime');
    const endDate = formData.get('endDate');
    const endTime = formData.get('endTime');

    const start = new Date(`${startDate}T${startTime}`);
    const end = (!!endDate && !!endTime) ? new Date(`${endDate}T${endTime}`) : undefined;
    
    const sleep = new this.Model({ startTime: start, endTime: end });

    sleep.put();

    return this.redirect(SleepController.route);
  }

  async edit(url, id) {
    // Get the Data.
    const sleep = await this.Model.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);;
    
    return this.view.edit(sleep);
  }

  async put(url, id, request) {
    // Get the Data.
    const sleep = await this.Model.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);

    const formData = await getFormData(request);

    const startDate = formData.get('startDate');
    const startTime = formData.get('startTime');
    const endDate = formData.get('endDate');
    const endTime = formData.get('endTime');

    sleep.startTime = new Date(`${startDate}T${startTime}`);
    sleep.endTime = (!!endDate && !!endTime) ? new Date(`${endDate}T${endTime}`) : undefined;
    
    sleep.put();

    return this.redirect(SleepController.route);
  }

  async get(url, id) {
    // Get the Data.
    const sleep = await this.Model.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);

    return this.view.get(sleep);
  }

  async getAll(url) {
    // Get the Data.....
    const sleeps = await this.Model.getAll('type,startTime', { filter: ['BETWEEN', ['sleep', new Date(0)], ['sleep', new Date(99999999999999)]], order: this.Model.DESCENDING }) || [];

    return this.view.getAll(sleeps);
  }

  async del(url, id) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));

    if (!!model == false) throw new NotFoundException(`Sleep ${id} not found`);

    await model.delete();
    return this.redirect(SleepController.route);
  }
}