import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js'

export default class PoopView {
  async getAll(data) {
    return template`${head(data,
      body(data,
        template`${data.map(item => template`<div><span>Poop: </span> ${item.startTime.toISOString()} <a href="/${item.type}s/${item.id}/edit">Edit</a></div>`)}`)
    )}`;
  }

  async get(data) {
    return template`${head(data,
      body(data,
        template`<label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label>`)
    )}`;
  }

  async create(data) {
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
    return template`${head(data,
      body(data, `
    <form method="PUT" action="/poops/${data.id}/edit">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${data.startTime.toISOString().replace(/Z$/, '')}"></label>
      <input type="submit">
    </form>
    `))}`;
  }
}