import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js'
import aggregate from './helpers/aggregate.js';

export default class WeeView {
  async getAll(data) {

    data.type = "Wee";
    data.header = "Wees";

    return template`${head(data, 
      body(data, 
        template`${aggregate(data)}`)
    )}`;
  }

  async get(data) {

    data.header = "Wee";

    return template`${head(data,
      body(data,
        template`<div><label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label></div>`)
    )}`;
  }

  async create(data) {

    data.header = "Add a Wee";

    return template`${head(data,
      body(data, `<div>
    <form method="POST" action="/wees">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label>
      <input type="submit">
    </form></div>
    `))}`;
  }

  async post(data) {
    return this.get(data);
  }

  async edit(data) {

    data.header = "Update a Wee";

    return template`${head(data,
      body(data, `<div>
    <form method="POST" action="/wees/${data.id}/edit">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${data.startTime.toISOString().replace(/Z$/, '')}"></label>
      <input type="submit">
    </form></div>
    `))}`;
  }
}