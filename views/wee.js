import { head } from './partials/head.js';
import { body } from './partials/body.js';
import template from './lib/florawg.js'
import { aggregate } from './helpers/aggregate.js';
import { correctISOTime, getDate, getTime } from './helpers/timezone.js';

export class WeeView {
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

    const lang = navigator.language;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };

    return template`${head(data,
      body(data,
        template`<div>Start time: ${data.startTime.toLocaleString(lang, options)}</div>
        <div>End time: ${(!!data.endTime) ? data.endTime.toLocaleString(lang, options) : ''}</div>`)
    )}`;
  }

  async create(data) {

    data.header = "Add a Wee";

    return template`${head(data,
      body(data, `<div class="form">
  <form method="POST" action="/${data.type}s">
    <div>
      <label for=startDate>Start time: 
        <input type="date" name="startDate" value="${getDate(correctISOTime(new Date()))}">
        <input type="time" name="startTime" value="${getTime(correctISOTime(new Date()))}">
      </label>
    </div>
    <div class="controls">
      <input type="submit" value="Save">
    </div>
  </form>
</div>`))}`;
  }

  async edit(data) {

    data.header = "Update a Wee";

    return template`${head(data,
      body(data, `<div class="form">
    <form method="POST" id="deleteForm" action="/${data.type}s/${data.id}/delete"></form>
    <form method="POST" id="editForm" action="/${data.type}s/${data.id}/edit"></form>
    <div>
      <div>
        <label for=startDate>Start time: 
          <input type="date" name="startDate" form="editForm" value="${getDate(correctISOTime(data.startTime))}">
          <input type="time" name="startTime" form="editForm" value="${getTime(correctISOTime(data.startTime))}">
        </label>
      </div>
      <div class="controls">
        <button form="deleteForm" class="delete"><img src="/images/icons/ui/delete_18dp.png"></button>
        <input type="submit" form="editForm" value="Save">
      </div>
    </div>
    `))}`;
  }
}