import Controller from "./lib/controller.js";

import IndexView from '../views/index.js';

export default class IndexController extends Controller {
  static get route() {
    return '/$'
  }

  render(url) {
    const view = new IndexView();

    const output = view.render({title: "Ay....", newTitle: "Testing"});
    return output;
  }
}