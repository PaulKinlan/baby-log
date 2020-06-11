import Controller from './lib/controller.js';
import Model from '../models/wee.js';
import View from '../views/wee.js';
import NotFoundException from './exception/notfound.js';

export default class WeeController extends Controller {
  static get route() {
    return '/wees';
  }

  async create(url, request) {
    // Show the create an entry UI.
    const view = new View();
    return view.create(new Model);
  } 

  async post(url, request) {

    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const wee = new Model({ startTime, endTime });

    wee.put();

    // Get the View.
    const view = new View(wee);

    return view.post(wee);
  }

  async edit(url, id) {
    // Get the Data.
    const wee = await Model.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);;
    // Get the View.
    const view = new View();

    return view.edit(wee);
  }

  async put(url, id, request) {
    // Get the Data.
    const wee = await Model.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);
    
    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    
    wee.startTime = startTime;
    wee.endTime = endTime;

    wee.put();

    // Get the View.
    const view = new View(wee);

    return view.put(wee);
  }

  async get(url, id) {
    // Get the Data.
    const wee = await Model.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);

    // Get the View.
    const view = new View();

    return view.get(wee);
  }

  async getAll(url) {
    // Get the Data.....
    const wees = await Model.getAll('type,startTime', { filter: ['BETWEEN', ['wee', new Date(0)], ['wee', new Date(9999999999999)]], order: Model.DESCENDING }) || [];

    // Get the View.
    const view = new View();

    return view.getAll(wees);
  }

  async del(url, id) {
    // Get the Data.
    const model = await Model.get(parseInt(id, 10));

    if (!!model == false) throw new NotFoundException(`Wee ${id} not found`);

    await model.delete();
    return this.redirect(WeeController.route);
  }
}