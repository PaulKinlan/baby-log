import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js'
import aggregate from './helpers/aggregate.js';
import correctISOTime from './helpers/timezone.js';

export default class SleepView {
  async getAll(data) {

    data.type = "Sleeps";
    data.header = "Sleeps";

    return template`${head(data,
      body(data,
        template`${aggregate(data)}`)
    )}`;
  }

  async get(data) {

    data.header = "Sleep";

    const lang = navigator.language;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
  
    return template`${head(data,
      body(data,
        template`<div>Start time: ${data.startTime.toLocaleString(lang, options)}</div>
        <div>End time: ${(!!data.endTime) ? data.endTime.toLocaleString(lang, options) : ''}</div>`)
    )}`;
  }

  async create(data) {

    data.header = "Add a Sleep";

    return template`${head(data,
      body(data, `<div>
    <form method="POST" action="/sleeps">
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

    data.header = "Update a Sleep";

    return template`${head(data,
      body(data, `<div class="form">
    <form method="POST" id="deleteForm" action="/${data.type}s/${data.id}/delete"></form>
    <form method="POST" id="editForm" action="/${data.type}s/${data.id}/edit"></form>
    <div>
      <div><label for=startTime>Start time: <input type="datetime-local" name="startTime" form="editForm" value="${correctISOTime(data.startTime)}"></label></div>
      <div><label for=endTime>End time:<input type="datetime-local" name="endTime" form="editForm" value="${data.hasFinished ? correctISOTime(new Date()) : ''}"></label></div>
      <div class="controls">
        <button form="deleteForm"><img src="/images/icons/ui/delete_18dp.png"></button>
        <input type="submit" form="editForm" value="Save">
      </div>
    </div>
    </div>
    `))}`;
  }

  async put(data) {
    return this.get(data);
  }
}