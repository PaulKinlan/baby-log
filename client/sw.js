import App from '../app.js';
import IndexController from '../controllers/index.js'
import FeedController from '../controllers/feed.js'
import SleepController from '../controllers/sleep.js'
import PoopController from '../controllers/poop.js'
import WeeController from '../controllers/wee.js'
import NotFoundController from '../controllers/notfound.js';

const app = new App();

app.registerRoute(IndexController.route, new IndexController);
app.registerRoute(FeedController.route, new FeedController);
app.registerRoute(SleepController.route, new SleepController);
app.registerRoute(PoopController.route, new PoopController);
app.registerRoute(WeeController.route, new WeeController);

self.onfetch = (event) => {
  const { request } = event
  const url = new URL(request.url);

  const controller = app.resolve(url);
  if (controller instanceof NotFoundController) {
    return;
  }
  const view = controller.getView(url, request);

  if (!!view) {
    return event.respondWith(view.then(output => {
      if (output instanceof Response) return output;
      
      const options = {
        status: (!!output) ? 200 : 404,
        headers: {
          'Content-Type': 'text/html'
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

self.oninstall = (event) => {
  // We will do something a lot more clever here soon.
  self.skipWaiting();
}

self.onactivate = (event) => {
  event.waitUntil(clients.claim());
}