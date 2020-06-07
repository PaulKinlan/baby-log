import head from './partials/head.js';
import template from './lib/florawg.js';

export default class IndexView {
  async getAll(data) {
    return template`${head(data, 
      body(data, 
        template`${data.map(item => template`<div><span>Feed: </span> ${item.startTime} - ${item.endTime} <a href="/${item.type}s/${item.id}/edit">Edit</a></div>`)}`)
    )}`;
  }
}


