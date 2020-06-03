import template from '../lib/florawg.js'

export default (data) => {
  return template`<!DOCTYPE html>
  <html>
    <head>
    <title>${data.newTitle}</title>
    <script src="/client/client.js" type="module"></script>
    </head>
    <body>
    `;
};