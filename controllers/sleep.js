import Controller from './lib/controller.js';
import SleepModel from '../models/sleep.js';
import SleepView from '../views/sleep.js';
import Sleep from "../models/sleep.js";
import NotFoundException from './exception/notfound.js';

export default class SleepController extends Controller {
  static get route() {
    return '/sleeps';
  }

  async create(url, request) {
    // Show the create an entry UI.
    const sleepView = new SleepView();
    return sleepView.create(new SleepModel);
  } 

  async post(url, request) {

    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const sleep = new Sleep({ startTime, endTime });

    sleep.put();

    // Get the View.
    const sleepView = new SleepView(sleep);

    return sleepView.post(sleep);
  }

  async edit(url, id) {
    // Get the Data.
    const sleep = await SleepModel.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);;
    // Get the View.
    const sleepView = new SleepView();

    return sleepView.edit(sleep);
  }

  async put(url, id, request) {
    // Get the Data.
    const sleep = await SleepModel.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);
    
    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    
    sleep.startTime = startTime;
    sleep.endTime = endTime;

    sleep.put();

    // Get the View.
    const sleepView = new SleepView(sleep);

    return sleepView.put(sleep);
  }

  async get(url, id) {
    // Get the Data.
    const sleep = await SleepModel.get(parseInt(id, 10));

    if (!!sleep == false) throw new NotFoundException(`Sleep ${id} not found`);

    // Get the View.
    const sleepView = new SleepView();

    return sleepView.get(sleep);
  }

  async getAll(url) {
    // Get the Data.....
    const sleeps = await SleepModel.getAll('type,startTime', { filter: ['BETWEEN', ['sleep', new Date(0)], ['sleep', new Date(9999999999999)]], order: SleepModel.DESCENDING }) || [];

    // Get the View.
    const sleepView = new SleepView();

    return sleepView.getAll(sleeps);
  }
}