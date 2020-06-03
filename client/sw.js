import { App } from '../app.js';
import IndexController from './controllers/index.js'
import FeedController from './controllers/feed.js'

const app = new App();

app.registerRoute(IndexController.route, new IndexController);
app.registerRoute(FeedController.route, new FeedController);

self.onfetch = (event) => {
  const controller = app.resolve(event.request.url);
  const renderedView = controller.render(query);

  self.waitUntil(renderedView);
};