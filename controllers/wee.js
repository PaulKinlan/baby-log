import Controller from './lib/controller.js';
import WeeModel from '../models/wee.js';
import WeeView from '../views/wee.js';
import Wee from "../models/wee.js";
import NotFoundException from './exception/notfound.js';

export default class WeeController extends Controller {
  static get route() {
    return '/wees';
  }

  async create(url, request) {
    // Show the create an entry UI.
    const weeView = new WeeView();
    return weeView.create(new WeeModel);
  } 

  async post(url, request) {

    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    const wee = new Wee({ startTime, endTime });

    wee.put();

    // Get the View.
    const weeView = new WeeView(wee);

    return weeView.post(wee);
  }

  async edit(url, id) {
    // Get the Data.
    const wee = await WeeModel.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);;
    // Get the View.
    const weeView = new WeeView();

    return weeView.edit(wee);
  }

  async put(url, id, request) {
    // Get the Data.
    const wee = await WeeModel.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);
    
    const formData = await request.formData();
    const startTime = formData.get('startTime');
    const endTime = formData.get('endTime');
    
    wee.startTime = startTime;
    wee.endTime = endTime;

    wee.put();

    // Get the View.
    const weeView = new WeeView(wee);

    return weeView.put(wee);
  }

  async get(url, id) {
    // Get the Data.
    const wee = await WeeModel.get(parseInt(id, 10));

    if (!!wee == false) throw new NotFoundException(`Wee ${id} not found`);

    // Get the View.
    const weeView = new WeeView();

    return weeView.get(wee);
  }

  async getAll(url) {
    // Get the Data.....
    const wees = await WeeModel.getAll('type,startTime', { filter: ['BETWEEN', ['wee', new Date(0)], ['wee', new Date(9999999999999)]], order: WeeModel.DESCENDING }) || [];

    // Get the View.
    const weeView = new WeeView();

    return weeView.getAll(wees);
  }
}