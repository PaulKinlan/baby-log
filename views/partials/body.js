import template from '../lib/florawg.js'

export default (data, items) => {
  return template`
  <header>
    <h1>Baby Log</h1>
    <h2>${data.type}</h2>
    <a href="/feeds">Feeds</a>
  </header>
  ${items}
  `;
};