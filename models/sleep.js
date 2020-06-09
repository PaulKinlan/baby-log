import Log from './log.js'

export default class Sleep extends Log {
  constructor(data, key) {
    super(data, key);
    this.type = 'sleep';
  }
}

