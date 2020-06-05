class MethodNotFound {
  constructor(message) {
    //super(message);
    this.name = "MehodNotFound";
  }
}

export default class Controller {

  getView(url, request) {
    const { pathname } = new URL(url);
    const { method } = request;
    const route = this.constructor.route;
    const data = request.formData;

    // The instance of the controller must implement these functions;
    if (method === 'GET') {
      const idMatch = pathname.match(`${route}/(.+)/`);
      if (pathname.match(`${route}/new`)) {
        return this.create(url);
      } else if (pathname.match(`${route}/(.+)/edit`)) {
        return this.edit(url, idMatch[1]);
      } else if (pathname.match(`${route}/(.+)/`)) {
        return this.get(url, idMatch[1]);
      }
      return this.getAll(url);
    }
    else if (method === 'POST') {
      return this.post(url, request);
    }
    else if (method === 'PUT') {
      return this.put(url, request);
    }
    else if (method === 'DELETE') {
      const idMatch = pathname.match(`${route}/(.+)/`);
      return this.del(url, idMatch[1]);
    }
  }

  create(url) {
    throw new MethodNotFound('create');
  }

  edit(url) {
    throw new MethodNotFound('');
  }

  get(url) {
    throw new MethodNotFound('get');
  }

  getAll(url) {
    throw new MethodNotFound('getAll');
  }

  post(url) {
    throw new MethodNotFound('post');
  }

  del(url) {
    throw new MethodNotFound('delete');
  }
}
