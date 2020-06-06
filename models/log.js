import Model from './lib/model.js'

export default class Log extends Model {
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

    this._startTime = data._startTime;
    this._type = data.type;
  }

  static get storeName() {
    return 'Log';
  }
}