import html from "../lib/florawg.js";
import { assets } from "../../assets.js";

export const head = (data, body) => {
  return html`<!DOCTYPE html>
    <html lang="en">
      <head>
        <title>Baby Logger</title>
        <script src="/client.js" type="module" defer></script>
        <link rel="stylesheet" href="${assets["/styles/main.css"]}" />
        <link rel="manifest" href="${assets["/manifest.json"]}" />
        <meta name="viewport" content="width=device-width" />
        <meta
          name="description"
          content="Akachan is a baby activity logger. It let's you track when your baby has slept, eaten, wee'd or pooped."
        />
        <link
          rel="shortcut icon"
          href="${assets["/images/icons/log/res/mipmap-hdpi/log.png"]}"
        />
      </head>
      ${body}
    </html>`;
};
