import Controller from "./lib/controller.js";
import IndexView from '../views/index.js';
import LogModel from '../models/log.js';

export default class IndexController extends Controller {
  static get route() {
    return '^/$'
  }

  async getAll(url) {
    const view = new IndexView();
    const logs = await LogModel.getAll('type,startTime', {filter: ['BETWEEN', ['a', new Date(0)], ['z', new Date(9999999999999)]], order:LogModel.DESCENDING}) || [];
  
    return view.getAll(logs);
  }

  get(url) {
    const view = new IndexView();
    const output = view.render({title: "Ay....", newTitle: "Testing"});
    return output;
  }
}