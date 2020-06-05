import App from '../app.js';
import IndexController from '../controllers/index.js'
import FeedController from '../controllers/feed.js'

const app = new App();

app.registerRoute(IndexController.route, new IndexController);
app.registerRoute(FeedController.route, new FeedController);

self.onfetch = (event) => {
  const {request} = event
  const url = new URL(request.url);

  const controller = app.resolve(url);
  const view = controller.getView(url, request);
 
  if (!!view) {
    const response = view.then(output => {
      const options = {
        status: (!!output)? 200: 404,
        headers: {
          'content-type': 'text/html'
        }
      };
      let body = output || "Not Found";
      let other;
      [body, other] = body.tee(); 

      const reader = other.getReader();

      reader.read().then(function processText({ done, value }) {
        // This is just to check that there is output from the stream.
        if (done) {
          console.log("Stream complete");
          return;
        }
    
        console.log(value)
        return reader.read().then(processText);
      });

      return new Response(body, options);
    });

    event.respondWith(response);
  }

  // If not caught by a controller, go to the network.
};