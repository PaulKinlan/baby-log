import http from 'http';
import mime from 'mime';

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
app.registerRoute(StaticController.route, new StaticController(['./client']));

// Static Serving

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  const controller = app.resolve(url);
  const renderedView = controller.render(url);

  if (!!renderedView) {
    res.statusCode = 200;
    res.setHeader('Content-Type', mime.getType(url.pathname) || 'text/html');
    renderedView.then(output => {
      if (typeof output === "string")  {
        res.write(output);
        res.end();
      } 
      else {
        const stream = new FromWhatWGReadableStream({}, output);
        stream.pipe(res, { end: true });
      }
    });
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});