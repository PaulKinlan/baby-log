import { Controller } from "./lib/controller.js";
import { NotFoundException } from "./exception/notfound.js";
import { getFormData } from "./helpers/formData.js";

export class PoopController extends Controller {
  static get route() {
    return "/poops";
  }

  async create(url, request) {
    // Show the create an entry UI.
    return this.view.create(new this.Model());
  }

  async post(url, request) {
    const formData = await getFormData(request);

    const startDate = formData.get("startDate");
    const startTime = formData.get("startTime");

    const start = `${startDate}T${startTime}`;

    const poop = new this.Model({ startTime: start });

    poop.put();

    return this.redirect(PoopController.route);
  }

  async edit(url, id) {
    // Get the Data.
    let model = await this.Model.get(parseInt(id, 10));
    const extras = {
      notFound: false,
    };

    if (!!model == false) {
      model = new this.Model();
      extras.notFound = true;
    }

    return this.view.edit(model, extras);
  }

  async put(url, id, request) {
    // Get the Data.
    const poop = await this.Model.get(parseInt(id, 10));

    if (!!poop == false) throw new NotFoundException(`Poop ${id} not found`);

    const formData = await getFormData(request);

    const startDate = formData.get("startDate");
    const startTime = formData.get("startTime");

    poop.startTime = new Date(`${startDate}T${startTime}`);

    poop.put();

    return this.redirect(PoopController.route);
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
    const poops =
      (await this.Model.getAll("type,startTime", {
        filter: [
          "BETWEEN",
          ["poop", new Date(0)],
          ["poop", new Date(99999999999999)],
        ],
        order: this.Model.DESCENDING,
      })) || [];

    return this.view.getAll(poops);
  }

  async del(url, id, request) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));
    const { referrer } = request;

    if (!!model == false) throw new NotFoundException(`Poop ${id} not found`);

    await model.delete();
    return this.redirect(referrer || this.constructor.route);
  }
}
