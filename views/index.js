import head from './partials/head.js';
import template from './lib/florawg.js';

export default class IndexView {
  async getAll(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <a href="/feeds/new">Create</a>
    ${
      data.map(item => template`<div><span>Feed: </span> ${item.startTime} - ${item.endTime}</div>`)
    }
    </body>
    </html>`;
  }
}


