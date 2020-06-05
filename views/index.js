import head from './partials/head.js';
import template from './lib/florawg.js';

export default class IndexView {
  async render(data) {
    return template`${head(data)}
    <h1>Baby log</h1>
    </body>
    </html>`;
  }
}


