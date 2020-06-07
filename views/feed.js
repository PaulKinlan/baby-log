import head from './partials/head.js';
import body from './partials/body.js';
import template from './lib/florawg.js'

export default class FeedView {
  async getAll(data) {
    return template`${head(data, 
      body(data, 
        template`${data.map(item => template`<div><span>Feed: </span> ${item.startTime.toISOString()} - ${item.endTime.toISOString()} <a href="/${item.type}s/${item.id}/edit">Edit</a></div>`)}`)
    )}`;
  }

  async get(data) {
    return template`${head(data)}
    <h1>Feed</h1>
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label>
      <label for=endTime>End time:<input type="datetime-local" name="endTime"></label>
    </body>
    </html>`;
  }

  async create(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <form method="POST" action="/feeds">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${(new Date()).toISOString().replace(/Z$/, '')}"></label>
      <label for=endTime>End time:<input type="datetime-local" name="endTime"></label>
      <input type="submit">
    </form>
    </body>
    </html>`;
  }

  async post(data) {
    return this.get(data);
  }

  async edit(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <form method="PUT" action="/feeds/${data.id}/edit">
      <label for=startTime>Start time: <input type="datetime-local" name="startTime" value="${data.startTime.toISOString().replace(/Z$/, '')}"></label>
      <label for=endTime>End time:<input type="datetime-local" name="endTime" value="${data.hasFinished ? data.endTime.toISOString().replace(/Z$/, '') : ''}"></label>
      <input type="submit">
    </form>
    </body>
    </html>`;
  }
}