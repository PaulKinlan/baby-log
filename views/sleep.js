import { DurationBaseView } from "./duration.js";

export class SleepView extends DurationBaseView {
  async getAll(data, extras) {
    data.type = "Sleep";
    data.header = "Sleeps";

    return super.getAll(data, extras);
  }

  async get(data, extras) {
    data.header = "Sleep";
    return super.get(data, extras);
  }

  async create(data, extras) {
    data.header = "Add a Sleep";

    return super.create(data, extras);
  }

  async edit(data, extras) {
    data.header = "Update a Sleep";

    return super.edit(data, extras);
  }
}
