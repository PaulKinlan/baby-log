import { BaseView } from "./base.js";
import html from "./lib/florawg.js";

export class PoopView extends BaseView {
  async getAll(data, extras) {
    data.type = "Poop";
    data.header = "Poops";

    return super.getAll(data, extras);
  }

  async get(data, extras) {
    data.header = "Poop";

    return super.get(data, extras);
  }

  async create(data, extras) {
    data.header = "Add a Poop";

    extras.fieldsTemplates = html`<div>
      <label for="color">Colour: <input type="color" name="color" /></label>
    </div>`;

    return super.create(data, extras);
  }

  async edit(data, extras) {
    data.header = "Update a Poop";

    extras.fieldsTemplates = html`<div>
      <label for="color"
        >Colour:
        <input
          type="color"
          form="editForm"
          name="color"
          value="${!!data.color ? data.color : ""}"
      /></label>
    </div>`;

    return super.edit(data, extras);
  }
}
