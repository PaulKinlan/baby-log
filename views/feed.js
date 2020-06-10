import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js';
import aggregate from './helpers/aggregate.js';
import correctISOTime from './helpers/timezone.js';

if ('navigator' in globalThis === false) globalThis.navigator = {
  language: 'en-GB'
};
export default class FeedView {
  async getAll(data) {

    data.type = "Feed";
    data.header = "Feeds";

    return template`${head(data,
      body(data,
        template`${aggregate(data)}`
    ))}`;
  }

  async get(data) {

    data.header = "Feed";

    const lang = navigator.language;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  
    return template`${head(data,
      body(data,
        template`<div>Start time: ${data.startTime.toLocaleString(lang, options)}</div>
        <div>End time: ${(!!data.endTime) ? data.endTime.toLocaleString(lang, options) : ''}</div>`)
    )}`;
  }

  async create(data) {

    data.header = "Add a Feed";

    return template`${head(data,
      body(data, `<div>
    <form method="POST" action="/feeds">
      <div><label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${correctISOTime(new Date())}"></label></div>
      <div><label for=endTime>End time:<input type="datetime-local" name="endTime"></label></div>
      <input type="submit">
    </form></div>
    `))}`;
  }

  async post(data) {
    return this.get(data);
  }

  async edit(data) {
    data.header = "Update a Feed";

    return template`${head(data,
      body(data, `<div>
    <form method="POST" action="/feeds/${data.id}/edit">
      <div><label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${correctISOTime(data.startTime)}"></label></div>
      <div><label for=endTime>End time:<input type="datetime-local" name="endTime" value="${data.hasFinished ? correctISOTime(new Date()) : ''}"></label></div>
      <input type="submit">
    </form></div>
    `))}`;
  }

  async put(data) {
    return this.get(data);
  }
}