import App from '../app.js';
import IndexController from '../controllers/index.js'
import FeedController from '../controllers/feed.js'
import SleepController from '../controllers/sleep.js'
import PoopController from '../controllers/poop.js'
import WeeController from '../controllers/wee.js'
import NotFoundController from '../controllers/notfound.js';
import StaticController from '../controllers/client/static.js';

import paths from './sw-manifest.json';

const app = new App();

app.registerRoute(IndexController.route, new IndexController);
app.registerRoute(FeedController.route, new FeedController);
app.registerRoute(SleepController.route, new SleepController);
app.registerRoute(PoopController.route, new PoopController);
app.registerRoute(WeeController.route, new WeeController);
app.registerRoute(StaticController.route, new StaticController);

self.onfetch = (event) => {
  const { request } = event
  const url = new URL(request.url);

  const controller = app.resolve(url);
  if (controller instanceof NotFoundController) {
    // Fall through to the network
    return;
  }
  const view = controller.getView(url, request);

  if (!!view) {
    return event.respondWith(view.then(output => {
      if (output instanceof Response) return output;

      const options = {
        status: (!!output) ? 200 : 404,
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      };
      let body = output || "Not Found";

      return new Response(body, options);
    }).catch(ex => {
      const options = {
        status: 404,
        headers: {
          'Content-Type': 'text/html'
        }
      };
      return new Response(ex.toString(), options);
    }));
  }

  // If not caught by a controller, go to the network.
};

let urls = [];

self.oninstall = async (event) => {
  // We will do something a lot more clever here soon.
  event.waitUntil(caches.open("v1").then(async (cache) => {
   
    return cache.addAll(paths);
  }));
  self.skipWaiting();
}

self.onactivate = (event) => {
  event.waitUntil(clients.claim());
}