import { head } from './partials/head.js';
import { body } from './partials/body.js';
import template from './lib/florawg.js';
import { aggregate } from './helpers/aggregate.js';

export class IndexView {
  async getAll(data) {

    data.type = "All";
    data.header = "All";

    return template`${head(data, 
      body(data, 
        template`${aggregate(data)}`)
    )}`;
  }
}


