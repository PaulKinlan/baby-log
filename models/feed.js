import Log from './log.js'

export default class Feed extends Log {

  get type() {
    return this._type;
  }

  constructor(data, key) {
    super(data, key);
    this._type = 'feed';
  }
}