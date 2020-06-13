import { Log }  from './log.js'

export class Poop extends Log {
  constructor(data = {}, key) {
    super(data, key);
    this.type = 'poop';
  }
}
