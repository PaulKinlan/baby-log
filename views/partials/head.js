import template from '../lib/florawg.js'

export default (data, body) => {
  return template`<!DOCTYPE html>
<html>
  <head>
    <title>Baby Logger</title>
    <script src="/client/client.js" type="module" defer></script>
    <link rel="stylesheet" href="/styles/main.css">
    <link rel="manifest" href="/manifest.json">
  </head>
  ${body}
</html>`;
};