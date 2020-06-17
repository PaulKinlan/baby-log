import { BaseController } from "./base.js";
import { getFormData } from "./helpers/formData.js";

export class DurationController extends BaseController {
  static get route() {
    return "^/$";
  }

  async post(url, request) {
    const formData = await getFormData(request);

    const startDate = formData.get("startDate");
    const startTime = formData.get("startTime");
    const endDate = formData.get("endDate");
    const endTime = formData.get("endTime");
    const redirectTo = formData.get("return-url");

    const model = new this.Model();

    model.startTime = new Date(`${startDate}T${startTime}`);
    model.endTime =
      !!endDate && !!endTime ? new Date(`${endDate}T${endTime}`) : undefined;

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }

  async put(url, id, request) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));

    if (!!model == false) {
      return this.redirect(FeedController.route);
    }

    const formData = await getFormData(request);

    const startDate = formData.get("startDate");
    const startTime = formData.get("startTime");
    const endDate = formData.get("endDate");
    const endTime = formData.get("endTime");
    const redirectTo = formData.get("return-url");

    model.startTime = new Date(`${startDate}T${startTime}`);
    model.endTime =
      !!endDate && !!endTime ? new Date(`${endDate}T${endTime}`) : undefined;

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }
}
