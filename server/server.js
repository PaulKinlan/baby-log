import http from 'http';
import mime from 'mime';
import fetch from 'node-fetch';
const Request = fetch.Request;

import FromWhatWGReadableStream from './private/streams/fromreadable.js';

import App from '../app.js';
import IndexController from '../controllers/index.js';
import FeedController from '../controllers/feed.js';
import StaticController from '../controllers/server/static.js';

const hostname = '127.0.0.1';
const port = 3000;

const app = new App();

app.registerRoute(IndexController.route, new IndexController);
app.registerRoute(FeedController.route, new FeedController);
app.registerRoute(StaticController.route, new StaticController(['./build/client', './client']));

const server = http.createServer((req, res) => {
  const { method, headers } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const request = new Request(url, {
    method: method,
    headers: headers,
    body: (method == 'GET' || method == 'HEAD') ? undefined : ''
  } );

  const controller = app.resolve(url);
  const view = controller.getView(url, request);

  if (!!view) {
    res.statusCode = 200;
    res.setHeader('Content-Type', mime.getType(url.pathname) || 'text/html');
    view.then(output => {
      if (typeof output === "string") {
        res.write(output);
        res.end();
      }
      else if (!!output === true) {
        const stream = new FromWhatWGReadableStream({}, output);
        stream.pipe(res, { end: true });
      }
      else {
        // Sometimes the output doesn't exist.
        res.statusCode = 404;
        res.end();
      }
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});