import Log from './log.js';

export default class Poop extends Log {
  constructor(data = {}, key) {
    super(data, key);
    this.type = 'poop';
  }
}
