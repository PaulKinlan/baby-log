import http from 'http';
import mime from 'mime';
import fetch from 'node-fetch';
import querystring from 'querystring';
import { StringDecoder } from 'string_decoder';

const Request = fetch.Request;

import FromWhatWGReadableStream from './private/streams/fromreadable.js';

import App from '../app.js';
import IndexController from '../controllers/index.js';
import FeedController from '../controllers/feed.js';
import SleepController from '../controllers/sleep.js';
import PoopController from '../controllers/poop.js'
import WeeController from '../controllers/wee.js'
import StaticController from '../controllers/server/static.js';
import NotFoundException from '../controllers/exception/notfound.js';

const app = new App();

app.registerRoute(IndexController.route, new IndexController);
app.registerRoute(FeedController.route, new FeedController);
app.registerRoute(SleepController.route, new SleepController);
app.registerRoute(PoopController.route, new PoopController);
app.registerRoute(WeeController.route, new WeeController);
app.registerRoute(StaticController.route, new StaticController(['./build/client/', './client/']));

class FormData {

  constructor() {
    this._items = {};
  }

  append(key, value) {
    this._items[key] = value;
  }

  get(key) {
    return this._items[key];
  }
}

const render = (url, request, res) => {
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
      else if (output instanceof Buffer) {
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
    }).catch(ex => {
      if (ex instanceof NotFoundException) {
        res.statusCode = 404;
        res.write(ex.toString());
        res.end();
      }
    });
  }
}

const server = http.createServer((req, res) => {
  const { method, headers } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const request = new Request(url, {
    method: method,
    headers: headers,
    body: (method == 'GET' || method == 'HEAD') ? undefined : ''
  });

  const decoder = new StringDecoder('utf-8');

  if (method === 'POST') {
    const formData = new FormData();
    request.formData = () => Promise.resolve(formData);
    let buffer = '';
    // Parse the input data.
    req.on('data', (chunk) => {
      buffer += decoder.write(chunk);
    });

    req.on('end', () => {
      buffer += decoder.end();

      const qs = querystring.parse(buffer);
      for (let [key, value] of Object.entries(qs)) {
        formData.append(key, value);
      }
      render(url, request, res);
    });
  } else {
    render(url, request, res);
  }
});

const port = process.env.PORT || 8080;

server.listen(port, () => {
  console.log(`Server running at on ${port}`);
});