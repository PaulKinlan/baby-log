import App from '../app.js';
import IndexController from '../controllers/index.js'
import FeedController from '../controllers/feed.js'
import NotFoundController from '../controllers/notfound.js';

const app = new App();

app.registerRoute(IndexController.route, new IndexController);
app.registerRoute(FeedController.route, new FeedController);

self.onfetch = (event) => {
  const {request} = event
  const url = new URL(request.url);

  const controller = app.resolve(url);
  if (controller instanceof NotFoundController) {
    return;
  }
  const view = controller.getView(url, request);
 
  if (!!view) {
    return event.respondWith(view.then(output => {
      const options = {
        status: (!!output)? 200: 404,
        headers: {
          'Content-Type': 'text/html'
        }
      };
      let body = output || "Not Found";
  
      return new Response(body, options);
    })); 
  }

  // If not caught by a controller, go to the network.
};