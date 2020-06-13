import { Controller } from "./lib/controller.js";
import { IndexView } from '../views/index.js';
import { Log as Model } from '../models/log.js';

export class IndexController extends Controller {
  static get route() {
    return '^/$'
  }

  async getAll(url) {
    const view = new IndexView();
    const logs = await Model.getAll('startTime,type', { filter: ['BETWEEN', [new Date(0), 'a'], [new Date(9999999999999), 'z']], order: Model.DESCENDING }) || [];

    return view.getAll(logs);
  }

  get(url) {
    const view = new IndexView();
    const output = view.render({ title: "Ay....", newTitle: "Testing" });
    return output;
  }
}