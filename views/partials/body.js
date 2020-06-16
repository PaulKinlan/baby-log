import html from "../lib/florawg.js";

export const body = (data, items) => {
  return html`
    <header>
      <img src="/images/icons/log/res/mipmap-xhdpi/log.png">
      <nav>
        <a href="/">All</a> <a href="/feeds">Feeds</a>
        <a href="/sleeps">Sleeps</a> <a href="/poops">Poops</a>
        <a href="/wees">Wees</a>
      </nav>
    </header>
    <main>
      <header>
        <h2>${data.header}</h2>
      </header>
      <section>
        ${items}
      </section>
    </main>
    <footer>
      <span>Add</span><a href="/feeds/new" title="Add a feed">🍼</a
      ><a href="/sleeps/new" title="Add a Sleep">💤</a
      ><a href="/poops/new" title="Add a Poop">💩</a
      ><a href="/wees/new" title="Add a Wee">⛲️</a>
    </footer>
  `;
};
