import Log from './log.js'

export default class Feed extends Log {
  constructor(data, key) {
    super(data, key);
    this.type = 'feed';
  }
}