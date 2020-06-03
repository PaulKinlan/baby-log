import head from './partials/head.js';

import template from './lib/florawg.js';


export default class IndexView {
  async render(data) {
    return template`${head(data)}
    <h1>Hello World - ${data.title}</h1>
    </body>
    </html>`;
  }
}


