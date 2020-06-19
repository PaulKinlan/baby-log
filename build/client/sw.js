'use strict';

class MethodNotFound {
  constructor(message) {
    //super(message);
    this.name = "MethodNotFound";
  }
}

class Controller {
  constructor(view, model) {
    this.view = view;
    this.Model = model;
  }

  getView(url, request) {
    const { pathname } = new URL(url);
    const { method } = request;
    const route = this.constructor.route;
    const idMatch = pathname.match(`${route}/(.+)/`);

    // The instance of the controller must implement these functions;
    if (method === "GET") {
      const idMatch = pathname.match(`${route}/(.+)/`);
      if (pathname.match(`${route}/new`)) {
        return this.create(url, request);
      } else if (pathname.match(`${route}/(.+)/edit$`)) {
        return this.edit(url, idMatch[1], request);
      } else if (pathname.match(`${route}/(.+)/`)) {
        return this.get(url, idMatch[1], request);
      }
      return this.getAll(url, request);
    } else if (method === "POST") {
      if (pathname.match(`${route}/(.+)/edit$`)) {
        return this.put(url, idMatch[1], request);
      } else if (pathname.match(`${route}/(.+)/delete$`)) {
        const idMatch = pathname.match(`${route}/(.+)/`);
        return this.del(url, idMatch[1], request);
      } else if (pathname.match(`${route}/*$`)) {
        return this.post(url, request);
      }
    } else if (method === "PUT") {
      return this.put(url, idMatch[1], request);
    } else if (method === "DELETE") {
      const idMatch = pathname.match(`${route}/(.+)/`);
      return this.del(url, idMatch[1], request);
    }
  }

  redirect(url) {
    return Response.redirect(url, "302");
  }

  create(url) {
    throw new MethodNotFound("create");
  }

  edit(url) {
    throw new MethodNotFound("");
  }

  get(url) {
    throw new MethodNotFound("get");
  }

  getAll(url) {
    throw new MethodNotFound("getAll");
  }

  post(url) {
    throw new MethodNotFound("post");
  }

  del(url) {
    throw new MethodNotFound("delete");
  }
}

class NotFoundController extends Controller {
  render(url) {}
}

class App {
  get routes() {
    return routes;
  }

  registerRoute(route, controller) {
    routes.push({route, controller});
  }

  resolve(url) {
    const { pathname } = url;
    for(let {route, controller} of routes) {
      if (pathname.match(route)) {
        return controller;
      }
    }

    return routeNotFound;
  }
}

const routes = [];
const routeNotFound = new NotFoundController;

class NotFoundException extends Error {
  constructor(message) {
    super(message);
  }
}

// Safari's messed up formData on the request object.

const getFormData = async (request) => {
  const data = await request.arrayBuffer();
  const decoder = new TextDecoder("utf-8");
  const params = new URLSearchParams(`?${decoder.decode(data)}`);

  return params;
};

class BaseController extends Controller {
  async create(url, request) {
    // Show the create an entry UI.
    const { referrer } = request;
    const extras = {
      referrer: referrer,
    };
    return this.view.create(new this.Model(), extras);
  }

  async edit(url, id, request) {
    // Get the Data.
    let model = await this.Model.get(parseInt(id, 10));
    const { referrer } = request;
    const extras = {
      notFound: false,
      referrer: referrer,
    };

    if (!!model == false) {
      model = new this.Model();
      extras.notFound = true;
    }

    return this.view.edit(model, extras);
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
    const extras = {
      referrer: url,
    };

    const models =
      (await this.Model.getAll("type,startTime", {
        filter: [
          "BETWEEN",
          [this.constructor.type, new Date(0)],
          [this.constructor.type, new Date(99999999999999)],
        ],
        order: this.Model.DESCENDING,
      })) || [];

    // Get the View.
    return this.view.getAll(models, extras);
  }

  async del(url, id, request) {
    // Get the Data.
    const model = await this.Model.get(parseInt(id, 10));
    const formData = await getFormData(request);
    const redirectTo = formData.get("return-url");

    if (!!model == false) throw new NotFoundException(`Feed ${id} not found`);

    await model.delete();
    return this.redirect(redirectTo || this.constructor.route);
  }

  async put(url, id, request) {
    // Get the Data.
    let model = await this.Model.get(parseInt(id, 10));

    if (!!model == false) throw new NotFoundException(`${id} not found`);

    const formData = await getFormData(request);
    const redirectTo = formData.get("return-url");

    const values = {};

    for (let key of formData.keys()) {
      if (key === 'return-url') continue;
      values[key] = formData.get(key);
    }

    values['startTime'] = new Date(`${values['startDate']}T${values['startTime']}`);
    Object.keys(values).forEach(key => model[key] = values[key]);

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }

  async post(url, request) {
    const formData = await getFormData(request);
    const redirectTo = formData.get("return-url");

    const values = {};

    for (let key of formData.keys()) {
      if (key === 'return-url') continue;
      values[key] = formData.get(key);
    }

    values['startTime'] = new Date(`${values['startDate']}T${values['startTime']}`);

    let model = new this.Model();
    Object.keys(values).forEach(key => model[key] = values[key]);

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }
}

class DurationController extends BaseController {
  static get route() {
    return "^/$";
  }

  async post(url, request) {
    const values = {};
    const formData = await getFormData(request);
    const redirectTo = formData.get("return-url");
   
    for (let key of formData.keys()) {
      if (key === 'return-url') continue;
      values[key] = formData.get(key);
    }

    values['startTime'] = new Date(`${values['startDate']}T${values['startTime']}`);
    values['endTime'] = !!values['endDate'] && !!values['endTime'] ? new Date(`${values['endDate']}T${values['endTime']}`):  undefined;

    let model = new this.Model();
    Object.keys(values).forEach(key => model[key] = values[key]);

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
      if (key === 'return-url') continue;
      values[key] = formData.get(key);
    }

    values['startTime'] = new Date(`${values['startDate']}T${values['startTime']}`);
    values['endTime'] = !!values['endDate'] && !!values['endTime'] ? new Date(`${values['endDate']}T${values['endTime']}`):  undefined;

    Object.keys(values).forEach(key => model[key] = values[key]);

    model.put();

    return this.redirect(redirectTo || this.constructor.route);
  }
}

class FeedController extends DurationController {
  static get route() {
    return "/feeds";
  }

  static get type() {
    return "feed";
  }
}

class IndexController extends BaseController {
  static get route() {
    return "^/$";
  }

  static get type() {
    return "index";
  }

  async getAll(url) {
    const extras = {
      referrer: url,
    };

    const logs =
      (await this.Model.getAll("startTime,type", {
        filter: ["BETWEEN", [new Date(0), "a"], [new Date(9999999999999), "z"]],
        order: this.Model.DESCENDING,
      })) || [];

    return this.view.getAll(logs, extras);
  }
}

class SleepController extends DurationController {
  static get route() {
    return "/sleeps";
  }

  static get type() {
    return "sleep";
  }
}

class WeeController extends BaseController {
  static get route() {
    return "/wees";
  }

  static get type() {
    return "wee";
  }
}

class PoopController extends BaseController {
  static get route() {
    return "/poops";
  }

  static get type() {
    return "poop";
  }
}

const encoder = new TextEncoder();

const pipeInto = async (from, controller) => {
  const reader = from.getReader();

  return reader.read().then(function process(result) {
    if (result.done) {
      return;
    }
    if (!!result.value) {
      controller.enqueue(result.value);
    }
    return reader.read().then(process);
  });
};

const enqueueItem = async (val, controller) => {
  if (val instanceof globalThis.ReadableStream) {
    await pipeInto(val, controller);
  } else if (val instanceof Promise) {
    let newVal;
    newVal = await val;

    if (newVal instanceof globalThis.ReadableStream) {
      await pipeInto(newVal, controller);
    } else {
      await enqueueItem(newVal, controller);
    }
  } else {
    if (Array.isArray(val)) {
      for (let item of val) {
        await enqueueItem(item, controller);
      }
    } else if (!!val) {
      controller.enqueue(encoder.encode(val));
    }
  }
};

var html = async (strings, ...values) => {
  if ("ReadableStream" in globalThis === false) {
    // For node not supporting streams properly..... This should tree-shake away
    globalThis = {
      ...globalThis,
      ...(await Promise.resolve().then(function () { return require('./streams-caa41609.js'); })),
    };
  }
  return new globalThis.ReadableStream({
    start(controller) {
      async function push() {
        let i = 0;
        while (i < values.length) {
          let html = strings[i];
          controller.enqueue(encoder.encode(html));
          await enqueueItem(values[i], controller);

          i++;
        }
        controller.enqueue(encoder.encode(strings[i]));
        controller.close();
      }

      push();
    },
  });
};

const assets = {"/manifest.json":"/5337bd0e6c5abb0d48a69f9bd7ed84be.manifest.json","/styles/main.css":"/styles/5fff5b8cc71f4c798942ba32ce1d98f1.main.css","/images/icons/log/res/mipmap-hdpi/log.png":"/images/icons/log/res/mipmap-hdpi/7f5ddb2fa48dee066e11616aa12e8e23.log.png","/images/icons/ui/edit_24px.svg":"/images/icons/ui/552fcd66ad801255e07d7753c5b8a0d6.edit_24px.svg","/images/icons/ui/delete_24px.svg":"/images/icons/ui/ef23de4f7b0f03ca043c5503aae6ba51.delete_24px.svg","/images/icons/ui/logo.svg":"/images/icons/ui/f5f85afdb8ce4435ade5bd215d152e75.logo.svg","/images/icons/ui/remove_white_18dp.svg":"/images/icons/ui/7e8dbbeeffe7094cb2687673eecdbd5d.remove_white_18dp.svg","/images/icons/ui/add_white_18dp.svg":"/images/icons/ui/6f5fbe37367574efef3eefce6dfff3ef.add_white_18dp.svg","/images/icons/feed/res/mipmap-xxhdpi/feed.png":"/images/icons/feed/res/mipmap-xxhdpi/faabd3c7cf0f36899885540413343c1b.feed.png","/images/icons/wee/res/mipmap-xxhdpi/wee.png":"/images/icons/wee/res/mipmap-xxhdpi/58beedcd5f7c5142f758a827b12e31b4.wee.png","/images/icons/poop/res/mipmap-xxhdpi/poop.png":"/images/icons/poop/res/mipmap-xxhdpi/ac941f024144be78de74ac1c38a565e6.poop.png","/images/icons/sleep/res/mipmap-xxhdpi/sleep.png":"/images/icons/sleep/res/mipmap-xxhdpi/c99d1fc60d972f9b0979889b2554f917.sleep.png"};

const head = (data, body) => {
  return html`<!doctype html><html lang="en"><head><title>Baby Logger</title><script src="/client.js" type="module" defer="defer"></script><link rel="stylesheet" href="${assets['/styles/main.css']}"><link rel="manifest" href="${assets['/manifest.json']}"><meta name="viewport" content="width=device-width"><meta name="description" content="Akachan is a baby activity logger. It let's you track when your baby has slept, eaten, wee'd or pooped."><link rel="shortcut icon" href="${assets["/images/icons/log/res/mipmap-hdpi/log.png"]}"></head>${body}</html>`;
};

const body = (data, items) => {
  return html`<header class="${data.type.toLowerCase()}"><img src="${assets["/images/icons/ui/logo.svg"]}" alt=""><nav><a href="/" class="all" title="View all activities">All</a> <a href="/feeds" class="feed" title="View all feeds">Feeds</a> <a href="/sleeps" class="sleep" title="View all sleeps">Sleeps</a> <a href="/poops" class="poop" title="View all poops">Poops</a> <a href="/wees" class="wee" title="View all wees">Wees</a></nav></header><main><header><h2>${data.header}</h2></header><section>${items}</section></main><footer><nav id="add-nav"><a href="/feeds/new" title="Add a feed">🍼</a> <a href="/sleeps/new" title="Add a Sleep">💤</a> <a href="/poops/new" title="Add a Poop">💩</a> <a href="/wees/new" title="Add a Wee">⛲️</a></nav><a href="#remove-nav"><img src="${assets["/images/icons/ui/remove_white_18dp.svg"]}" alt=""></a><a href="#add-nav" title="Add"><img src="${assets["/images/icons/ui/add_white_18dp.svg"]}" alt=""></a></footer>`;
};

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

const aggregate = (items, extras) => {
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


    templates.push(html`<div class="row"><img src="${assets[`/images/icons/${item.type}/res/mipmap-xxhdpi/${item.type}.png`]}" alt="${item.type}"><span>${item.startTime.toLocaleTimeString(navigator.language, {
      hour: "numeric",
      minute: "numeric",
    })} ${
      item.isDuration
        ? `- ${calculateDuration(item.duration)} ${
        item.hasFinished === false ? `(Still ${item.type}ing)` : ``
        } `
        : ``
 } </span><a href="/${item.type}s/${item.id}/edit" class="edit row" title="Edit ${
      item.type
      } (${item.startTime})"><img src="${assets['/images/icons/ui/edit_24px.svg']}"></a><button class="delete row" form="deleteForm${
      item.id
      }"><img src="${assets["/images/icons/ui/delete_24px.svg"]}"></button><form id="deleteForm${
      item.id
      }" class="deleteForm" method="POST" action="/${item.type}s/${
      item.id
      }/delete"><input type="hidden" name="return-url" value="${extras.referrer}"></form></div>`);
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

const correctISOTime = (date) => {
  if (!!date == false) {
    return;
  }
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  return new Date(date - tzoffset).toISOString().replace(/:(\d+).(\d+)Z$/, "");
};

const getDate = (date) => {
  if (!!date == false) {
    return;
  }

  if (date instanceof Date === false) date = new Date(date);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}`;
};

const getTime = (date) => {
  if (!!date == false) {
    return;
  }

  if (date instanceof Date === false) date = new Date(date);
  return `${date
    .getHours()
    .toString()
    .padStart(2, 0)}:${date.getMinutes().toString().padStart(2, 0)}`;
};

if ("navigator" in globalThis === false) {
  globalThis.navigator = {
    language: "en-GB",
  };
}

const sanitize = (input = "") => {
  return input.replace("<", "&lt;").replace(">", "&gt;");
};

class DurationBaseView {
  async getAll(data, extras) {
    return html`${head(data, body(data, html`${aggregate(data, extras)}`))}`;
  }

  async get(data, extras) {
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
            ? html`<input type="hidden" name="data-loaded" value="${
                !!extras.notFound === false
              }">`
            : ""}<div>Start time: ${data.startTime.toLocaleString(lang, options)}</div><div>End time: ${!!data.endTime ? data.endTime.toLocaleString(lang, options) : ""}</div>`
      )
    )}`;
  }

  async create(data, extras) {
    return html`${head(
      data,
      body(
        data,
        html`<div class="form"><form method="POST" action="/${data.type}s"><input type="hidden" name="return-url" value="${extras.referrer}"><div><label for="startDate">Start time: <input type="date" name="startDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD" value="${getDate(correctISOTime(new Date()))}"> <input type="time" name="startTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" value="${getTime(correctISOTime(new Date()))}"></label></div><div><label for="endDate">End time: <input type="date" name="endDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD"> <input type="time" name="endTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM"></label></div><div class="notes"><label for="notes">Notes: <textarea name="notes"></textarea></label></div><div class="controls"><input type="submit" value="Save"></div></form></div>`
      )
    )}`;
  }

  async edit(data, extras) {
    return html`${head(
      data,
      body(
        data,
        html`${extras.notFound
            ? html`<input type="hidden" name="data-loaded" value="${
                !!extras.notFound === false
              }">`
            : ""}<div class="form"><form method="POST" id="deleteForm" action="/${data.type}s/${data.id}/delete"><input type="hidden" name="return-url" value="${extras.referrer}"></form><form method="POST" id="editForm" action="/${data.type}s/${data.id}/edit"><input type="hidden" name="return-url" value="${extras.referrer}"></form><div><div><label for="startDate">Start time: <input type="date" name="startDate" form="editForm" value="${getDate(
                      correctISOTime(
                        extras.notFound == false ? data.startTime : undefined
                      )
                    )}"> <input type="time" name="startTime" form="editForm" value="${getTime(
                      correctISOTime(
                        extras.notFound == false ? data.startTime : undefined
                      )
                    )}"></label></div><div><label for="endDate">End time: <input type="date" name="endDate" form="editForm" value="${getDate(
                      correctISOTime(
                        extras.notFound == false
                          ? data.endTime || new Date()
                          : undefined
                      )
                    )}"> <input type="time" name="endTime" form="editForm" value="${getTime(
                      correctISOTime(
                        extras.notFound == false
                          ? data.endTime || new Date()
                          : undefined
                      )
                    )}"></label></div><div class="notes"><label for="notes">Notes: <textarea form="editForm" name="notes">${sanitize(data.notes)}</textarea></label></div><div><div class="controls"><button form="deleteForm" class="delete"><img src="${assets["/images/icons/ui/delete_24px.svg"]}"></button> <input type="submit" form="editForm" value="Save"></div></div></div></div>`)
    )}`;
  }
}

class FeedView extends DurationBaseView {
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

if ("navigator" in globalThis === false) {
  globalThis.navigator = {
    language: "en-GB",
  };
}

const sanitize$1 = (input = "") => {
  return input.replace("<", "&lt;").replace(">", "&gt;");
};

class BaseView {
  async getAll(data, extras) {
    return html`${head(data, body(data, html`${aggregate(data, extras)}`))}`;
  }

  async get(data, extras) {
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
            ? html`<input type="hidden" name="data-loaded" value="${
                !!extras.notFound === false
              }">`
            : ""}<div>Start time: ${extras.notFound == false
              ? data.startTime.toLocaleString(lang, options)
              : ""}</div><div>End time: ${!!data.endTime ? data.endTime.toLocaleString(lang, options) : ""}</div>`
      )
    )}`;
  }

  async create(data, extras) {
    return html`${head(
      data,
      body(
        data,
        html`<div class="form"><form method="POST" action="/${data.type}s"><input type="hidden" name="return-url" value="${extras.referrer}"><div><label for="startDate">Start time: <input type="date" name="startDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD" value="${getDate(correctISOTime(new Date()))}"> <input type="time" name="startTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" value="${getTime(correctISOTime(new Date()))}"></label></div>${(!!extras.fieldsTemplates) ? extras.fieldsTemplates : undefined }<div class="notes"><label for="notes">Notes: <textarea name="notes"></textarea></label></div><div class="controls"><input type="submit" value="Save"></div></form></div>`
      )
    )}`;
  }

  async edit(data, extras) {
    return html`${head(
      data,
      body(
        data,
        html`${extras.notFound
            ? html`<input type="hidden" name="data-loaded" value="${
                !!extras.notFound === false
              }">`
            : ""}<div class="form"><form method="POST" id="deleteForm" action="/${data.type}s/${data.id}/delete"><input type="hidden" name="return-url" value="${extras.referrer}"></form><form method="POST" id="editForm" action="/${data.type}s/${data.id}/edit"><input type="hidden" name="return-url" value="${extras.referrer}"></form><div><div><label for="startDate">Start time: <input type="date" name="startDate" form="editForm" value="${getDate(
                      correctISOTime(
                        extras.notFound == false ? data.startTime : undefined
                      )
                    )}"> <input type="time" name="startTime" form="editForm" value="${getTime(
                      correctISOTime(
                        extras.notFound == false ? data.startTime : undefined
                      )
                    )}"></label></div>${(!!extras.fieldsTemplates) ? extras.fieldsTemplates : undefined }<div class="notes"><label for="notes">Notes: <textarea form="editForm" name="notes">${sanitize$1(data.notes)}</textarea></label></div><div class="controls"><button form="deleteForm" class="delete"><img src="${assets["/images/icons/ui/delete_24px.svg"]}"></button> <input type="submit" form="editForm" value="Save"></div></div></div>`
      )
    )}`;
  }
}

class IndexView extends BaseView {
  async getAll(data, extras) {
    data.type = "All";
    data.header = "All";

    return super.getAll(data, extras)
  }
}

class SleepView extends DurationBaseView {
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

class WeeView extends BaseView {
  async getAll(data, extras) {
    data.type = "Wee";
    data.header = "Wees";

    return super.getAll(data, extras);
  }

  async get(data, extras) {
    data.header = "Poop";

    return super.get(data, extras);
  }

  async create(data, extras) {
    data.header = "Add a Wee";

    return super.create(data, extras);
  }

  async edit(data, extras) {
    data.header = "Update a Wee";

    return super.edit(data, extras);
  }
}

class PoopView extends BaseView {
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

    extras.fieldsTemplates = html`<div><label for="color">Colour: <input type="color" name="color"></label></div>`;

    return super.create(data, extras);
  }

  async edit(data, extras) {
    data.header = "Update a Poop";

    extras.fieldsTemplates = html`<div><label for="color">Colour: <input type="color" form="editForm" name="color" value="${(!!data.color) ? data.color : ""}"></label></div>`;

    return super.edit(data, extras);
  }
}

/**
 *
 * Copyright 2020 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const Config = {
  name: "babylog",
  version: 6,
  stores: {
    Log: {
      properties: {
        autoIncrement: true,
        keyPath: "id",
      },
      indexes: {
        "type,startTime": { unique: true },
        "startTime,type": { unique: true },
      },
    },
  },
};

/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function ConfigManagerInstance() {
  if (typeof globalThis.ConfigManagerInstance_ !== "undefined")
    return Promise.resolve(globalThis.ConfigManagerInstance_);

  globalThis.ConfigManagerInstance_ = new ConfigManager();

  return Promise.resolve(globalThis.ConfigManagerInstance_);
}

class ConfigManager {
  constructor() {
    this.config = Config;
  }

  set config(c) {
    this.config_ = c;
  }

  get config() {
    return this.config_;
  }

  getStore(storeName) {
    return this.config_.stores[storeName];
  }
}

/**
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

function DatabaseInstance() {
  if (typeof globalThis.DatabaseInstance_ !== "undefined")
    return Promise.resolve(globalThis.DatabaseInstance_);

  globalThis.DatabaseInstance_ = new Database();

  return Promise.resolve(globalThis.DatabaseInstance_);
}

function hasSupport() {
  return "indexedDB" in globalThis;
}

const parseFilter = ([operator, ...values]) => {
  // >= 10
  // BETWEEN 10,20
  const [lower, upper] = values;

  switch (operator) {
    case "BETWEEN":
      return IDBKeyRange.bound(lower, upper, false, false);
    case "=":
      return IDBKeyRange.only(lower);
    case "<":
      return IDBKeyRange.upperBound(lower);
    case "<=":
      return IDBKeyRange.upperBound(lower, true);
    case ">":
      return IDBKeyRange.lowerBound(lower);
    case ">=":
      return IDBKeyRange.lowerBound(lower, true);
    default:
      return; // Just return if we don't recognise the combination
  }
};

class Database {
  constructor() {
    ConfigManagerInstance().then((configManager) => {
      var config = configManager.config;

      this.db_ = null;
      this.name_ = config.name;
      this.version_ = config.version;
      this.stores_ = config.stores;
    });
  }

  getStore(storeName) {
    if (!this.stores_[storeName])
      throw 'There is no store with name "' + storeName + '"';

    return this.stores_[storeName];
  }

  async open() {
    if (this.db_) return Promise.resolve(this.db_);

    return new Promise((resolve, reject) => {
      var dbOpen = indexedDB.open(this.name_, this.version_);

      dbOpen.onupgradeneeded = (e) => {
        this.db_ = e.target.result;

        var transaction = e.target.transaction;
        var storeNames = Object.keys(this.stores_);
        var storeName;

        for (var s = 0; s < storeNames.length; s++) {
          var dbStore;

          storeName = storeNames[s];

          // If the store already exists
          if (this.db_.objectStoreNames.contains(storeName)) {
            // Check to see if the store should be deleted.
            // If so delete, and if not skip to the next store.
            if (this.stores_[storeName].deleteOnUpgrade) {
              this.db_.deleteObjectStore(storeName);
              continue;
            }

            dbStore = transaction.objectStore(storeName);
          } else {
            dbStore = this.db_.createObjectStore(
              storeName,
              this.stores_[storeName].properties
            );
          }

          if (typeof this.stores_[storeName].indexes !== "undefined") {
            var indexes = this.stores_[storeName].indexes;
            var indexNames = Object.keys(indexes);
            var existingIndexNames = dbStore.indexNames;

            var index;

            for (var i = 0; i < indexNames.length; i++) {
              index = indexNames[i];
              if (existingIndexNames.contains(index) === false) {
                // Only add Index if it doesn't exist
                dbStore.createIndex(index, index.split(","), indexes[index]);
              }
            }

            // Delete indexes that are removed.
            for (var i = 0; i < dbStore.indexNames.length; i++) {
              index = dbStore.indexNames[i];
              if (indexNames.indexOf(index) < 0) {
                dbStore.deleteIndex(index);
              }
            }
          }
        }
      };

      dbOpen.onsuccess = (e) => {
        this.db_ = e.target.result;
        resolve(this.db_);
      };

      dbOpen.onerror = (e) => {
        reject(e);
      };
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (!this.db_) reject("No database connection");

      this.db_.close();
      resolve(this.db_);
    });
  }

  nuke() {
    return new Promise((resolve, reject) => {
      console.log("Nuking... " + this.name_);

      this.close();

      var dbTransaction = indexedDB.deleteDatabase(this.name_);
      dbTransaction.onsuccess = (e) => {
        console.log("Nuked...");
        resolve(e);
      };

      dbTransaction.onerror = (e) => {
        reject(e);
      };
    });
  }

  put(storeName, value, key) {
    return this.open().then((db) => {
      return new Promise((resolve, reject) => {
        var dbTransaction = db.transaction(storeName, "readwrite");
        var dbStore = dbTransaction.objectStore(storeName);
        var dbRequest = dbStore.put(value, key);

        dbTransaction.oncomplete = (e) => {
          resolve(dbRequest.result);
        };

        dbTransaction.onabort = dbTransaction.onerror = (e) => {
          reject(e);
        };
      });
    });
  }

  get(storeName, value) {
    return this.open().then((db) => {
      return new Promise((resolve, reject) => {
        var dbTransaction = db.transaction(storeName, "readonly");
        var dbStore = dbTransaction.objectStore(storeName);
        var dbStoreRequest;

        dbTransaction.oncomplete = (e) => {
          resolve(dbStoreRequest.result);
        };

        dbTransaction.onabort = dbTransaction.onerror = (e) => {
          reject(e);
        };

        dbStoreRequest = dbStore.get(value);
      });
    });
  }

  getAll(storeName, index, { filter, order, cmpFunc }) {
    return this.open().then((db) => {
      return new Promise((resolve, reject) => {
        var dbTransaction = db.transaction(storeName, "readonly");
        var dbStore = dbTransaction.objectStore(storeName);
        var dbCursor;
        var dbFilter = parseFilter(filter);

        if (typeof order !== "string") order = "next";

        if (typeof index === "string")
          dbCursor = dbStore.index(index).openCursor(dbFilter, order);
        else dbCursor = dbStore.openCursor();

        var dbResults = [];

        dbCursor.onsuccess = (e) => {
          var cursor = e.target.result;

          if (cursor) {
            if (cmpFunc === undefined || cmpFunc(cursor.value)) {
              dbResults.push({
                key: cursor.key,
                value: cursor.value,
              });
            }
            cursor.continue();
          } else {
            resolve(dbResults);
          }
        };

        dbCursor.onerror = (e) => {
          reject(e);
        };
      });
    });
  }

  delete(storeName, key) {
    return this.open().then((db) => {
      return new Promise((resolve, reject) => {
        var dbTransaction = db.transaction(storeName, "readwrite");
        var dbStore = dbTransaction.objectStore(storeName);

        dbTransaction.oncomplete = (e) => {
          resolve(e);
        };

        dbTransaction.onabort = dbTransaction.onerror = (e) => {
          reject(e);
        };

        dbStore.delete(key);
      });
    });
  }

  deleteAll(storeName) {
    return this.open().then((db) => {
      return new Promise((resolve, reject) => {
        var dbTransaction = db.transaction(storeName, "readwrite");
        var dbStore = dbTransaction.objectStore(storeName);
        var dbRequest = dbStore.clear();

        dbRequest.onsuccess = (e) => {
          resolve(e);
        };

        dbRequest.onerror = (e) => {
          reject(e);
        };
      });
    });
  }
}

/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

class Model {
  constructor(key) {
    this.key = key;
  }

  static get ASCENDING() {
    return "next";
  }

  static get DESCENDING() {
    return "prev";
  }

  static get UPDATED() {
    return "Model-updated";
  }

  static get storeName() {
    return "Model";
  }

  static nuke() {
    return DatabaseInstance()
      .then((db) => db.close())
      .then((db) => db.nuke());
  }

  static get(key) {
    if (hasSupport() === false) {
      return Promise.resolve();
    }

    if (this instanceof Model)
      Promise.reject("Can't call get on Model directly. Inherit first.");

    return (
      DatabaseInstance()
        // Do the query.
        .then((db) => db.get(this.storeName, key))

        // Wrap the result in the correct class.
        .then((result) => {
          return ConfigManagerInstance().then((configManager) => {
            var store = configManager.getStore(this.storeName);

            if (!result) return;

            var resultKey = key;

            // If the store uses a keypath then reset
            // the key back to undefined.
            if (store.properties.keyPath) resultKey = undefined;

            return new this(result, resultKey);
          });
        })
    );
  }

  /**
   * Gets all the objects from the database.
   */
  static getAll(index, { filter, order, cmpFunc }) {
    if (hasSupport() === false) {
      return Promise.resolve();
    }

    if (this instanceof Model)
      Promise.reject("Can't call getAll on Model directly. Inherit first.");

    return (
      DatabaseInstance()
        // Do the query.
        .then((db) =>
          db.getAll(this.storeName, index, { filter, order, cmpFunc })
        )

        // Wrap all the results in the correct class.
        .then((results) => {
          return ConfigManagerInstance().then((configManager) => {
            var store = configManager.getStore(this.storeName);
            var results_ = [];

            for (let result of results) {
              var key = result.key;

              // If the store uses a keypath then reset
              // the key back to undefined.
              if (store.properties.keyPath) key = undefined;

              results_.push(new this(result.value, key));
            }

            return results_;
          });
        })
    );
  }

  put() {
    return this.constructor.put(this);
  }

  /**
   * Either inserts or update depending on whether the key / keyPath is set.
   * If the keyPath is set, and a property of the value matches (in-line key)
   * then the object is updated. If the keyPath is not set and the value's key
   * is null, then the object is inserted. If the keypath is not set and the
   * value's key is set then the object is updated.
   */
  static put(value) {
    if (this instanceof Model)
      Promise.reject("Can't call put on Model directly. Inherit first.");

    return (
      DatabaseInstance()
        // Do the query.
        .then((db) => db.put(this.storeName, value, value.key))

        .then((key) => {
          return ConfigManagerInstance().then((configManager) => {
            // Inserting may provide a key. If there is no keyPath set
            // the object needs to be updated with a key value so it can
            // be altered and saved again without creating a new record.
            var store = configManager.getStore(this.storeName);

            var keyPath = store.properties.keyPath;

            if (!keyPath) value.key = key;

            return value;
          });
        })
    );
  }

  static deleteAll() {
    if (this instanceof Model)
      Promise.reject("Can't call deleteAll on Model directly. Inherit first.");

    return DatabaseInstance()
      .then((db) => db.deleteAll(this.storeName))

      .catch((e) => {
        // It may be that the store doesn't exist yet, so relax for that one.
        if (e.name !== "NotFoundError") throw e;
      });
  }

  delete() {
    return this.constructor.delete(this);
  }

  static delete(value) {
    if (this instanceof Model)
      Promise.reject("Can't call delete on Model directly. Inherit first.");

    return ConfigManagerInstance().then((configManager) => {
      // If passed the full object to delete then
      // grab its key for the delete
      if (value instanceof this) {
        var store = configManager.getStore(this.storeName);
        var keyPath = store.properties.keyPath;

        if (keyPath) value = value[keyPath];
        else value = value.key;
      }

      return DatabaseInstance().then((db) => db.delete(this.storeName, value));
    });
  }
}

class Log extends Model {
  get hasFinished() {
    return !!this.endTime;
  }

  get duration() {
    let end = this.endTime;
    if (!!end === false) {
      end = new Date();
    }
    return end - this.startTime;
  }

  constructor({ id, endTime, startTime, type, notes, isDuration = false }, key) {
    super(key);

    if (!!id) {
      this.id = id;
    }

    if (endTime) {
      this.endTime = new Date(endTime);
    }

    if (startTime) {
      this.startTime = new Date(startTime);
    }

    this.isDuration = isDuration;
    this.notes = notes;
    this.type = type;
  }

  static get storeName() {
    return "Log";
  }
}

class Feed extends Log {
  constructor(data = {}, key) {
    super({ ...data, ...{ isDuration: true } }, key);
    this.type = "feed";
  }
}

class Sleep extends Log {
  constructor(data = {}, key) {
    super({ ...data, ...{ isDuration: true } }, key);
    this.type = "sleep";
  }
}

class Wee extends Log {
  constructor(data = {}, key) {
    super(data, key);
    this.type = "wee";
  }
}

class Poop extends Log {
  constructor(data = {}, key) {
    super(data, key);
    this.type = "poop";
    this.color = data.color;
  }
}

var version = "1.0.5";

// This will be a server only route;
class StaticController extends Controller {
  static get route() {
    return ""; // Match everything.
  }

  constructor(paths) {
    super();
  }

  async get(url, id, request) {
    return caches.open(version).then((cache) => {
      return cache.match(request).then((response) => {
        if (!!response) return response;
        return fetch(url);
      });
    });
  }

  /*
    url: URL
  */
  async getAll(url, request) {
    return this.get(url, undefined, request);
  }
}

const app = new App();

app.registerRoute(
  IndexController.route,
  new IndexController(new IndexView(), Log)
);
app.registerRoute(
  FeedController.route,
  new FeedController(new FeedView(), Feed)
);
app.registerRoute(
  SleepController.route,
  new SleepController(new SleepView(), Sleep)
);
app.registerRoute(
  PoopController.route,
  new PoopController(new PoopView(), Poop)
);
app.registerRoute(WeeController.route, new WeeController(new WeeView(), Wee));
app.registerRoute(StaticController.route, new StaticController());

self.onfetch = (event) => {
  const { request } = event;
  const url = new URL(request.url);

  const controller = app.resolve(url);
  if (controller instanceof NotFoundController) {
    // Fall through to the network
    return;
  }
  const view = controller.getView(url, request);

  if (!!view) {
    return event.respondWith(
      view
        .then((output) => {
          if (output instanceof Response) return output;

          const options = {
            status: !!output ? 200 : 404,
            headers: {
              "Content-Type": "text/html; charset=utf-8",
            },
          };
          let body = output || "Not Found";

          return new Response(body, options);
        })
        .catch((ex) => {
          const options = {
            status: 404,
            headers: {
              "Content-Type": "text/html",
            },
          };
          return new Response(ex.toString(), options);
        })
    );
  }

  // If not caught by a controller, go to the network.
};

self.oninstall = async (event) => {
  // We will do something a lot more clever here soon.
  event.waitUntil(
    caches.open(version).then(async (cache) => {
      return cache.addAll(Object.values(assets));
    })
  );
  self.skipWaiting();
};

self.onactivate = (event) => {
  event.waitUntil(clients.claim());
};
//# sourceMappingURL=sw.js.map
