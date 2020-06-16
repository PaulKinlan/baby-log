"use strict";class e{constructor(e){this.name="MethodNotFound"}}class t{constructor(e,t){this.view=e,this.Model=t}getView(e,t){const{pathname:r}=new URL(e),{method:n}=t,i=this.constructor.route,a=r.match(i+"/(.+)/");if("GET"===n){const n=r.match(i+"/(.+)/");return r.match(i+"/new")?this.create(e,t):r.match(i+"/(.+)/edit$")?this.edit(e,n[1],t):r.match(i+"/(.+)/")?this.get(e,n[1],t):this.getAll(e,t)}if("POST"===n){if(r.match(i+"/(.+)/edit$"))return this.put(e,a[1],t);if(r.match(i+"/(.+)/delete$")){const n=r.match(i+"/(.+)/");return this.del(e,n[1],t)}if(r.match(i+"/*$"))return this.post(e,t)}else{if("PUT"===n)return this.put(e,a[1],t);if("DELETE"===n){const n=r.match(i+"/(.+)/");return this.del(e,n[1],t)}}}redirect(e){return Response.redirect(e,"302")}create(t){throw new e("create")}edit(t){throw new e("")}get(t){throw new e("get")}getAll(t){throw new e("getAll")}post(t){throw new e("post")}del(t){throw new e("delete")}}class r extends t{render(e){}}const n=[],i=new r;class a extends Error{constructor(e){super(e)}}const s=async e=>{const t=await e.arrayBuffer(),r=new TextDecoder("utf-8");return new URLSearchParams("?"+r.decode(t))};class o extends t{async create(e,t){const{referrer:r}=t,n={referrer:r};return this.view.create(new this.Model,n)}async edit(e,t,r){let n=await this.Model.get(parseInt(t,10));const{referrer:i}=r,a={notFound:!1,referrer:i};return 0==!!n&&(n=new this.Model,a.notFound=!0),this.view.edit(n,a)}async get(e,t){const r=await this.Model.get(parseInt(t,10)),n={notFound:!1};return 0==!!r&&(r=new this.Model,n.notFound=!0),this.view.get(r,n)}async getAll(e){const t={referrer:e},r=await this.Model.getAll("type,startTime",{filter:["BETWEEN",[this.constructor.type,new Date(0)],[this.constructor.type,new Date(99999999999999)]],order:this.Model.DESCENDING})||[];return this.view.getAll(r,t)}async del(e,t,r){const n=await this.Model.get(parseInt(t,10)),i=(await s(r)).get("return-url");if(0==!!n)throw new a(`Feed ${t} not found`);return await n.delete(),this.redirect(i||this.constructor.route)}async put(e,t,r){const n=await this.Model.get(parseInt(t,10));if(0==!!n)throw new a(t+" not found");const i=await s(r),o=i.get("startDate"),d=i.get("startTime"),l=i.get("return-url");return n.startTime=new Date(`${o}T${d}`),n.put(),this.redirect(l||this.constructor.route)}async post(e,t){const r=await s(t),n=r.get("startDate"),i=r.get("startTime"),a=r.get("return-url"),o=`${n}T${i}`;return new this.Model({startTime:o}).put(),this.redirect(a||this.constructor.route)}}class d extends o{static get route(){return"^/$"}async put(e,t,r){const n=await this.Model.get(parseInt(t,10));if(0==!!n)return this.redirect(FeedController.route);const i=await s(r),a=i.get("startDate"),o=i.get("startTime"),d=i.get("endDate"),l=i.get("endTime"),u=i.get("return-url");return n.startTime=new Date(`${a}T${o}`),n.endTime=d&&l?new Date(`${d}T${l}`):void 0,n.put(),this.redirect(u||this.constructor.route)}}class l extends d{static get route(){return"/feeds"}static get type(){return"feed"}}class u extends o{static get route(){return"^/$"}static get type(){return"index"}async getAll(e){const t={referrer:e},r=await this.Model.getAll("startTime,type",{filter:["BETWEEN",[new Date(0),"a"],[new Date(9999999999999),"z"]],order:this.Model.DESCENDING})||[];return this.view.getAll(r,t)}}class c extends d{static get route(){return"/sleeps"}static get type(){return"sleep"}}class m extends o{static get route(){return"/wees"}static get type(){return"wee"}}class p extends o{static get route(){return"/poops"}static get type(){return"poop"}}const h=new TextEncoder,g=async(e,t)=>{const r=e.getReader();return r.read().then((function e(n){if(!n.done)return n.value&&t.enqueue(n.value),r.read().then(e)}))},v=async(e,t)=>{if(e instanceof globalThis.ReadableStream)await g(e,t);else if(e instanceof Promise){let r;r=await e,r instanceof globalThis.ReadableStream?await g(r,t):await v(r,t)}else if(Array.isArray(e))for(let r of e)await v(r,t);else e&&t.enqueue(h.encode(e))};var f=async(e,...t)=>("ReadableStream"in globalThis==!1&&(globalThis={...globalThis,...await Promise.resolve().then((function(){return require("./streams-caa41609.js")}))}),new globalThis.ReadableStream({start(r){!async function(){let n=0;for(;n<t.length;){let i=e[n];r.enqueue(h.encode(i)),await v(t[n],r),n++}r.enqueue(h.encode(e[n])),r.close()}()}}));const y=(e,t)=>f`<!doctype html><html><head><title>Baby Logger</title><script src="/client.js" type="module" defer="defer"></script><link rel="stylesheet" href="/styles/main.css"><link rel="manifest" href="/manifest.json"><link rel="shortcut icon" href="/images/icons/log/res/mipmap-hdpi/log.png"><meta name="viewport" content="width=device-width"></head>${t}</html>`,$=(e,t)=>f`<header class="${e.type.toLowerCase()}"><img src="/images/icons/log/res/mipmap-xhdpi/log.png"><nav><a href="/" class="all">All</a> <a href="/feeds" class="feed">Feeds</a> <a href="/sleeps" class="sleep">Sleeps</a> <a href="/poops" class="poop">Poops</a> <a href="/wees" class="wee">Wees</a></nav></header><main><header><h2>${e.header}</h2></header><section>${t}</section></main><footer><nav id="add-nav"><a href="/feeds/new" title="Add a feed">🍼</a> <a href="/sleeps/new" title="Add a Sleep">💤</a> <a href="/poops/new" title="Add a Poop">💩</a> <a href="/wees/new" title="Add a Wee">⛲️</a></nav><a href="#remove-nav"><img src="/images/icons/ui/remove_white_18dp.svg"></a><a href="#add-nav"><img src="/images/icons/ui/add_white_18dp.svg" title="Add"></a></footer>`;"navigator"in globalThis==!1&&(globalThis.navigator={language:"en-GB"});const w=e=>{const t=Math.floor(e/36e5);e-=1e3*t*60*60;const r=Math.floor(e/6e4);return`${t} ${1==t?"Hour":"Hours"} ${r} ${1==r?"Minute":"Minutes"}`},T=(e,t)=>{const r=[],n=navigator.language,i={weekday:"long",year:"numeric",month:"long",day:"numeric"};let a,s={},o={},d=!0;for(let l of e)l.startTime.toLocaleDateString(n,i)!=a&&(0==d&&(r.push(f`<div>${Object.entries(s).map(([e,t])=>`${t} ${e}${t>1?"s":""}`).join(", ")}</div>`),r.push(f`<div>${Object.entries(o).map(([e,t])=>`${w(t)} ${e}ing`).join(", ")}</div>`),s={}),d=!1,a=l.startTime.toLocaleDateString(n,i),r.push(f`<h3>${a}</h3>`)),l.type in s==0&&(s[l.type]=0),s[l.type]++,l.isDuration&&l.hasFinished&&(l.type in o==0&&(o[l.type]=0),o[l.type]+=l.duration),r.push(f`<div class="row">
      <img src="/images/icons/${l.type}/res/mipmap-xxhdpi/${l.type}.png" alt="${l.type}"><span>
        ${l.startTime.toLocaleTimeString(navigator.language,{hour:"numeric",minute:"numeric"})} 
        ${l.isDuration?`- ${w(l.duration)} ${!1===l.hasFinished?`(Still ${l.type}ing)`:""} `:""}
        </span>
        <a href="/${l.type}s/${l.id}/edit" class="edit row" title="Edit ${l.type} (${l.startTime})">
    <img src="/images/icons/ui/edit_24px.svg"></a><button class="delete row" form="deleteForm${l.id}"><img src="/images/icons/ui/delete_24px.svg"></button>
        <form id="deleteForm${l.id}" class="deleteForm" method="POST" action="/${l.type}s/${l.id}/delete">
          <input type="hidden" name="return-url" value="${t.referrer}">
        </form>
    </div>`);return r.push(f`<div>${Object.entries(s).map(([e,t])=>`${t} ${e}${t>1?"s":""}`).join(", ")}</div>`),r.push(f`<div>${Object.entries(o).map(([e,t])=>`${w(t)} ${e}ing`).join(", ")}</div>`),r},b=e=>{if(0==!!e)return;const t=6e4*(new Date).getTimezoneOffset();return new Date(e-t).toISOString().replace(/:(\d+).(\d+)Z$/,"")},D=e=>{if(0!=!!e)return e instanceof Date==!1&&(e=new Date(e)),`${e.getFullYear()}-${(e.getMonth()+1).toString().padStart(2,0)}-${e.getDate().toString().padStart(2,0)}`},S=e=>{if(0!=!!e)return e instanceof Date==!1&&(e=new Date(e)),`${e.getHours().toString().padStart(2,0)}:${e.getMinutes().toString().padStart(2,0)}`};"navigator"in globalThis==!1&&(globalThis.navigator={language:"en-GB"});const F={name:"babylog",version:6,stores:{Log:{properties:{autoIncrement:!0,keyPath:"id"},indexes:{"type,startTime":{unique:!0},"startTime,type":{unique:!0}}}}};function x(){return void 0!==globalThis.ConfigManagerInstance_||(globalThis.ConfigManagerInstance_=new M),Promise.resolve(globalThis.ConfigManagerInstance_)}class M{constructor(){this.config=F}set config(e){this.config_=e}get config(){return this.config_}getStore(e){return this.config_.stores[e]}}function _(){return void 0!==globalThis.DatabaseInstance_||(globalThis.DatabaseInstance_=new A),Promise.resolve(globalThis.DatabaseInstance_)}function P(){return"indexedDB"in globalThis}class A{constructor(){x().then(e=>{var t=e.config;this.db_=null,this.name_=t.name,this.version_=t.version,this.stores_=t.stores})}getStore(e){if(!this.stores_[e])throw'There is no store with name "'+e+'"';return this.stores_[e]}async open(){return this.db_?Promise.resolve(this.db_):new Promise((e,t)=>{var r=indexedDB.open(this.name_,this.version_);r.onupgradeneeded=e=>{this.db_=e.target.result;for(var t,r=e.target.transaction,n=Object.keys(this.stores_),i=0;i<n.length;i++){var a;if(t=n[i],this.db_.objectStoreNames.contains(t)){if(this.stores_[t].deleteOnUpgrade){this.db_.deleteObjectStore(t);continue}a=r.objectStore(t)}else a=this.db_.createObjectStore(t,this.stores_[t].properties);if(void 0!==this.stores_[t].indexes){for(var s,o=this.stores_[t].indexes,d=Object.keys(o),l=a.indexNames,u=0;u<d.length;u++)s=d[u],!1===l.contains(s)&&a.createIndex(s,s.split(","),o[s]);for(u=0;u<a.indexNames.length;u++)s=a.indexNames[u],d.indexOf(s)<0&&a.deleteIndex(s)}}},r.onsuccess=t=>{this.db_=t.target.result,e(this.db_)},r.onerror=e=>{t(e)}})}close(){return new Promise((e,t)=>{this.db_||t("No database connection"),this.db_.close(),e(this.db_)})}nuke(){return new Promise((e,t)=>{console.log("Nuking... "+this.name_),this.close();var r=indexedDB.deleteDatabase(this.name_);r.onsuccess=t=>{console.log("Nuked..."),e(t)},r.onerror=e=>{t(e)}})}put(e,t,r){return this.open().then(n=>new Promise((i,a)=>{var s=n.transaction(e,"readwrite"),o=s.objectStore(e).put(t,r);s.oncomplete=e=>{i(o.result)},s.onabort=s.onerror=e=>{a(e)}}))}get(e,t){return this.open().then(r=>new Promise((n,i)=>{var a,s=r.transaction(e,"readonly"),o=s.objectStore(e);s.oncomplete=e=>{n(a.result)},s.onabort=s.onerror=e=>{i(e)},a=o.get(t)}))}getAll(e,t,{filter:r,order:n,cmpFunc:i}){return this.open().then(a=>new Promise((s,o)=>{var d,l=a.transaction(e,"readonly").objectStore(e),u=(([e,...t])=>{const[r,n]=t;switch(e){case"BETWEEN":return IDBKeyRange.bound(r,n,!1,!1);case"=":return IDBKeyRange.only(r);case"<":return IDBKeyRange.upperBound(r);case"<=":return IDBKeyRange.upperBound(r,!0);case">":return IDBKeyRange.lowerBound(r);case">=":return IDBKeyRange.lowerBound(r,!0);default:return}})(r);"string"!=typeof n&&(n="next"),d="string"==typeof t?l.index(t).openCursor(u,n):l.openCursor();var c=[];d.onsuccess=e=>{var t=e.target.result;t?((void 0===i||i(t.value))&&c.push({key:t.key,value:t.value}),t.continue()):s(c)},d.onerror=e=>{o(e)}}))}delete(e,t){return this.open().then(r=>new Promise((n,i)=>{var a=r.transaction(e,"readwrite"),s=a.objectStore(e);a.oncomplete=e=>{n(e)},a.onabort=a.onerror=e=>{i(e)},s.delete(t)}))}deleteAll(e){return this.open().then(t=>new Promise((r,n)=>{var i=t.transaction(e,"readwrite").objectStore(e).clear();i.onsuccess=e=>{r(e)},i.onerror=e=>{n(e)}}))}}class E{constructor(e){this.key=e}static get ASCENDING(){return"next"}static get DESCENDING(){return"prev"}static get UPDATED(){return"Model-updated"}static get storeName(){return"Model"}static nuke(){return _().then(e=>e.close()).then(e=>e.nuke())}static get(e){return!1===P()?Promise.resolve():(this instanceof E&&Promise.reject("Can't call get on Model directly. Inherit first."),_().then(t=>t.get(this.storeName,e)).then(t=>x().then(r=>{var n=r.getStore(this.storeName);if(t){var i=e;return n.properties.keyPath&&(i=void 0),new this(t,i)}})))}static getAll(e,{filter:t,order:r,cmpFunc:n}){return!1===P()?Promise.resolve():(this instanceof E&&Promise.reject("Can't call getAll on Model directly. Inherit first."),_().then(i=>i.getAll(this.storeName,e,{filter:t,order:r,cmpFunc:n})).then(e=>x().then(t=>{var r=t.getStore(this.storeName),n=[];for(let t of e){var i=t.key;r.properties.keyPath&&(i=void 0),n.push(new this(t.value,i))}return n})))}put(){return this.constructor.put(this)}static put(e){return this instanceof E&&Promise.reject("Can't call put on Model directly. Inherit first."),_().then(t=>t.put(this.storeName,e,e.key)).then(t=>x().then(r=>(r.getStore(this.storeName).properties.keyPath||(e.key=t),e)))}static deleteAll(){return this instanceof E&&Promise.reject("Can't call deleteAll on Model directly. Inherit first."),_().then(e=>e.deleteAll(this.storeName)).catch(e=>{if("NotFoundError"!==e.name)throw e})}delete(){return this.constructor.delete(this)}static delete(e){return this instanceof E&&Promise.reject("Can't call delete on Model directly. Inherit first."),x().then(t=>{if(e instanceof this){var r=t.getStore(this.storeName).properties.keyPath;e=r?e[r]:e.key}return _().then(t=>t.delete(this.storeName,e))})}}class N extends E{get hasFinished(){return!!this.endTime}get duration(){let e=this.endTime;return!1==!!e&&(e=new Date),e-this.startTime}constructor({id:e,endTime:t,startTime:r,type:n,isDuration:i=!1},a){super(a),e&&(this.id=e),t&&(this.endTime=new Date(t)),r&&(this.startTime=new Date(r)),this.isDuration=i,this.type=n}static get storeName(){return"Log"}}class j extends t{static get route(){return""}constructor(e){super()}async get(e,t,r){return caches.open("1.0.2").then(t=>t.match(r).then(t=>t||fetch(e)))}async getAll(e,t){return this.get(e,void 0,t)}}var I=["/client.js","/manifest.json","/sw-manifest.json","/images/icons/feed/res/mipmap-hdpi/feed.png","/images/icons/feed/res/mipmap-mdpi/feed.png","/images/icons/feed/res/mipmap-xhdpi/feed.png","/images/icons/feed/res/mipmap-xxhdpi/feed.png","/images/icons/log/res/mipmap-hdpi/log.png","/images/icons/log/res/mipmap-mdpi/log.png","/images/icons/log/res/mipmap-xhdpi/log.png","/images/icons/log/res/mipmap-xxhdpi/log.png","/images/icons/poop/res/mipmap-hdpi/poop.png","/images/icons/poop/res/mipmap-mdpi/poop.png","/images/icons/poop/res/mipmap-xhdpi/poop.png","/images/icons/poop/res/mipmap-xxhdpi/poop.png","/images/icons/sleep/res/mipmap-hdpi/sleep.png","/images/icons/sleep/res/mipmap-mdpi/sleep.png","/images/icons/sleep/res/mipmap-xhdpi/sleep.png","/images/icons/sleep/res/mipmap-xxhdpi/sleep.png","/images/icons/ui/add_white_18dp.svg","/images/icons/ui/delete_24px.svg","/images/icons/ui/edit_24px.svg","/images/icons/ui/remove_white_18dp.svg","/images/icons/wee/res/mipmap-hdpi/wee.png","/images/icons/wee/res/mipmap-mdpi/wee.png","/images/icons/wee/res/mipmap-xhdpi/wee.png","/images/icons/wee/res/mipmap-xxhdpi/wee.png","/styles/main.css"];const Y=new class{get routes(){return n}registerRoute(e,t){n.push({route:e,controller:t})}resolve(e){const{pathname:t}=e;for(let{route:e,controller:r}of n)if(t.match(e))return r;return i}};Y.registerRoute(u.route,new u(new class{async getAll(e,t){return e.type="All",e.header="All",f`${y(0,$(e,f`${T(e,t)}`))}`}},N)),Y.registerRoute(l.route,new l(new class{async getAll(e){return e.type="Feed",e.header="Feeds",f`${y(0,$(e,f`${T(e)}`))}`}async get(e,t){e.header="Feed";const r=navigator.language,n={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric"};return f`${y(0,$(e,f`${t.notFound?`<input type="hidden" name="data-loaded" value="${!1==!!t.notFound}">`:""}<div>Start time: ${0==t.notFound?e.startTime.toLocaleString(r,n):""}</div><div>End time: ${e.endTime?e.endTime.toLocaleString(r,n):""}</div><a href="/${e.type}s/${e.id}/edit"><img src="/images/icons/ui/edit_24px.svg"></a><div class="row"><form method="POST" id="deleteForm" action="/${e.type}s/${e.id}/delete"><input type="hidden" name="return-url" value="${t.referrer}"></form><button form="deleteForm" class="delete"><img src="/images/icons/ui/delete_24px.svg"></button></div>`))}`}async create(e,t){return e.header="Add a Feed",f`${y(0,$(e,f`<div class="form"><form method="POST" action="/${e.type}s"><input type="hidden" name="return-url" value="${t.referrer}"><div><label for="startDate">Start time: <input type="date" name="startDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD" value="${D(b(new Date))}"> <input type="time" name="startTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" value="${S(b(new Date))}"></label></div><div><label for="endDate">End time: <input type="date" name="endDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD"> <input type="time" name="endTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM"></label></div><div class="controls"><input type="submit" value="Save"></div></form></div>`))}`}async edit(e,t){return e.header="Update a Feed",f`${y(0,$(e,f`<div class="form">${t.notFound?`<input type="hidden" name="data-loaded" value="${!1==!!t.notFound}">`:""}<form method="POST" id="deleteForm" action="/${e.type}s/${e.id}/delete"><input type="hidden" name="return-url" value="${t.referrer}"></form><form method="POST" id="editForm" action="/${e.type}s/${e.id}/edit"><input type="hidden" name="return-url" value="${t.referrer}"></form><div><div><label for="startDate">Start time: <input type="date" name="startDate" form="editForm" value="${D(b(0==t.notFound?e.startTime:void 0))}"> <input type="time" name="startTime" form="editForm" value="${S(b(0==t.notFound?e.startTime:void 0))}"></label></div><div><label for="endDate">End time: <input type="date" name="endDate" form="editForm" value="${D(b(0==t.notFound?e.endTime||new Date:void 0))}"> <input type="time" name="endTime" form="editForm" value="${S(b(0==t.notFound?e.endTime||new Date:void 0))}"></label><div><div class="controls"><button form="deleteForm" class="delete"><img src="/images/icons/ui/delete_24px.svg"></button> <input type="submit" form="editForm" value="Save"></div></div></div></div></div>`))}`}},class extends N{constructor(e={},t){super({...e,isDuration:!0},t),this.type="feed"}})),Y.registerRoute(c.route,new c(new class{async getAll(e,t){return e.type="Sleep",e.header="Sleeps",f`${y(0,$(e,f`${T(e,t)}`))}`}async get(e,t){e.header="Sleep";const r=navigator.language,n={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric"};return f`${y(0,$(e,f`${t.notFound?`<input type="hidden" name="data-loaded" value="${!1==!!t.notFound}">`:""}<div>Start time: ${e.startTime.toLocaleString(r,n)}</div><div>End time: ${e.endTime?e.endTime.toLocaleString(r,n):""}</div>`))}`}async create(e,t){return e.header="Add a Sleep",f`${y(0,$(e,f`<div class="form"><form method="POST" action="/${e.type}s"><input type="hidden" name="return-url" value="${t.referrer}"><div><label for="startDate">Start time: <input type="date" name="startDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD" value="${D(b(new Date))}"> <input type="time" name="startTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" value="${S(b(new Date))}"></label></div><div><label for="endDate">End time: <input type="date" name="endDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD"> <input type="time" name="endTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM"></label></div><div class="controls"><input type="submit" value="Save"></div></form></div>`))}`}async edit(e,t){return e.header="Update a Sleep",f`${y(0,$(e,f`${t.notFound?`<input type="hidden" name="data-loaded" value="${!1==!!t.notFound}">`:""}<div class="form"><form method="POST" id="deleteForm" action="/${e.type}s/${e.id}/delete"><input type="hidden" name="return-url" value="${t.referrer}"></form><form method="POST" id="editForm" action="/${e.type}s/${e.id}/edit"><input type="hidden" name="return-url" value="${t.referrer}"></form><div><div><label for="startDate">Start time: <input type="date" name="startDate" form="editForm" value="${D(b(0==t.notFound?e.startTime:void 0))}"> <input type="time" name="startTime" form="editForm" value="${S(b(0==t.notFound?e.startTime:void 0))}"></label></div><div><label for="endDate">End time: <input type="date" name="endDate" form="editForm" value="${D(b(0==t.notFound?e.endTime||new Date:void 0))}"> <input type="time" name="endTime" form="editForm" value="${S(b(0==t.notFound?e.endTime||new Date:void 0))}"></label><div><div class="controls"><button form="deleteForm" class="delete"><img src="/images/icons/ui/delete_24px.svg"></button> <input type="submit" form="editForm" value="Save"></div></div></div></div></div>`))}`}},class extends N{constructor(e={},t){super({...e,isDuration:!0},t),this.type="sleep"}})),Y.registerRoute(p.route,new p(new class{async getAll(e,t){return e.type="Poop",e.header="Poops",f`${y(0,$(e,f`${T(e,t)}`))}`}async get(e,t){e.header="Poop";const r=navigator.language,n={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric"};return f`${y(0,$(e,f`${t.notFound?`<input type="hidden" name="data-loaded" value="${!1==!!t.notFound}">`:""}<div>Start time: ${0==t.notFound?e.startTime.toLocaleString(r,n):""}</div><div>End time: ${e.endTime?e.endTime.toLocaleString(r,n):""}</div>`))}`}async create(e,t){return e.header="Add a Poop",f`${y(0,$(e,f`<div class="form"><form method="POST" action="/${e.type}s"><input type="hidden" name="return-url" value="${t.referrer}"><div><label for="startDate">Start time: <input type="date" name="startDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD" value="${D(b(new Date))}"> <input type="time" name="startTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" value="${S(b(new Date))}"></label></div><div class="controls"><input type="submit" value="Save"></div></form></div>`))}`}async edit(e,t){return e.header="Update a Poop",f`${y(0,$(e,f`${t.notFound?`<input type="hidden" name="data-loaded" value="${!1==!!t.notFound}">`:""}<div class="form"><form method="POST" id="deleteForm" action="/${e.type}s/${e.id}/delete"><input type="hidden" name="return-url" value="${t.referrer}"></form><form method="POST" id="editForm" action="/${e.type}s/${e.id}/edit"><input type="hidden" name="return-url" value="${t.referrer}"></form><div><div><label for="startDate">Start time: <input type="date" name="startDate" form="editForm" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD" value="${D(b(0==t.notFound?e.startTime:void 0))}"> <input type="time" name="startTime" form="editForm" value="${S(b(0==t.notFound?e.startTime:void 0))}"></label></div><div class="controls"><button form="deleteForm" class="delete"><img src="/images/icons/ui/delete_24px.svg"></button> <input type="submit" form="editForm" value="Save"></div></div></div>`))}`}},class extends N{constructor(e={},t){super(e,t),this.type="poop"}})),Y.registerRoute(m.route,new m(new class{async getAll(e,t){return e.type="Wee",e.header="Wees",f`${y(0,$(e,f`${T(e,t)}`))}`}async get(e,t){e.header="Wee";const r=navigator.language,n={weekday:"long",year:"numeric",month:"long",day:"numeric",hour:"numeric",minute:"numeric"};return f`${y(0,$(e,f`${t.notFound?`<input type="hidden" name="data-loaded" value="${!1==!!t.notFound}">`:""}<div>Start time: ${0==t.notFound?e.startTime.toLocaleString(r,n):""}</div><div>End time: ${e.endTime?e.endTime.toLocaleString(r,n):""}</div>`))}`}async create(e,t){return e.header="Add a Wee",f`${y(0,$(e,f`<div class="form"><form method="POST" action="/${e.type}s"><input type="hidden" name="return-url" value="${t.referrer}"><div><label for="startDate">Start time: <input type="date" name="startDate" pattern="[0-9]{4}-[0-9]{2}-[0-9]{2}" placeholder="YYYY-MM-DD" value="${D(b(new Date))}"> <input type="time" name="startTime" pattern="[0-9]{2}:[0-9]{2}" placeholder="HH:MM" value="${S(b(new Date))}"></label></div><div class="controls"><input type="submit" value="Save"></div></form></div>`))}`}async edit(e,t){return e.header="Update a Wee",f`${y(0,$(e,f`${t.notFound?`<input type="hidden" name="data-loaded" value="${!1==!!t.notFound}">`:""}<div class="form"><form method="POST" id="deleteForm" action="/${e.type}s/${e.id}/delete"><input type="hidden" name="return-url" value="${t.referrer}"></form><form method="POST" id="editForm" action="/${e.type}s/${e.id}/edit"><input type="hidden" name="return-url" value="${t.referrer}"></form><div><div><label for="startDate">Start time: <input type="date" name="startDate" form="editForm" value="${D(b(0==t.notFound?e.startTime:void 0))}"> <input type="time" name="startTime" form="editForm" value="${S(b(0==t.notFound?e.startTime:void 0))}"></label></div><div class="controls"><button form="deleteForm" class="delete"><img src="/images/icons/ui/delete_24px.svg"></button> <input type="submit" form="editForm" value="Save"></div></div></div>`))}`}},class extends N{constructor(e={},t){super(e,t),this.type="wee"}})),Y.registerRoute(j.route,new j),self.onfetch=e=>{const{request:t}=e,n=new URL(t.url),i=Y.resolve(n);if(i instanceof r)return;const a=i.getView(n,t);return a?e.respondWith(a.then(e=>{if(e instanceof Response)return e;return new Response(e||"Not Found",{status:e?200:404,headers:{"Content-Type":"text/html; charset=utf-8"}})}).catch(e=>new Response(e.toString(),{status:404,headers:{"Content-Type":"text/html"}}))):void 0},self.oninstall=async e=>{e.waitUntil(caches.open("1.0.2").then(async e=>e.addAll(I))),self.skipWaiting()},self.onactivate=e=>{e.waitUntil(clients.claim())};
//# sourceMappingURL=sw.js.map
