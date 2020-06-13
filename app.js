import { NotFoundController } from './controllers/notfound.js'

export class App {
  get routes() {
    return routes;
  }

  registerRoute(route, controller) {
    routes.push({route, controller});
  }

  resolve(url) {
    const { pathname } = url;
    for(let {route, controller} of routes) {
      if (pathname.match(route)) {
        return controller;
      }
    }

    return routeNotFound;
  }
}

const routes = [];
const routeNotFound = new NotFoundController;