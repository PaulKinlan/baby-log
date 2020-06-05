import head from './partials/head.js';
import template from './lib/florawg.js'

export default class FeedView {
  async getAll(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <a href="/feeds/new">Create</a>
    ${
      data.map(item => template`<div>${item.startTime} - ${item.endTime} </div>`)
    }
    </body>
    </html>`;
  }

  async get(data) {
    return template`${head(data)}
    <h1>Feed ${data.id}</h1>
      <label for=startTime>Start time: <input type="datetime" name="startTime" value="${new Date}"></label>
      <label for=endTime>End time:<input type="datetime" name="endTime"></label>
    </body>
    </html>`;
  }

  async create(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <form method="POST" action="/feeds">
      <label for=startTime>Start time: <input type="datetime" name="startTime" value="${new Date}"></label>
      <label for=endTime>End time:<input type="datetime" name="endTime"></label>
      <input type="submit">
    </form>
    </body>
    </html>`;
  }

  async edit(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <form method="PUT" action="/feeds/${data.id}/edit">
      <label for=startTime>Start time: <input type="datetime" name="startTime" value="${this.startTime}"></label>
      <label for=endTime>End time:<input type="datetime" name="endTime" value="${this.endTime}"></label>
      <input type="submit">
    </form>
    </body>
    </html>`;
  }
}