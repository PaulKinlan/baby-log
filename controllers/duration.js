import { BaseController } from "./base.js";
import { getFormData } from "./helpers/formData.js";

export class DurationController extends BaseController {
  static get route() {
    return "^/$";
  }

  async post(url, request) {
    const values = {};
    const formData = await getFormData(request);
    const redirectTo = formData.get("return-url");

    for (let key of formData.keys()) {
      if (key === "return-url") continue;
      values[key] = formData.get(key);
    }

    values["startTime"] = new Date(
      `${values["startDate"]}T${values["startTime"]}`
    );
    values["endTime"] =
      !!values["endDate"] && !!values["endTime"]
        ? new Date(`${values["endDate"]}T${values["endTime"]}`)
        : undefined;

    let model = new this.Model();
    Object.keys(values).forEach((key) => (model[key] = values[key]));

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }

  async put(url, id, request) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));

    const values = {};
    const formData = await getFormData(request);
    const redirectTo = formData.get("return-url");

    for (let key of formData.keys()) {
      if (key === "return-url") continue;
      values[key] = formData.get(key);
    }

    values["startTime"] = new Date(
      `${values["startDate"]}T${values["startTime"]}`
    );
    values["endTime"] =
      !!values["endDate"] && !!values["endTime"]
        ? new Date(`${values["endDate"]}T${values["endTime"]}`)
        : undefined;

    Object.keys(values).forEach((key) => (model[key] = values[key]));

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }
}
