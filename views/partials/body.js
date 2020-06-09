import template from '../lib/florawg.js'

export default (data, items) => {
  return template`
  <header>
    <h1>Baby Log</h1>
    <h2>${data.type}</h2>
    <div>View: <a href="/">All</a>, <a href="/feeds">Feeds</a>, <a href="/sleeps">Sleeps</a>, <a href="/poops">Poops</a>,  <a href="/wees">Wees</a></div>
    <div>Add: <a href="/feeds/new">Feed</a>, <a href="/sleeps/new">Sleep</a>, <a href="/poops/new">Poop</a>, <a href="/wees/new">Wee</a></div>
  </header>
  <main>
    ${items}
  </main>
  `;
};