import { head } from "./partials/head.js";
import { body } from "./partials/body.js";
import html from "./lib/florawg.js";
import { aggregate } from "./helpers/aggregate.js";
import { correctISOTime, getDate, getTime } from "./helpers/timezone.js";

if ("navigator" in globalThis === false)
  globalThis.navigator = {
    language: "en-GB",
  };
export class FeedView {
  async getAll(data, extras) {
    data.type = "Feed";
    data.header = "Feeds";

    return html`${head(data, body(data, html`${aggregate(data, extras)}`))}`;
  }

  async get(data, extras) {
    data.header = "Feed";

    const lang = navigator.language;
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };

    return html`${head(
      data,
      body(
        data,
        html`${extras.notFound
            ? `<input type="hidden" name="data-loaded" value="${
                !!extras.notFound === false
              }">`
            : ""}
          <div>
            Start time:
            ${extras.notFound == false
              ? data.startTime.toLocaleString(lang, options)
              : ""}
          </div>
          <div>
            End time:
            ${!!data.endTime ? data.endTime.toLocaleString(lang, options) : ""}
          </div>
          <a href="/${data.type}s/${data.id}/edit"
            ><img src="/images/icons/ui/edit_24px.svg"
          /></a>
          <div class="row">
            <form
              method="POST"
              id="deleteForm"
              action="/${data.type}s/${data.id}/delete"
            >
              <input
                type="hidden"
                name="return-url"
                value="${extras.referrer}"
              />
            </form>
            <button form="deleteForm" class="delete">
              <img src="/images/icons/ui/delete_24px.svg" />
            </button>
          </div>`
      )
    )}`;
  }

  async create(data, extras) {
    data.header = "Add a Feed";

    return html`${head(
      data,
      body(
        data,
        html`<div class="form">
          <form method="POST" action="/${data.type}s">
            <input type="hidden" name="return-url" value="${extras.referrer}" />
            <div>
              <label for="startDate"
                >Start time:
                <input
                  type="date"
                  name="startDate"
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                  placeholder="YYYY-MM-DD"
                  value="${getDate(correctISOTime(new Date()))}"
                />
                <input
                  type="time"
                  name="startTime"
                  pattern="[0-9]{2}:[0-9]{2}"
                  placeholder="HH:MM"
                  value="${getTime(correctISOTime(new Date()))}"
                />
              </label>
            </div>
            <div>
              <label for="endDate"
                >End time:
                <input
                  type="date"
                  name="endDate"
                  pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}"
                  placeholder="YYYY-MM-DD"
                />
                <input
                  type="time"
                  name="endTime"
                  pattern="[0-9]{2}:[0-9]{2}"
                  placeholder="HH:MM"
                />
              </label>
            </div>
            <div class="controls">
              <input type="submit" value="Save" />
            </div>
          </form>
        </div>`
      )
    )}`;
  }

  async edit(data, extras) {
    data.header = "Update a Feed";

    return html`${head(
      data,
      body(
        data,
        html`<div class="form">
          ${extras.notFound
            ? `<input type="hidden" name="data-loaded" value="${
                !!extras.notFound === false
              }">`
            : ""}
          <form
            method="POST"
            id="deleteForm"
            action="/${data.type}s/${data.id}/delete"
          >
            <input type="hidden" name="return-url" value="${extras.referrer}" />
          </form>
          <form
            method="POST"
            id="editForm"
            action="/${data.type}s/${data.id}/edit"
          >
            <input type="hidden" name="return-url" value="${extras.referrer}" />
          </form>
          <div>
            <div>
              <label for="startDate"
                >Start time:
                <input
                  type="date"
                  name="startDate"
                  form="editForm"
                  value="${getDate(
                    correctISOTime(
                      extras.notFound == false ? data.startTime : undefined
                    )
                  )}"
                />
                <input
                  type="time"
                  name="startTime"
                  form="editForm"
                  value="${getTime(
                    correctISOTime(
                      extras.notFound == false ? data.startTime : undefined
                    )
                  )}"
                />
              </label>
            </div>
            <div>
              <label for="endDate"
                >End time:
                <input
                  type="date"
                  name="endDate"
                  form="editForm"
                  value="${getDate(
                    correctISOTime(
                      extras.notFound == false
                        ? data.endTime || new Date()
                        : undefined
                    )
                  )}"
                />
                <input
                  type="time"
                  name="endTime"
                  form="editForm"
                  value="${getTime(
                    correctISOTime(
                      extras.notFound == false
                        ? data.endTime || new Date()
                        : undefined
                    )
                  )}"
                />
              </label>
              <div>
                <div class="controls">
                  <button form="deleteForm" class="delete">
                    <img src="/images/icons/ui/delete_24px.svg" />
                  </button>
                  <input type="submit" form="editForm" value="Save" />
                </div>
              </div>
            </div>
          </div>
        </div> `
      )
    )}`;
  }
}
