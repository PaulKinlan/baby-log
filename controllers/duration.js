import { BaseController } from "./base.js";
import { getFormData } from "./helpers/formData.js";

export class DurationController extends BaseController {
  static get route() {
    return "^/$";
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
    const redirectTo = formData.get("return-url");

    feed.startTime = new Date(`${startDate}T${startTime}`);
    feed.endTime =
      !!endDate && !!endTime ? new Date(`${endDate}T${endTime}`) : undefined;

    feed.put();

    return this.redirect(redirectTo || this.constructor.route);
  }
}
