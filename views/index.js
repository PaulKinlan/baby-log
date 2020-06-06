import head from './partials/head.js';
import template from './lib/florawg.js';

export default class IndexView {
  async getAll(data) {
    return template`${head(data)}
    <h1>Baby Log 1</h1>
    <a href="/feeds/new">Add Feed</a>
    ${
      data.map(item => template`<div><span>${item.type}: </span> ${item.startTime} - ${item.endTime} <a href="/${item.type}s/${item.id}/edit">Edit</a></div>`)
    }
    </body>
    </html>`;
  }
}


