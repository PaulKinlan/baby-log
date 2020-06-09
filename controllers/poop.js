import Controller from './lib/controller.js';
import PoopModel from '../models/poop.js';
import PoopView from '../views/poop.js';
import Poop from "../models/poop.js";
import NotFoundException from './exception/notfound.js';

export default class PoopController extends Controller {
  static get route() {
    return '/poops';
  }

  async create(url, request) {
    // Show the create an entry UI.
    const poopView = new PoopView();
    return poopView.create(new PoopModel);
  } 

  async post(url, request) {

    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const poop = new Poop({ startTime, endTime });

    poop.put();

    // Get the View.
    const poopView = new PoopView(poop);

    return poopView.post(poop);
  }

  async edit(url, id) {
    // Get the Data.
    const poop = await PoopModel.get(parseInt(id, 10));

    if (!!poop == false) throw new NotFoundException(`Poop ${id} not found`);;
    // Get the View.
    const poopView = new PoopView();

    return poopView.edit(poop);
  }

  async put(url, id, request) {
    // Get the Data.
    const poop = await PoopModel.get(parseInt(id, 10));

    if (!!poop == false) throw new NotFoundException(`Poop ${id} not found`);
    
    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    
    poop.startTime = startTime;
    poop.endTime = endTime;

    poop.put();

    // Get the View.
    const poopView = new PoopView(poop);

    return poopView.put(poop);
  }

  async get(url, id) {
    // Get the Data.
    const poop = await PoopModel.get(parseInt(id, 10));

    if (!!poop == false) throw new NotFoundException(`Poop ${id} not found`);

    // Get the View.
    const poopView = new PoopView();

    return poopView.get(poop);
  }

  async getAll(url) {
    // Get the Data.....
    const poops = await PoopModel.getAll('type,startTime', { filter: ['BETWEEN', ['poop', new Date(0)], ['poop', new Date(9999999999999)]], order: PoopModel.DESCENDING }) || [];

    // Get the View.
    const poopView = new PoopView();

    return poopView.getAll(poops);
  }
}