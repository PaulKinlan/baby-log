import { Controller } from "./lib/controller.js";
import { NotFoundException } from "./exception/notfound.js";
import { getFormData } from "./helpers/formData.js";

export class BaseController extends Controller {
  
  async create(url, request) {
    // Show the create an entry UI.
    const {referrer} = request;
    const extras = {
      referrer: referrer
    };
    return this.view.create(new this.Model(), extras);
  }

  async edit(url, id, request) {
    // Get the Data.
    let model = await this.Model.get(parseInt(id, 10));
    const {referrer} = request;
    const extras = {
      notFound: false,
      referrer: referrer
    };

    if (!!model == false) {
      model = new this.Model();
      extras.notFound = true;
    }

    return this.view.edit(model, extras);
  }

  async get(url, id) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));
    const extras = { notFound: false };

    if (!!model == false) {
      model = new this.Model();
      extras.notFound = true;
    }

    return this.view.get(model, extras);
  }

  async getAll(url) {
    // Get the Data.....
    const extras = {
      referrer: url
    };
    
    const feeds =
      (await this.Model.getAll("type,startTime", {
        filter: [
          "BETWEEN",
          [this.constructor.type, new Date(0)],
          [this.constructor.type, new Date(99999999999999)],
        ],
        order: this.Model.DESCENDING,
      })) || [];

    // Get the View.
    return this.view.getAll(feeds, extras);
  }

  async del(url, id, request) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));
    const formData = await getFormData(request);
    const redirectTo = formData.get("return-url");

    if (!!model == false) throw new NotFoundException(`Feed ${id} not found`);

    await model.delete();
    return this.redirect(redirectTo || this.constructor.route);
  }

  async put(url, id, request) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));

    if (!!model == false) throw new NotFoundException(`${id} not found`);

    const formData = await getFormData(request);

    const startDate = formData.get("startDate");
    const startTime = formData.get("startTime");
    const redirectTo = formData.get("return-url");

    model.startTime = new Date(`${startDate}T${startTime}`);

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }

  async post(url, request) {
    const formData = await getFormData(request);

    const startDate = formData.get("startDate");
    const startTime = formData.get("startTime");
    const redirectTo = formData.get("return-url");

    const start = `${startDate}T${startTime}`;

    const model = new this.Model({ startTime: start });

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }
}
