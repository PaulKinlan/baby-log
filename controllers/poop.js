import Controller from './lib/controller.js';
import Model from '../models/poop.js';
import View from '../views/poop.js';
import NotFoundException from './exception/notfound.js';
import getFormData from './helpers/formData.js';


export default class PoopController extends Controller {
  static get route() {
    return '/poops';
  }

  async create(url, request) {
    // Show the create an entry UI.
    const view = new View();
    return view.create(new Model);
  } 

  async post(url, request) {

    const formData = await getFormData(request);

    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const poop = new Model({ startTime, endTime });

    poop.put();

    // Get the View.
    const view = new View(poop);

    return this.redirect(PoopController.route);
  }

  async edit(url, id) {
    // Get the Data.
    const poop = await Model.get(parseInt(id, 10));

    if (!!poop == false) throw new NotFoundException(`Poop ${id} not found`);;
    // Get the View.
    const view = new View();

    return view.edit(poop);
  }

  async put(url, id, request) {
    // Get the Data.
    const poop = await Model.get(parseInt(id, 10));

    if (!!poop == false) throw new NotFoundException(`Poop ${id} not found`);
    
    const formData = await getFormData(request);

    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    
    poop.startTime = startTime;
    poop.endTime = endTime;

    poop.put();

    return this.redirect(PoopController.route);
  }

  async get(url, id) {
    // Get the Data.
    const poop = await Model.get(parseInt(id, 10));

    if (!!poop == false) throw new NotFoundException(`Poop ${id} not found`);

    // Get the View.
    const view = new View();

    return view.get(poop);
  }

  async getAll(url) {
    // Get the Data.....
    const poops = await Model.getAll('type,startTime', { filter: ['BETWEEN', ['poop', new Date(0)], ['poop', new Date(99999999999999)]], order: Model.DESCENDING }) || [];

    // Get the View.
    const view = new View();

    return view.getAll(poops);
  }

  async del(url, id) {
    // Get the Data.
    const model = await Model.get(parseInt(id, 10));

    if (!!model == false) throw new NotFoundException(`Poop ${id} not found`);

    await model.delete();
    return this.redirect(PoopController.route);
  }
}