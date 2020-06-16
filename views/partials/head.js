import html from "../lib/florawg.js";

export const head = (data, body) => {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Baby Logger</title>
        <script src="/client.js" type="module" defer></script>
        <link rel="stylesheet" href="/styles/main.css" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="viewport" content="width=device-width" />
        <meta
          name="description"
          content="Akachan is a baby activity logger. It let's you track when your baby has slept, eaten, wee'd or pooped."
        />
        <link
          rel="shortcut icon"
          href="/images/icons/log/res/mipmap-hdpi/log.png"
        />
      </head>
      ${body}
    </html>`;
};
