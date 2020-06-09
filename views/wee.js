import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js'

export default class WeeView {
  async getAll(data) {
    return template`${head(data,
      body(data,
        template`${data.map(item => template`<div><span>Wee: </span> ${item.startTime.toISOString()} - ${data.hasFinished ? item.endTime.toISOString() : ''} <a href="/${item.type}s/${item.id}/edit">Edit</a></div>`)}`)
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
    <form method="POST" action="/wees">
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
    <form method="PUT" action="/wees/${data.id}/edit">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${data.startTime.toISOString().replace(/Z$/, '')}"></label>
      <input type="submit">
    </form>
    `))}`;
  }
}