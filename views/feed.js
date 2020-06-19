import { DurationBaseView } from "./duration.js";

export class FeedView extends DurationBaseView {
  async getAll(data, extras) {
    data.type = "Feed";
    data.header = "Feeds";

    return super.getAll(data, extras);
  }

  async get(data, extras) {
    data.header = "Feed";
    return super.get(data, extras);
  }

  async create(data, extras) {
    data.header = "Add a Feed";

    return super.create(data, extras);
  }

  async edit(data, extras) {
    data.header = "Update a Feed";

    return super.edit(data, extras);
  }
}
