import Model from './lib/model.js'

export default class Log extends Model {

  get hasFinished() {
    return !!this.endTime;
  }

  get duration() {
    let end = this.endTime;
    if (!!this.endTime === false) {
      end = Date.now();
    }
    return this.endTime - this.startTime;
  }

  constructor(data = {}, key) {
    super(key);

    if(!!data.id) { 
      this.id = data.id;
    }
    
    this.startTime = new Date(data.startTime);
    if (!!data.endTime) {
      this.endTime = new Date(data.endTime);
    }
    this.type = data.type;
  }

  static get storeName() {
    return 'Log';
  }
}