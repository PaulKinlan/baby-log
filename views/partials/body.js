import template from '../lib/florawg.js'

export default (data, items) => {
  return template`
  <header>
    <h1>Baby Log</h1>
    <h2>${data.type}</h2>
    <div>View: <a href="/feeds">Feeds</a></div>
    <div>Add: <a href="/feeds/new">Feed</a></div>
  </header>
  ${items}
  `;
};