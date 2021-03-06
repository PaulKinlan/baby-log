class MethodNotFound {
  constructor(message) {
    //super(message);
    this.name = "MethodNotFound";
  }
}

export class Controller {
  constructor(view, model) {
    this.view = view;
    this.Model = model;
  }

  getView(url, request) {
    const { pathname } = new URL(url);
    const { method } = request;
    const route = this.constructor.route;
    const idMatch = pathname.match(`${route}/(.+)/`);

    // The instance of the controller must implement these functions;
    if (method === "GET") {
      const idMatch = pathname.match(`${route}/(.+)/`);
      if (pathname.match(`${route}/new`)) {
        return this.create(url, request);
      } else if (pathname.match(`${route}/(.+)/edit$`)) {
        return this.edit(url, idMatch[1], request);
      } else if (pathname.match(`${route}/(.+)/`)) {
        return this.get(url, idMatch[1], request);
      }
      return this.getAll(url, request);
    } else if (method === "POST") {
      if (pathname.match(`${route}/(.+)/edit$`)) {
        return this.put(url, idMatch[1], request);
      } else if (pathname.match(`${route}/(.+)/delete$`)) {
        const idMatch = pathname.match(`${route}/(.+)/`);
        return this.del(url, idMatch[1], request);
      } else if (pathname.match(`${route}/*$`)) {
        return this.post(url, request);
      }
    } else if (method === "PUT") {
      return this.put(url, idMatch[1], request);
    } else if (method === "DELETE") {
      const idMatch = pathname.match(`${route}/(.+)/`);
      return this.del(url, idMatch[1], request);
    }
  }

  redirect(url) {
    return Response.redirect(url, "302");
  }

  create(url) {
    throw new MethodNotFound("create");
  }

  edit(url) {
    throw new MethodNotFound("");
  }

  get(url) {
    throw new MethodNotFound("get");
  }

  getAll(url) {
    throw new MethodNotFound("getAll");
  }

  post(url) {
    throw new MethodNotFound("post");
  }

  del(url) {
    throw new MethodNotFound("delete");
  }
}
