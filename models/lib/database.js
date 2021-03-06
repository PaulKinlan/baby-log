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

import ConfigManagerInstance from "./configmanager.js";

export function DatabaseInstance() {
  if (typeof globalThis.DatabaseInstance_ !== "undefined")
    return Promise.resolve(globalThis.DatabaseInstance_);

  globalThis.DatabaseInstance_ = new Database();

  return Promise.resolve(globalThis.DatabaseInstance_);
}

export function hasSupport() {
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
