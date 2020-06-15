import html from "../lib/florawg.js";

export const head = (data, body) => {
  return html`<!DOCTYPE html>
    <html>
      <head>
        <title>Baby Logger</title>
        <script src="/client.js" type="module" defer></script>
        <link rel="stylesheet" href="/styles/main.css" />
        <link rel="manifest" href="/manifest.json" />
        <link
          rel="shortcut icon"
          href="/images/icons/log/res/mipmap-hdpi/log.png"
        />
        <meta name="viewport" content="width=device-width" />
      </head>
      ${body}
    </html>`;
};
