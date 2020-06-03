import { Readable } from 'stream';

export default class FromWhatWGReadableStream extends Readable {
  constructor(options, whatwgStream) {
    super(options);
    const streamReader = whatwgStream.getReader();
    const outStream = this;
    
    function pump() {
      return streamReader.read().then(({ value, done }) => {
        if (done) {
          outStream.push(null);
          return;
        }
      
        outStream.push(value.toString());
        return pump();
      });
    }
    
    pump();
  }
}