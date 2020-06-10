import Log from './log.js';

export default class Sleep extends Log {
  constructor(data = {}, key) {
    super({...data, ...{isDuration: true}}, key);
    this.type = 'sleep';
  }
}

