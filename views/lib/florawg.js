const encoder = new TextEncoder();

const pipeInto = async (from, controller) => {
  const reader = from.getReader();
  
  return reader.read().then(function process(result) {
    if (result.done) {
      return;
    }
    if (!!result.value) {
      controller.enqueue(result.value);
    }
    return reader.read().then(process);
  });
};

const enqueueItem = async (val, controller) => {
  if (val instanceof globalThis.ReadableStream) {
    await pipeInto(val, controller);
  } 
  else if (val instanceof Promise) {
    let newVal;
    newVal = await val;

    if (newVal instanceof globalThis.ReadableStream) {
      await pipeInto(newVal, controller);
    } else {
      await enqueueItem(newVal, controller);
    }
  }
  else {
    if (Array.isArray(val)) {
      for (let item of val) {
        await enqueueItem(item, controller)
      }
    }
    else if (!!val) {
      controller.enqueue(encoder.encode(val));
    }
  }
}

export default async (strings, ...values) => {
  if ("ReadableStream" in globalThis === false) {
    // For node not supporting streams properly..... This should tree-shake away
    globalThis = {...globalThis, ...await import("./private/streams/streams.js")};
  }
  return new globalThis.ReadableStream({
    start(controller) {
      async function push() {
        let i = 0;
        while (i < values.length) {
          let html = strings[i];
          controller.enqueue(encoder.encode(html));
          await enqueueItem(values[i], controller);

          i++;
        }
        controller.enqueue(encoder.encode(strings[i]));
        controller.close();
      }

      push();
    }
  });
};