import html from "../lib/florawg.js";

export const body = (data, items) => {
  return html`
    <header class="${data.type.toLowerCase()}">
      <img src="/images/icons/ui/logo.svg" />
      <nav>
        <a href="/" class="all">All</a>
        <a href="/feeds" class="feed">Feeds</a>
        <a href="/sleeps" class="sleep">Sleeps</a>
        <a href="/poops" class="poop">Poops</a>
        <a href="/wees" class="wee">Wees</a>
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
      <nav id="add-nav">
        <a href="/feeds/new" title="Add a feed">🍼</a>
        <a href="/sleeps/new" title="Add a Sleep">💤</a>
        <a href="/poops/new" title="Add a Poop">💩</a>
        <a href="/wees/new" title="Add a Wee">⛲️</a>
      </nav>
      <a href="#remove-nav"><img src="/images/icons/ui/remove_white_18dp.svg"></a>
      <a href="#add-nav"><img src="/images/icons/ui/add_white_18dp.svg" title="Add"></a>
    </footer>
  `;
};
