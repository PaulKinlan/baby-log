import template from '../lib/florawg.js'

export default (data, items) => {
  return template`
  <header>
    <a href="/feeds">Feeds</a>
    <h1>${data.type}</h1>
  </header>
  ${items}
  `;
};