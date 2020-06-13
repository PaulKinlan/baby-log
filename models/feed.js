import { Log } from './log.js'

export class Feed extends Log {
  constructor(data = {}, key) {
    super({...data, ...{isDuration: true}}, key);
    this.type = 'feed';
  }
}