import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js';
import aggregate from './helpers/aggregate.js';
export default class FeedView {
  async getAll(data) {
    return template`${head(data,
      body(data,
        template`${aggregate(data)}`
    ))}`;
  }

  async get(data) {
    return template`${head(data,
      body(data,
        template`<div><label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label></div>
        <div><label for=endTime>End time:<input type="datetime-local" name="endTime"></label></div>`)
    )}`;
  }

  async create(data) {
    return template`${head(data,
      body(data, `
    <form method="POST" action="/feeds">
      <div><label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label></div>
      <div><label for=endTime>End time:<input type="datetime-local" name="endTime"></label></div>
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
    <form method="PUT" action="/feeds/${data.id}/edit">
      <div><label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${data.startTime.toISOString().replace(/Z$/, '')}"></label></div>
      <div><label for=endTime>End time:<input type="datetime-local" name="endTime" value="${data.hasFinished ? data.endTime.toISOString().replace(/Z$/, '') : ''}"></label></div>
      <input type="submit">
    </form>
    `))}`;
  }
}