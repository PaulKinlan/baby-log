import { App } from "../app.js";

import {
  IndexController,
  FeedController,
  SleepController,
  WeeController,
  PoopController,
} from "../controllers/_.js";
import {
  IndexView,
  FeedView,
  SleepView,
  WeeView,
  PoopView,
} from "../views/_.js";
import { Log, Feed, Sleep, Wee, Poop } from "../models/_.js";

import { NotFoundController } from "../controllers/notfound.js";
import { StaticController } from "../controllers/client/static.js";

import { version } from "../package.json";

import { assets } from "../assets.js";

const app = new App();

app.registerRoute(
  IndexController.route,
  new IndexController(new IndexView(), Log)
);
app.registerRoute(
  FeedController.route,
  new FeedController(new FeedView(), Feed)
);
app.registerRoute(
  SleepController.route,
  new SleepController(new SleepView(), Sleep)
);
app.registerRoute(
  PoopController.route,
  new PoopController(new PoopView(), Poop)
);
app.registerRoute(WeeController.route, new WeeController(new WeeView(), Wee));
app.registerRoute(StaticController.route, new StaticController());

self.onfetch = (event) => {
  const { request } = event;
  const url = new URL(request.url);

  const controller = app.resolve(url);
  if (controller instanceof NotFoundController) {
    // Fall through to the network
    return;
  }
  const view = controller.getView(url, request);

  if (!!view) {
    return event.respondWith(
      view
        .then((output) => {
          if (output instanceof Response) return output;

          const options = {
            status: !!output ? 200 : 404,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          };
          let body = output || "Not Found";

          return new Response(body, options);
        })
        .catch((ex) => {
          const options = {
            status: 404,
            headers: {
              "Content-Type": "text/html",
            },
          };
          return new Response(ex.toString(), options);
        })
    );
  }

  // If not caught by a controller, go to the network.
};

self.oninstall = (event) => {
  // We will do something a lot more clever here soon.
  event.waitUntil(
    caches.open(version).then((cache) => {
      return cache.addAll(Object.values(assets));
    })
  );
  self.skipWaiting();
};

self.onactivate = (event) => {
  const result = clients.claim()
    .then(_ => caches.keys())
    .then(cacheKeys => {
      if (!!cacheKeys) {
        const cachesToDelete = cacheKeys.filter(cacheKey => cacheKey != version).map(cacheKey => caches.delete(cacheKey));
        return Promise.all(cachesToDelete);
      }
    });

  event.waitUntil(result);
};
