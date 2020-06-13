import { Controller } from './lib/controller.js';
import { NotFoundException } from './exception/notfound.js';
import { getFormData } from './helpers/formData.js';

export class WeeController extends Controller {
  static get route() {
    return '/wees';
  }

  async create(url, request) {
    return this.view.create(new this.Model);
  }

  async post(url, request) {

    const formData = await getFormData(request);

    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const wee = new this.Model({ startTime, endTime });

    wee.put();

    return this.redirect(WeeController.route);
  }

  async edit(url, id) {
    // Get the Data.
    const wee = await this.Model.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);;
    
    return this.view.edit(wee);
  }

  async put(url, id, request) {
    // Get the Data.
    const wee = await this.Model.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);

    const formData = await getFormData(request);

    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');

    wee.startTime = startTime;
    wee.endTime = endTime;

    wee.put();

    return this.redirect(WeeController.route);
  }

  async get(url, id) {
    // Get the Data.
    const wee = await this.Model.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);

    return this.view.get(wee);
  }

  async getAll(url) {
    // Get the Data.....
    const wees = await this.Model.getAll('type,startTime', { filter: ['BETWEEN', ['wee', new Date(0)], ['wee', new Date(99999999999999)]], order: this.Model.DESCENDING }) || [];

    return this.view.getAll(wees);
  }

  async del(url, id) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));

    if (!!model == false) throw new NotFoundException(`Wee ${id} not found`);

    await model.delete();
    return this.redirect(WeeController.route);
  }
}