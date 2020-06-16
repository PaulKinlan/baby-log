import { Controller } from "./lib/controller.js";
import { NotFoundException } from "./exception/notfound.js";
import { getFormData } from "./helpers/formData.js";

export class FeedController extends Controller {
  static get route() {
    return "/feeds";
  }

  async create(url, request) {
    // Show the create an entry UI.
    return this.view.create(new this.Model());
  }

  async post(url, request) {
    const formData = await getFormData(request);
    const startDate = formData.get("startDate");
    const startTime = formData.get("startTime");
    const endDate = formData.get("endDate");
    const endTime = formData.get("endTime");

    const start = new Date(`${startDate}T${startTime}`);
    const end =
      !!endDate && !!endTime ? new Date(`${endDate}T${endTime}`) : undefined;

    const feed = new this.Model({ startTime: start, endTime: end });

    feed.put();

    return this.redirect(FeedController.route);
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
    const feed = await this.Model.get(parseInt(id, 10));

    if (!!feed == false) {
      return this.redirect(FeedController.route);
    }

    const formData = await getFormData(request);

    const startDate = formData.get("startDate");
    const startTime = formData.get("startTime");
    const endDate = formData.get("endDate");
    const endTime = formData.get("endTime");

    feed.startTime = new Date(`${startDate}T${startTime}`);
    feed.endTime =
      !!endDate && !!endTime ? new Date(`${endDate}T${endTime}`) : undefined;

    feed.put();

    return this.redirect(FeedController.route);
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
    const feeds =
      (await this.Model.getAll("type,startTime", {
        filter: [
          "BETWEEN",
          ["feed", new Date(0)],
          ["feed", new Date(99999999999999)],
        ],
        order: this.Model.DESCENDING,
      })) || [];

    // Get the View.
    return this.view.getAll(feeds);
  }

  async del(url, id, request) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));
    const { referrer } = request;

    if (!!model == false) throw new NotFoundException(`Feed ${id} not found`);

    await model.delete();
    return this.redirect(referrer || this.constructor.route);
  }
}
