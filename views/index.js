import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js';
import aggregate from './helpers/aggregate.js';

export default class IndexView {
  async getAll(data) {
    return template`${head(data, 
      body(data, 
        template`${aggregate(data)}`)
    )}`;
  }
}


