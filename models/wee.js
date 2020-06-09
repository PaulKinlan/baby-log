import Log from './log.js';

export default class Wee extends Log {
  constructor(data, key) {
    super(data, key);
    this.type = 'wee';
  }
}
