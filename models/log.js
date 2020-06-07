import Model from './lib/model.js'

export default class Log extends Model {
  get startTime() {
    return this._startTime;
  }

  get endTime() {
    return this._endTime;
  }

  set endTime(val) {
    this._endTime = val;
  }

  set startTime(val) {
    this._startTime = val;
  }

  get hasFinished() {
    return !!this._endTime;
  }

  get duration() {
    let end = this._endTime;
    if (!!this._endTime === false) {
      end = Date.now();
    }
    return this._endTime - this._startTime;
  }

  get type() {
    return this._type;
  }

  constructor(data = {}, key) {
    super(key);

    this.id = data.id;
    this._startTime = new Date(data._startTime);
    if (!!data._endTime) {
      this._endTime = new Date(data._endTime);
    }
    this._type = data.type;
  }

  static get storeName() {
    return 'Log';
  }
}