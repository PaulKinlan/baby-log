import html from "../lib/florawg.js";

if ("navigator" in globalThis === false)
  globalThis.navigator = {
    language: "en-GB",
  };

const calculateDuration = (ms) => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  ms -= hours * 1000 * 60 * 60;
  const minutes = Math.floor(ms / (1000 * 60));

  const hourStr = hours == 1 ? "Hour" : "Hours";
  const minuteStr = minutes == 1 ? "Minute" : "Minutes";
  return `${hours} ${hourStr} ${minutes} ${minuteStr}`;
};

export const aggregate = (items, extras) => {
  const templates = [];
  const lang = navigator.language;
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  let dayAggregate = {};
  let timeAggregate = {};
  let currentDay;
  let firstDay = true;
  for (let item of items) {
    if (item.startTime.toLocaleDateString(lang, options) != currentDay) {
      if (firstDay == false) {
        templates.push(
          html`<div>${Object.entries(dayAggregate)
            .map(([key, value]) => `${value} ${key}${value > 1 ? "s" : ""}`)
            .join(", ")}</div>`
        );
        templates.push(
          html`<div>${Object.entries(timeAggregate)
            .map(([key, value]) => `${calculateDuration(value)} ${key}ing`)
            .join(", ")}</div>`
        );

        dayAggregate = {};
      }
      firstDay = false;
      currentDay = item.startTime.toLocaleDateString(lang, options);
      templates.push(html`<h3>${currentDay}</h3>`);
    }

    if (item.type in dayAggregate == false) dayAggregate[item.type] = 0;
    dayAggregate[item.type]++;

    if (item.isDuration && item.hasFinished) {
      if (item.type in timeAggregate == false) timeAggregate[item.type] = 0;
      timeAggregate[item.type] += item.duration;
    }

    templates.push(html`<div class="row">
      <img src="/images/icons/${item.type}/res/mipmap-xxhdpi/${
      item.type
    }.png" alt="${item.type}"><span>
        ${item.startTime.toLocaleTimeString(navigator.language, {
          hour: "numeric",
          minute: "numeric",
        })} 
        ${
          item.isDuration
            ? `- ${calculateDuration(item.duration)} ${
                item.hasFinished === false ? `(Still ${item.type}ing)` : ``
              } `
            : ``
        }
        </span>
        <a href="/${item.type}s/${item.id}/edit" class="edit row" title="Edit ${
      item.type
    } (${item.startTime})">
    <img src="/images/icons/ui/edit_24px.svg"></a><button class="delete row" form="deleteForm${
      item.id
    }"><img src="/images/icons/ui/delete_24px.svg"></button>
        <form id="deleteForm${
          item.id
        }" class="deleteForm" method="POST" action="/${item.type}s/${
      item.id
    }/delete">
          <input type="hidden" name="return-url" value="${extras.referrer}">
        </form>
    </div>`);
  }
  // Add a final aggregate.
  templates.push(
    html`<div>${Object.entries(dayAggregate)
      .map(([key, value]) => `${value} ${key}${value > 1 ? "s" : ""}`)
      .join(", ")}</div>`
  );
  templates.push(
    html`<div>${Object.entries(timeAggregate)
      .map(([key, value]) => `${calculateDuration(value)} ${key}ing`)
      .join(", ")}</div>`
  );

  return templates;
};
