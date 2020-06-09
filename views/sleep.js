import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js'

export default class SleepView {
  async getAll(data) {
    return template`${head(data,
      body(data,
        template`${data.map(item => template`<div><span>Sleep: </span> ${item.startTime.toISOString()} - ${data.hasFinished ? item.endTime.toISOString() : ''} <a href="/${item.type}s/${item.id}/edit">Edit</a></div>`)}`)
    )}`;
  }

  async get(data) {
    return template`${head(data,
      body(data,
        template`<label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label>
        <label for=endTime>End time:<input type="datetime-local" name="endTime"></label>`)
    )}`;
  }

  async create(data) {
    return template`${head(data,
      body(data, `
    <form method="POST" action="/sleeps">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label>
      <label for=endTime>End time:<input type="datetime-local" name="endTime"></label>
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
    <form method="PUT" action="/sleeps/${data.id}/edit">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${data.startTime.toISOString().replace(/Z$/, '')}"></label>
      <label for=endTime>End time:<input type="datetime-local" name="endTime" value="${data.hasFinished ? data.endTime.toISOString().replace(/Z$/, '') : ''}"></label>
      <input type="submit">
    </form>
    `))}`;
  }
}