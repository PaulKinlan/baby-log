'use strict';

class MethodNotFound {
  constructor(message) {
    //super(message);
    this.name = "MehodNotFound";
  }
}

class Controller {

  getView(url, request) {
    const { pathname } = new URL(url);
    const { method } = request;
    const route = this.constructor.route;
    const data = request.formData;

    // The instance of the controller must implement these functions;
    if (method === 'GET') {
      const idMatch = pathname.match(`${route}/(.+)/`);
      if (pathname.match(`${route}/new`)) {
        return this.create(url);
      } else if (pathname.match(`${route}/(.+)/edit`)) {
        return this.edit(url, idMatch[1]);
      } else if (pathname.match(`${route}/(.+)/`)) {
        return this.get(url, idMatch[1]);
      }
      return this.getAll(url);
    }
    else if (method === 'POST') {
      return this.post(url, request);
    }
    else if (method === 'PUT') {
      return this.put(url, request);
    }
    else if (method === 'DELETE') {
      const idMatch = pathname.match(`${route}/(.+)/`);
      return this.del(url, idMatch[1]);
    }
  }

  create(url) {
    throw new MethodNotFound('create');
  }

  edit(url) {
    throw new MethodNotFound('');
  }

  get(url) {
    throw new MethodNotFound('get');
  }

  getAll(url) {
    throw new MethodNotFound('getAll');
  }

  post(url) {
    throw new MethodNotFound('post');
  }

  del(url) {
    throw new MethodNotFound('delete');
  }
}

class NotFoundController extends Controller {
  render(url) {
    
  }
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
  } 
  else if (val instanceof Promise) {
    let newVal;
    newVal = await val;

    if (newVal instanceof globalThis.ReadableStream) {
      await pipeInto(newVal, controller);
    } else {
      await enqueueItem(newVal, controller);
    }
  }
  else {
    if (Array.isArray(val)) {
      for (let item of val) {
        await enqueueItem(item, controller);
      }
    }
    else if (!!val) {
      controller.enqueue(new TextEncoder().encode(val));
    }
  }
};

var template = async (strings, ...values) => {
  if ("ReadableStream" in globalThis === false) {
    // For node not supporting streams properly..... This should tree-shake away
    globalThis = {...globalThis, ...await Promise.resolve().then(function () { return require('./streams-6a7ac95a.js'); })};
  }
  return new globalThis.ReadableStream({
    start(controller) {
      async function push() {
        let i = 0;
        while (i < values.length) {
          let html = strings[i];
          controller.enqueue(new TextEncoder().encode(html));
          
          await enqueueItem(values[i], controller);

          i++;
        }
        controller.enqueue(new TextEncoder().encode(strings[i]));
        controller.close();
      }

      push();
    }
  });
};

var head = (data) => {
  return template`<!DOCTYPE html>
  <html>
    <head>
    <title>${data.newTitle}</title>
    <script src="/client/client.js" type="module"></script>
    </head>
    <body>
    <header>
      <a href="/feeds">Feeds</a>
    </header>
    `;
};

class IndexView {
  async render(data) {
    return template`${head(data)}
    <h1>Baby log</h1>
    </body>
    </html>`;
  }
}

class IndexController extends Controller {
  static get route() {
    return '/$'
  }

  getAll(url) {
    const view = new IndexView();
    const output = view.render({title: "Ay....", newTitle: "Testing"});
    return output;
  }

  get(url) {
    const view = new IndexView();
    const output = view.render({title: "Ay....", newTitle: "Testing"});
    return output;
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
  name: 'babylog',
  version: 1,
  stores: {
    'Log': {
      properties: {
        autoIncrement: true,
        keyPath: 'id'
      },
      indexes: {
        startTime: { unique: false }
      }
    }
  }
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

function ConfigManagerInstance () {

  if (typeof globalThis.ConfigManagerInstance_ !== 'undefined')
    return Promise.resolve(globalThis.ConfigManagerInstance_);

  globalThis.ConfigManagerInstance_ = new ConfigManager();

  return Promise.resolve(globalThis.ConfigManagerInstance_);
}

class ConfigManager {

  constructor () {
    this.config = Config;
  }

  set config (c) {
    this.config_ = c;
  }

  get config () {
    return this.config_;
  }

  getStore (storeName) {
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

function DatabaseInstance () {

  if (typeof globalThis.DatabaseInstance_ !== 'undefined')
    return Promise.resolve(globalThis.DatabaseInstance_);

  globalThis.DatabaseInstance_ = new Database();

  return Promise.resolve(globalThis.DatabaseInstance_);
}

function hasSupport() {
  return ('indexedDB' in globalThis);
 }

class Database {

  constructor () {

    ConfigManagerInstance().then( (configManager) => {

      var config = configManager.config;

      this.db_ = null;
      this.name_ = config.name;
      this.version_ = config.version;
      this.stores_ = config.stores;

    });
  }

  getStore (storeName) {

    if (!this.stores_[storeName])
      throw 'There is no store with name "' + storeName + '"';

    return this.stores_[storeName];
  }

  async open () {
    if (this.db_)
      return Promise.resolve(this.db_);

    return new Promise((resolve, reject) => {

      var dbOpen = indexedDB.open(this.name_, this.version_);

      dbOpen.onupgradeneeded = (e) => {

        this.db_ = e.target.result;

        var storeNames = Object.keys(this.stores_);
        var storeName;

        for (var s = 0; s < storeNames.length; s++) {

          storeName = storeNames[s];

          // If the store already exists
          if (this.db_.objectStoreNames.contains(storeName)) {

            // Check to see if the store should be deleted.
            // If so delete, and if not skip to the next store.
            if (this.stores_[storeName].deleteOnUpgrade)
              this.db_.deleteObjectStore(storeName);
            else
              continue;
          }

          var dbStore = this.db_.createObjectStore(
            storeName,
            this.stores_[storeName].properties
          );

          if (typeof this.stores_[storeName].indexes !== 'undefined') {
            var indexes = this.stores_[storeName].indexes;
            var indexNames = Object.keys(indexes);
            var index;

            for (var i = 0; i < indexNames.length; i++) {
              index = indexNames[i];
              dbStore.createIndex(index, index, indexes[index]);
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

  close () {

    return new Promise((resolve, reject) => {

      if (!this.db_)
        reject('No database connection');

      this.db_.close();
      resolve(this.db_);

    });
  }

  nuke () {
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

  put (storeName, value, key) {

    return this.open().then((db) => {

      return new Promise((resolve, reject) => {

        var dbTransaction = db.transaction(storeName, 'readwrite');
        var dbStore = dbTransaction.objectStore(storeName);
        var dbRequest = dbStore.put(value, key);

        dbTransaction.oncomplete = (e) => {
          resolve(dbRequest.result);
        };

        dbTransaction.onabort =
        dbTransaction.onerror = (e) => {
          reject(e);
        };

      });

    });

  }

  get (storeName, value) {

    return this.open().then((db) => {

      return new Promise((resolve, reject) => {

        var dbTransaction = db.transaction(storeName, 'readonly');
        var dbStore = dbTransaction.objectStore(storeName);
        var dbStoreRequest;

        dbTransaction.oncomplete = (e) => {
          resolve(dbStoreRequest.result);
        };

        dbTransaction.onabort =
        dbTransaction.onerror = (e) => {
          reject(e);
        };

        dbStoreRequest = dbStore.get(value);

      });

    });

  }

  getAll (storeName, index, order) {

    return this.open().then((db) => {

      return new Promise((resolve, reject) => {

        var dbTransaction = db.transaction(storeName, 'readonly');
        var dbStore = dbTransaction.objectStore(storeName);
        var dbCursor;

        if (typeof order !== 'string')
          order = 'next';

        if (typeof index === 'string')
          dbCursor = dbStore.index(index).openCursor(null, order);
        else
          dbCursor = dbStore.openCursor();

        var dbResults = [];

        dbCursor.onsuccess = (e) => {
          var cursor = e.target.result;

          if (cursor) {
            dbResults.push({
              key: cursor.key,
              value: cursor.value
            });
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

  delete (storeName, key) {
    return this.open().then((db) => {

      return new Promise((resolve, reject) => {

        var dbTransaction = db.transaction(storeName, 'readwrite');
        var dbStore = dbTransaction.objectStore(storeName);

        dbTransaction.oncomplete = (e) => {
          resolve(e);
        };

        dbTransaction.onabort =
        dbTransaction.onerror = (e) => {
          reject(e);
        };

        dbStore.delete(key);

      });
    });
  }

  deleteAll (storeName) {

    return this.open().then((db) => {

      return new Promise((resolve, reject) => {

        var dbTransaction = db.transaction(storeName, 'readwrite');
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
    return 'next';
  }

  static get DESCENDING() {
    return 'prev';
  }

  static get UPDATED() {
    return 'Model-updated';
  }

  static get storeName() {
    return 'Model';
  }

  static nuke() {
    return DatabaseInstance()
      .then(db => db.close())
      .then(db => db.nuke());
  }

  static get(key) {

    if (hasSupport() === false) {
      return Promise.resolve();
    }

    if (this instanceof Model)
      Promise.reject("Can't call get on Model directly. Inherit first.");

    return DatabaseInstance()

      // Do the query.
      .then(db => db.get(this.storeName, key))

      // Wrap the result in the correct class.
      .then(result => {

        return ConfigManagerInstance().then(configManager => {

          var store = configManager.getStore(this.storeName);

          if (!result)
            return;

          var resultKey = key;

          // If the store uses a keypath then reset
          // the key back to undefined.
          if (store.properties.keyPath)
            resultKey = undefined;

          return new this(result, resultKey);

        });

      });

  }

  /**
   * Gets all the objects from the database.
   */
  static getAll(index, order) {

    if (hasSupport() === false) {
      return Promise.resolve();
    }

    if (this instanceof Model)
      Promise.reject("Can't call getAll on Model directly. Inherit first.");

    return DatabaseInstance()

      // Do the query.
      .then(db => db.getAll(this.storeName, index, order))

      // Wrap all the results in the correct class.
      .then(results => {

        return ConfigManagerInstance().then(configManager => {

          var store = configManager.getStore(this.storeName);
          var results_ = [];

          for (let result of results) {

            var key = result.key;

            // If the store uses a keypath then reset
            // the key back to undefined.
            if (store.properties.keyPath)
              key = undefined;

            results_.push(new this(result.value, key));
          }

          return results_;

        });

      });

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

    return DatabaseInstance()

      // Do the query.
      .then(db => db.put(this.storeName, value, value.key))

      .then(key => {

        return ConfigManagerInstance().then(configManager => {

          // Inserting may provide a key. If there is no keyPath set
          // the object needs to be updated with a key value so it can
          // be altered and saved again without creating a new record.
          var store = configManager.getStore(this.storeName);

          var keyPath =
            store.properties.keyPath;

          if (!keyPath)
            value.key = key;

          return value;

        })

      });

  }

  static deleteAll() {

    if (this instanceof Model)
      Promise.reject("Can't call deleteAll on Model directly. Inherit first.");

    return DatabaseInstance()

      .then(db => db.deleteAll(this.storeName))

      .catch(e => {
        // It may be that the store doesn't exist yet, so relax for that one.
        if (e.name !== 'NotFoundError')
          throw e;
      });

  }

  delete() {
    return this.constructor.delete(this);
  }

  static delete(value) {

    if (this instanceof Model)
      Promise.reject("Can't call delete on Model directly. Inherit first.");

    return ConfigManagerInstance().then(configManager => {

      // If passed the full object to delete then
      // grab its key for the delete
      if (value instanceof this) {

        var store = configManager.getStore(this.storeName);
        var keyPath = store.properties.keyPath;

        if (keyPath)
          value = value[keyPath];
        else
          value = value.key;
      }

      return DatabaseInstance()

        .then(db => db.delete(this.storeName, value));

    });
  }
}

class Log extends Model {
  get startTime() {
    return this._startTime;
  }

  get endTime() {
    return this._endTime;
  }

  get duration() {
    return this._startTime - this._endTime;
  }

  get type() {
    return this._type;
  }

  constructor(data = {}, key) {
    super(key);

    this._startTime = data.startTime || Date.now();
    this._type = data.type;
  }

  static get storeName() {
    return 'Log';
  }
}

class Feed extends Log {

  get type() {
    return this._type;
  }

  constructor(data, key) {
    super(data, key);
    this._type = 'feed';
  }
}

class FeedView {
  async getAll(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <a href="/feeds/new">Create</a>
    ${
      data.map(item => template`<div>${item.startTime} - ${item.endTime} </div>`)
    }
    </body>
    </html>`;
  }

  async get(data) {
    return template`${head(data)}
    <h1>Feed ${data.id}</h1>
      <label for=startTime>Start time: <input type="datetime" name="startTime" value="${new Date}"></label>
      <label for=endTime>End time:<input type="datetime" name="endTime"></label>
    </body>
    </html>`;
  }

  async create(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <form method="POST" action="/feeds">
      <label for=startTime>Start time: <input type="datetime" name="startTime" value="${new Date}"></label>
      <label for=endTime>End time:<input type="datetime" name="endTime"></label>
      <input type="submit">
    </form>
    </body>
    </html>`;
  }

  async edit(data) {
    return template`${head(data)}
    <h1>Feeds</h1>
    <form method="PUT" action="/feeds/${data.id}/edit">
      <label for=startTime>Start time: <input type="datetime" name="startTime" value="${this.startTime}"></label>
      <label for=endTime>End time:<input type="datetime" name="endTime" value="${this.endTime}"></label>
      <input type="submit">
    </form>
    </body>
    </html>`;
  }
}

class FeedController extends Controller {
  static get route() {
    return '/feeds';
  }

  async create(url, request) {
    // Get the Data.
    const feedView = new FeedView();

    // Save the data.

    return feedView.create(new Feed);
  }

  async edit(url) {
    // Get the Data.
    const feed = Feed.getAll('startTime', Feed.DESCENDING);
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.edit(feed);
  }

  async get(url) {
    // Get the Data.
    const feed = Feed.getAll('startTime', Feed.DESCENDING);
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.get(feed);
  }

  async getAll(url) {
    // Get the Data.
    const feeds = await Feed.getAll('startTime', Feed.DESCENDING) || [];
  
    // Get the View.
    const feedView = new FeedView();

    return feedView.getAll(feeds);
  }
}

const app = new App();

app.registerRoute(IndexController.route, new IndexController);
app.registerRoute(FeedController.route, new FeedController);

self.onfetch = (event) => {
  const {request} = event;
  const url = new URL(request.url);

  const controller = app.resolve(url);
  if (controller instanceof NotFoundController) {
    return;
  }
  const view = controller.getView(url, request);
 
  if (!!view) {
    return event.respondWith(view.then(output => {
      const options = {
        status: (!!output)? 200: 404,
        headers: {
          'Content-Type': 'text/html'
        }
      };
      let body = output || "Not Found";
  
      return new Response(body, options);
    })); 
  }

  // If not caught by a controller, go to the network.
};
