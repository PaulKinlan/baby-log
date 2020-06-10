import template from '../lib/florawg.js'

export default (data, items) => {
  return template`
  <header>
    <h1>Baby Log</h1>
    <div><a href="/">All</a>, <a href="/feeds">Feeds</a>, <a href="/sleeps">Sleeps</a>, <a href="/poops">Poops</a>,  <a href="/wees">Wees</a></div>
    </header>
  <main>
    <header>
      <h2>${data.header} [<a href="/${data.type}/new">Add</a>]</h2>
    </header>
    <section>
    ${items}
    </section>
  </main>
  <footer>
    <span>Add</span><a href="/feeds/new">Feed</a><a href="/sleeps/new">Sleep</a><a href="/poops/new">Poop</a><a href="/wees/new">Wee</a>
  </footer>
  `;
};