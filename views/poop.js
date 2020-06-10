import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js'
import aggregate from './helpers/aggregate.js';

export default class PoopView {
  async getAll(data) {

    data.type = "Poop";
    data.header = "Poops";

    return template`${head(data,
      body(data,
        template`${aggregate(data)}`)
    )}`;
  }

  async get(data) {

    data.header = "Poop";

    return template`${head(data,
      body(data,
        template`<div><label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label></div>`)
    )}`;
  }

  async create(data) {

    data.header = "Add a Poop";

    return template`${head(data,
      body(data, `
    <form method="POST" action="/poops">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label>
      <input type="submit">
    </form>
    `))}`;
  }

  async post(data) {
    return this.get(data);
  }

  async edit(data) {

    data.header = "Update a Poop";

    return template`${head(data,
      body(data, `
    <form method="PUT" action="/poops/${data.id}/edit">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${data.startTime.toISOString().replace(/Z$/, '')}"></label>
      <input type="submit">
    </form>
    `))}`;
  }
}