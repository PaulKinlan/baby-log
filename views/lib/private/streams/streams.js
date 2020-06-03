/**
 * web-streams-polyfill v2.1.1
 */
/// <reference lib="es2015.symbol" />
const SymbolPolyfill = typeof Symbol === 'function' && typeof Symbol.iterator === 'symbol' ?
    Symbol :
    description => `Symbol(${description})`;

/// <reference lib="dom" />
function noop() {
    // do nothing
}

/// <reference lib="es2015.core" />
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isNaN#Polyfill
const NumberIsNaN = Number.isNaN || function (x) {
    // eslint-disable-next-line no-self-compare
    return x !== x;
};

const rethrowAssertionErrorRejection =  noop;

function typeIsObject(x) {
    return (typeof x === 'object' && x !== null) || typeof x === 'function';
}
function createArrayFromList(elements) {
    // We use arrays to represent lists, so this is basically a no-op.
    // Do a slice though just in case we happen to depend on the unique-ness.
    return elements.slice();
}
function ArrayBufferCopy(dest, destOffset, src, srcOffset, n) {
    new Uint8Array(dest).set(new Uint8Array(src, srcOffset, n), destOffset);
}
function IsFiniteNonNegativeNumber(v) {
    if (IsNonNegativeNumber(v) === false) {
        return false;
    }
    if (v === Infinity) {
        return false;
    }
    return true;
}
function IsNonNegativeNumber(v) {
    if (typeof v !== 'number') {
        return false;
    }
    if (NumberIsNaN(v)) {
        return false;
    }
    if (v < 0) {
        return false;
    }
    return true;
}
function Call(F, V, args) {
    if (typeof F !== 'function') {
        throw new TypeError('Argument is not a function');
    }
    return Function.prototype.apply.call(F, V, args);
}
function CreateAlgorithmFromUnderlyingMethod(underlyingObject, methodName, algoArgCount, extraArgs) {
    const method = underlyingObject[methodName];
    if (method !== undefined) {
        if (typeof method !== 'function') {
            throw new TypeError(`${method} is not a method`);
        }
        switch (algoArgCount) {
            case 0: {
                return () => {
                    return PromiseCall(method, underlyingObject, extraArgs);
                };
            }
            case 1: {
                return arg => {
                    const fullArgs = [arg].concat(extraArgs);
                    return PromiseCall(method, underlyingObject, fullArgs);
                };
            }
        }
    }
    return () => promiseResolvedWith(undefined);
}
function InvokeOrNoop(O, P, args) {
    const method = O[P];
    if (method === undefined) {
        return undefined;
    }
    return Call(method, O, args);
}
function PromiseCall(F, V, args) {
    try {
        return promiseResolvedWith(Call(F, V, args));
    }
    catch (value) {
        return promiseRejectedWith(value);
    }
}
// Not implemented correctly
function TransferArrayBuffer(O) {
    return O;
}
// Not implemented correctly
function IsDetachedBuffer(O) {
    return false;
}
function ValidateAndNormalizeHighWaterMark(highWaterMark) {
    highWaterMark = Number(highWaterMark);
    if (NumberIsNaN(highWaterMark) || highWaterMark < 0) {
        throw new RangeError('highWaterMark property of a queuing strategy must be non-negative and non-NaN');
    }
    return highWaterMark;
}
function MakeSizeAlgorithmFromSizeFunction(size) {
    if (size === undefined) {
        return () => 1;
    }
    if (typeof size !== 'function') {
        throw new TypeError('size property of a queuing strategy must be a function');
    }
    return chunk => size(chunk);
}
const originalPromise = Promise;
const originalPromiseThen = Promise.prototype.then;
const originalPromiseResolve = Promise.resolve.bind(originalPromise);
const originalPromiseReject = Promise.reject.bind(originalPromise);
function newPromise(executor) {
    return new originalPromise(executor);
}
function promiseResolvedWith(value) {
    return originalPromiseResolve(value);
}
function promiseRejectedWith(reason) {
    return originalPromiseReject(reason);
}
function PerformPromiseThen(promise, onFulfilled, onRejected) {
    // There doesn't appear to be any way to correctly emulate the behaviour from JavaScript, so this is just an
    // approximation.
    return originalPromiseThen.call(promise, onFulfilled, onRejected);
}
function uponPromise(promise, onFulfilled, onRejected) {
    PerformPromiseThen(PerformPromiseThen(promise, onFulfilled, onRejected), undefined, rethrowAssertionErrorRejection);
}
function uponFulfillment(promise, onFulfilled) {
    uponPromise(promise, onFulfilled);
}
function uponRejection(promise, onRejected) {
    uponPromise(promise, undefined, onRejected);
}
function transformPromiseWith(promise, fulfillmentHandler, rejectionHandler) {
    return PerformPromiseThen(promise, fulfillmentHandler, rejectionHandler);
}
function setPromiseIsHandledToTrue(promise) {
    PerformPromiseThen(promise, undefined, rethrowAssertionErrorRejection);
}

// Original from Chromium
// https://chromium.googlesource.com/chromium/src/+/0aee4434a4dba42a42abaea9bfbc0cd196a63bc1/third_party/blink/renderer/core/streams/SimpleQueue.js
const QUEUE_MAX_ARRAY_SIZE = 16384;
/**
 * Simple queue structure.
 *
 * Avoids scalability issues with using a packed array directly by using
 * multiple arrays in a linked list and keeping the array size bounded.
 */
class SimpleQueue {
    constructor() {
        this._cursor = 0;
        this._size = 0;
        // _front and _back are always defined.
        this._front = {
            _elements: [],
            _next: undefined
        };
        this._back = this._front;
        // The cursor is used to avoid calling Array.shift().
        // It contains the index of the front element of the array inside the
        // front-most node. It is always in the range [0, QUEUE_MAX_ARRAY_SIZE).
        this._cursor = 0;
        // When there is only one node, size === elements.length - cursor.
        this._size = 0;
    }
    get length() {
        return this._size;
    }
    // For exception safety, this method is structured in order:
    // 1. Read state
    // 2. Calculate required state mutations
    // 3. Perform state mutations
    push(element) {
        const oldBack = this._back;
        let newBack = oldBack;
        if (oldBack._elements.length === QUEUE_MAX_ARRAY_SIZE - 1) {
            newBack = {
                _elements: [],
                _next: undefined
            };
        }
        // push() is the mutation most likely to throw an exception, so it
        // goes first.
        oldBack._elements.push(element);
        if (newBack !== oldBack) {
            this._back = newBack;
            oldBack._next = newBack;
        }
        ++this._size;
    }
    // Like push(), shift() follows the read -> calculate -> mutate pattern for
    // exception safety.
    shift() { // must not be called on an empty queue
        const oldFront = this._front;
        let newFront = oldFront;
        const oldCursor = this._cursor;
        let newCursor = oldCursor + 1;
        const elements = oldFront._elements;
        const element = elements[oldCursor];
        if (newCursor === QUEUE_MAX_ARRAY_SIZE) {
            newFront = oldFront._next;
            newCursor = 0;
        }
        // No mutations before this point.
        --this._size;
        this._cursor = newCursor;
        if (oldFront !== newFront) {
            this._front = newFront;
        }
        // Permit shifted element to be garbage collected.
        elements[oldCursor] = undefined;
        return element;
    }
    // The tricky thing about forEach() is that it can be called
    // re-entrantly. The queue may be mutated inside the callback. It is easy to
    // see that push() within the callback has no negative effects since the end
    // of the queue is checked for on every iteration. If shift() is called
    // repeatedly within the callback then the next iteration may return an
    // element that has been removed. In this case the callback will be called
    // with undefined values until we either "catch up" with elements that still
    // exist or reach the back of the queue.
    forEach(callback) {
        let i = this._cursor;
        let node = this._front;
        let elements = node._elements;
        while (i !== elements.length || node._next !== undefined) {
            if (i === elements.length) {
                node = node._next;
                elements = node._elements;
                i = 0;
                if (elements.length === 0) {
                    break;
                }
            }
            callback(elements[i]);
            ++i;
        }
    }
    // Return the element that would be returned if shift() was called now,
    // without modifying the queue.
    peek() { // must not be called on an empty queue
        const front = this._front;
        const cursor = this._cursor;
        return front._elements[cursor];
    }
}

function ReadableStreamCreateReadResult(value, done, forAuthorCode) {
    let prototype = null;
    if (forAuthorCode === true) {
        prototype = Object.prototype;
    }
    const obj = Object.create(prototype);
    obj.value = value;
    obj.done = done;
    return obj;
}
function ReadableStreamReaderGenericInitialize(reader, stream) {
    reader._forAuthorCode = true;
    reader._ownerReadableStream = stream;
    stream._reader = reader;
    if (stream._state === 'readable') {
        defaultReaderClosedPromiseInitialize(reader);
    }
    else if (stream._state === 'closed') {
        defaultReaderClosedPromiseInitializeAsResolved(reader);
    }
    else {
        defaultReaderClosedPromiseInitializeAsRejected(reader, stream._storedError);
    }
}
// A client of ReadableStreamDefaultReader and ReadableStreamBYOBReader may use these functions directly to bypass state
// check.
function ReadableStreamReaderGenericCancel(reader, reason) {
    const stream = reader._ownerReadableStream;
    return ReadableStreamCancel(stream, reason);
}
function ReadableStreamReaderGenericRelease(reader) {
    if (reader._ownerReadableStream._state === 'readable') {
        defaultReaderClosedPromiseReject(reader, new TypeError('Reader was released and can no longer be used to monitor the stream\'s closedness'));
    }
    else {
        defaultReaderClosedPromiseResetToRejected(reader, new TypeError('Reader was released and can no longer be used to monitor the stream\'s closedness'));
    }
    reader._ownerReadableStream._reader = undefined;
    reader._ownerReadableStream = undefined;
}
// Helper functions for the readers.
function readerLockException(name) {
    return new TypeError('Cannot ' + name + ' a stream using a released reader');
}
// Helper functions for the ReadableStreamDefaultReader.
function defaultReaderClosedPromiseInitialize(reader) {
    reader._closedPromise = newPromise((resolve, reject) => {
        reader._closedPromise_resolve = resolve;
        reader._closedPromise_reject = reject;
    });
}
function defaultReaderClosedPromiseInitializeAsRejected(reader, reason) {
    defaultReaderClosedPromiseInitialize(reader);
    defaultReaderClosedPromiseReject(reader, reason);
}
function defaultReaderClosedPromiseInitializeAsResolved(reader) {
    defaultReaderClosedPromiseInitialize(reader);
    defaultReaderClosedPromiseResolve(reader);
}
function defaultReaderClosedPromiseReject(reader, reason) {
    setPromiseIsHandledToTrue(reader._closedPromise);
    reader._closedPromise_reject(reason);
    reader._closedPromise_resolve = undefined;
    reader._closedPromise_reject = undefined;
}
function defaultReaderClosedPromiseResetToRejected(reader, reason) {
    defaultReaderClosedPromiseInitializeAsRejected(reader, reason);
}
function defaultReaderClosedPromiseResolve(reader) {
    reader._closedPromise_resolve(undefined);
    reader._closedPromise_resolve = undefined;
    reader._closedPromise_reject = undefined;
}

const CancelSteps = SymbolPolyfill('[[CancelSteps]]');
const PullSteps = SymbolPolyfill('[[PullSteps]]');

// Abstract operations for the ReadableStream.
function AcquireReadableStreamDefaultReader(stream, forAuthorCode = false) {
    const reader = new ReadableStreamDefaultReader(stream);
    reader._forAuthorCode = forAuthorCode;
    return reader;
}
// ReadableStream API exposed for controllers.
function ReadableStreamAddReadRequest(stream) {
    const promise = newPromise((resolve, reject) => {
        const readRequest = {
            _resolve: resolve,
            _reject: reject
        };
        stream._reader._readRequests.push(readRequest);
    });
    return promise;
}
function ReadableStreamFulfillReadRequest(stream, chunk, done) {
    const reader = stream._reader;
    const readRequest = reader._readRequests.shift();
    readRequest._resolve(ReadableStreamCreateReadResult(chunk, done, reader._forAuthorCode));
}
function ReadableStreamGetNumReadRequests(stream) {
    return stream._reader._readRequests.length;
}
function ReadableStreamHasDefaultReader(stream) {
    const reader = stream._reader;
    if (reader === undefined) {
        return false;
    }
    if (!IsReadableStreamDefaultReader(reader)) {
        return false;
    }
    return true;
}
class ReadableStreamDefaultReader {
    constructor(stream) {
        if (IsReadableStream(stream) === false) {
            throw new TypeError('ReadableStreamDefaultReader can only be constructed with a ReadableStream instance');
        }
        if (IsReadableStreamLocked(stream) === true) {
            throw new TypeError('This stream has already been locked for exclusive reading by another reader');
        }
        ReadableStreamReaderGenericInitialize(this, stream);
        this._readRequests = new SimpleQueue();
    }
    get closed() {
        if (!IsReadableStreamDefaultReader(this)) {
            return promiseRejectedWith(defaultReaderBrandCheckException('closed'));
        }
        return this._closedPromise;
    }
    cancel(reason) {
        if (!IsReadableStreamDefaultReader(this)) {
            return promiseRejectedWith(defaultReaderBrandCheckException('cancel'));
        }
        if (this._ownerReadableStream === undefined) {
            return promiseRejectedWith(readerLockException('cancel'));
        }
        return ReadableStreamReaderGenericCancel(this, reason);
    }
    read() {
        if (!IsReadableStreamDefaultReader(this)) {
            return promiseRejectedWith(defaultReaderBrandCheckException('read'));
        }
        if (this._ownerReadableStream === undefined) {
            return promiseRejectedWith(readerLockException('read from'));
        }
        return ReadableStreamDefaultReaderRead(this);
    }
    releaseLock() {
        if (!IsReadableStreamDefaultReader(this)) {
            throw defaultReaderBrandCheckException('releaseLock');
        }
        if (this._ownerReadableStream === undefined) {
            return;
        }
        if (this._readRequests.length > 0) {
            throw new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled');
        }
        ReadableStreamReaderGenericRelease(this);
    }
}
// Abstract operations for the readers.
function IsReadableStreamDefaultReader(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_readRequests')) {
        return false;
    }
    return true;
}
function ReadableStreamDefaultReaderRead(reader) {
    const stream = reader._ownerReadableStream;
    stream._disturbed = true;
    if (stream._state === 'closed') {
        return promiseResolvedWith(ReadableStreamCreateReadResult(undefined, true, reader._forAuthorCode));
    }
    if (stream._state === 'errored') {
        return promiseRejectedWith(stream._storedError);
    }
    return stream._readableStreamController[PullSteps]();
}
// Helper functions for the ReadableStreamDefaultReader.
function defaultReaderBrandCheckException(name) {
    return new TypeError(`ReadableStreamDefaultReader.prototype.${name} can only be used on a ReadableStreamDefaultReader`);
}

/// <reference lib="es2018.asynciterable" />
/* eslint-disable @typescript-eslint/no-empty-function */
const AsyncIteratorPrototype = Object.getPrototypeOf(Object.getPrototypeOf(async function* () { }).prototype);

/// <reference lib="es2018.asynciterable" />
const ReadableStreamAsyncIteratorPrototype = {
    next() {
        if (IsReadableStreamAsyncIterator(this) === false) {
            return promiseRejectedWith(streamAsyncIteratorBrandCheckException('next'));
        }
        const reader = this._asyncIteratorReader;
        if (reader._ownerReadableStream === undefined) {
            return promiseRejectedWith(readerLockException('iterate'));
        }
        return transformPromiseWith(ReadableStreamDefaultReaderRead(reader), result => {
            const done = result.done;
            if (done) {
                ReadableStreamReaderGenericRelease(reader);
            }
            const value = result.value;
            return ReadableStreamCreateReadResult(value, done, true);
        });
    },
    return(value) {
        if (IsReadableStreamAsyncIterator(this) === false) {
            return promiseRejectedWith(streamAsyncIteratorBrandCheckException('next'));
        }
        const reader = this._asyncIteratorReader;
        if (reader._ownerReadableStream === undefined) {
            return promiseRejectedWith(readerLockException('finish iterating'));
        }
        if (reader._readRequests.length > 0) {
            return promiseRejectedWith(new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled'));
        }
        if (this._preventCancel === false) {
            const result = ReadableStreamReaderGenericCancel(reader, value);
            ReadableStreamReaderGenericRelease(reader);
            return transformPromiseWith(result, () => ReadableStreamCreateReadResult(value, true, true));
        }
        ReadableStreamReaderGenericRelease(reader);
        return promiseResolvedWith(ReadableStreamCreateReadResult(value, true, true));
    }
};
if (AsyncIteratorPrototype !== undefined) {
    Object.setPrototypeOf(ReadableStreamAsyncIteratorPrototype, AsyncIteratorPrototype);
}
Object.defineProperty(ReadableStreamAsyncIteratorPrototype, 'next', { enumerable: false });
Object.defineProperty(ReadableStreamAsyncIteratorPrototype, 'return', { enumerable: false });
// Abstract operations for the ReadableStream.
function AcquireReadableStreamAsyncIterator(stream, preventCancel = false) {
    const reader = AcquireReadableStreamDefaultReader(stream);
    const iterator = Object.create(ReadableStreamAsyncIteratorPrototype);
    iterator._asyncIteratorReader = reader;
    iterator._preventCancel = Boolean(preventCancel);
    return iterator;
}
function IsReadableStreamAsyncIterator(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_asyncIteratorReader')) {
        return false;
    }
    return true;
}
// Helper functions for the ReadableStream.
function streamAsyncIteratorBrandCheckException(name) {
    return new TypeError(`ReadableStreamAsyncIterator.${name} can only be used on a ReadableSteamAsyncIterator`);
}

function DequeueValue(container) {
    const pair = container._queue.shift();
    container._queueTotalSize -= pair.size;
    if (container._queueTotalSize < 0) {
        container._queueTotalSize = 0;
    }
    return pair.value;
}
function EnqueueValueWithSize(container, value, size) {
    size = Number(size);
    if (!IsFiniteNonNegativeNumber(size)) {
        throw new RangeError('Size must be a finite, non-NaN, non-negative number.');
    }
    container._queue.push({ value, size });
    container._queueTotalSize += size;
}
function PeekQueueValue(container) {
    const pair = container._queue.peek();
    return pair.value;
}
function ResetQueue(container) {
    container._queue = new SimpleQueue();
    container._queueTotalSize = 0;
}

const AbortSteps = SymbolPolyfill('[[AbortSteps]]');
const ErrorSteps = SymbolPolyfill('[[ErrorSteps]]');
class WritableStream {
    constructor(underlyingSink = {}, strategy = {}) {
        InitializeWritableStream(this);
        const size = strategy.size;
        let highWaterMark = strategy.highWaterMark;
        const type = underlyingSink.type;
        if (type !== undefined) {
            throw new RangeError('Invalid type is specified');
        }
        const sizeAlgorithm = MakeSizeAlgorithmFromSizeFunction(size);
        if (highWaterMark === undefined) {
            highWaterMark = 1;
        }
        highWaterMark = ValidateAndNormalizeHighWaterMark(highWaterMark);
        SetUpWritableStreamDefaultControllerFromUnderlyingSink(this, underlyingSink, highWaterMark, sizeAlgorithm);
    }
    get locked() {
        if (IsWritableStream(this) === false) {
            throw streamBrandCheckException('locked');
        }
        return IsWritableStreamLocked(this);
    }
    abort(reason) {
        if (IsWritableStream(this) === false) {
            return promiseRejectedWith(streamBrandCheckException('abort'));
        }
        if (IsWritableStreamLocked(this) === true) {
            return promiseRejectedWith(new TypeError('Cannot abort a stream that already has a writer'));
        }
        return WritableStreamAbort(this, reason);
    }
    close() {
        if (IsWritableStream(this) === false) {
            return promiseRejectedWith(streamBrandCheckException('close'));
        }
        if (IsWritableStreamLocked(this) === true) {
            return promiseRejectedWith(new TypeError('Cannot close a stream that already has a writer'));
        }
        if (WritableStreamCloseQueuedOrInFlight(this) === true) {
            return promiseRejectedWith(new TypeError('Cannot close an already-closing stream'));
        }
        return WritableStreamClose(this);
    }
    getWriter() {
        if (IsWritableStream(this) === false) {
            throw streamBrandCheckException('getWriter');
        }
        return AcquireWritableStreamDefaultWriter(this);
    }
}
// Abstract operations for the WritableStream.
function AcquireWritableStreamDefaultWriter(stream) {
    return new WritableStreamDefaultWriter(stream);
}
// Throws if and only if startAlgorithm throws.
function CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
    const stream = Object.create(WritableStream.prototype);
    InitializeWritableStream(stream);
    const controller = Object.create(WritableStreamDefaultController.prototype);
    SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
    return stream;
}
function InitializeWritableStream(stream) {
    stream._state = 'writable';
    // The error that will be reported by new method calls once the state becomes errored. Only set when [[state]] is
    // 'erroring' or 'errored'. May be set to an undefined value.
    stream._storedError = undefined;
    stream._writer = undefined;
    // Initialize to undefined first because the constructor of the controller checks this
    // variable to validate the caller.
    stream._writableStreamController = undefined;
    // This queue is placed here instead of the writer class in order to allow for passing a writer to the next data
    // producer without waiting for the queued writes to finish.
    stream._writeRequests = new SimpleQueue();
    // Write requests are removed from _writeRequests when write() is called on the underlying sink. This prevents
    // them from being erroneously rejected on error. If a write() call is in-flight, the request is stored here.
    stream._inFlightWriteRequest = undefined;
    // The promise that was returned from writer.close(). Stored here because it may be fulfilled after the writer
    // has been detached.
    stream._closeRequest = undefined;
    // Close request is removed from _closeRequest when close() is called on the underlying sink. This prevents it
    // from being erroneously rejected on error. If a close() call is in-flight, the request is stored here.
    stream._inFlightCloseRequest = undefined;
    // The promise that was returned from writer.abort(). This may also be fulfilled after the writer has detached.
    stream._pendingAbortRequest = undefined;
    // The backpressure signal set by the controller.
    stream._backpressure = false;
}
function IsWritableStream(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_writableStreamController')) {
        return false;
    }
    return true;
}
function IsWritableStreamLocked(stream) {
    if (stream._writer === undefined) {
        return false;
    }
    return true;
}
function WritableStreamAbort(stream, reason) {
    const state = stream._state;
    if (state === 'closed' || state === 'errored') {
        return promiseResolvedWith(undefined);
    }
    if (stream._pendingAbortRequest !== undefined) {
        return stream._pendingAbortRequest._promise;
    }
    let wasAlreadyErroring = false;
    if (state === 'erroring') {
        wasAlreadyErroring = true;
        // reason will not be used, so don't keep a reference to it.
        reason = undefined;
    }
    const promise = newPromise((resolve, reject) => {
        stream._pendingAbortRequest = {
            _promise: undefined,
            _resolve: resolve,
            _reject: reject,
            _reason: reason,
            _wasAlreadyErroring: wasAlreadyErroring
        };
    });
    stream._pendingAbortRequest._promise = promise;
    if (wasAlreadyErroring === false) {
        WritableStreamStartErroring(stream, reason);
    }
    return promise;
}
function WritableStreamClose(stream) {
    const state = stream._state;
    if (state === 'closed' || state === 'errored') {
        return promiseRejectedWith(new TypeError(`The stream (in ${state} state) is not in the writable state and cannot be closed`));
    }
    const promise = newPromise((resolve, reject) => {
        const closeRequest = {
            _resolve: resolve,
            _reject: reject
        };
        stream._closeRequest = closeRequest;
    });
    const writer = stream._writer;
    if (writer !== undefined && stream._backpressure === true && state === 'writable') {
        defaultWriterReadyPromiseResolve(writer);
    }
    WritableStreamDefaultControllerClose(stream._writableStreamController);
    return promise;
}
// WritableStream API exposed for controllers.
function WritableStreamAddWriteRequest(stream) {
    const promise = newPromise((resolve, reject) => {
        const writeRequest = {
            _resolve: resolve,
            _reject: reject
        };
        stream._writeRequests.push(writeRequest);
    });
    return promise;
}
function WritableStreamDealWithRejection(stream, error) {
    const state = stream._state;
    if (state === 'writable') {
        WritableStreamStartErroring(stream, error);
        return;
    }
    WritableStreamFinishErroring(stream);
}
function WritableStreamStartErroring(stream, reason) {
    const controller = stream._writableStreamController;
    stream._state = 'erroring';
    stream._storedError = reason;
    const writer = stream._writer;
    if (writer !== undefined) {
        WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, reason);
    }
    if (WritableStreamHasOperationMarkedInFlight(stream) === false && controller._started === true) {
        WritableStreamFinishErroring(stream);
    }
}
function WritableStreamFinishErroring(stream) {
    stream._state = 'errored';
    stream._writableStreamController[ErrorSteps]();
    const storedError = stream._storedError;
    stream._writeRequests.forEach(writeRequest => {
        writeRequest._reject(storedError);
    });
    stream._writeRequests = new SimpleQueue();
    if (stream._pendingAbortRequest === undefined) {
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return;
    }
    const abortRequest = stream._pendingAbortRequest;
    stream._pendingAbortRequest = undefined;
    if (abortRequest._wasAlreadyErroring === true) {
        abortRequest._reject(storedError);
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
        return;
    }
    const promise = stream._writableStreamController[AbortSteps](abortRequest._reason);
    uponPromise(promise, () => {
        abortRequest._resolve();
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
    }, (reason) => {
        abortRequest._reject(reason);
        WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream);
    });
}
function WritableStreamFinishInFlightWrite(stream) {
    stream._inFlightWriteRequest._resolve(undefined);
    stream._inFlightWriteRequest = undefined;
}
function WritableStreamFinishInFlightWriteWithError(stream, error) {
    stream._inFlightWriteRequest._reject(error);
    stream._inFlightWriteRequest = undefined;
    WritableStreamDealWithRejection(stream, error);
}
function WritableStreamFinishInFlightClose(stream) {
    stream._inFlightCloseRequest._resolve(undefined);
    stream._inFlightCloseRequest = undefined;
    const state = stream._state;
    if (state === 'erroring') {
        // The error was too late to do anything, so it is ignored.
        stream._storedError = undefined;
        if (stream._pendingAbortRequest !== undefined) {
            stream._pendingAbortRequest._resolve();
            stream._pendingAbortRequest = undefined;
        }
    }
    stream._state = 'closed';
    const writer = stream._writer;
    if (writer !== undefined) {
        defaultWriterClosedPromiseResolve(writer);
    }
}
function WritableStreamFinishInFlightCloseWithError(stream, error) {
    stream._inFlightCloseRequest._reject(error);
    stream._inFlightCloseRequest = undefined;
    // Never execute sink abort() after sink close().
    if (stream._pendingAbortRequest !== undefined) {
        stream._pendingAbortRequest._reject(error);
        stream._pendingAbortRequest = undefined;
    }
    WritableStreamDealWithRejection(stream, error);
}
// TODO(ricea): Fix alphabetical order.
function WritableStreamCloseQueuedOrInFlight(stream) {
    if (stream._closeRequest === undefined && stream._inFlightCloseRequest === undefined) {
        return false;
    }
    return true;
}
function WritableStreamHasOperationMarkedInFlight(stream) {
    if (stream._inFlightWriteRequest === undefined && stream._inFlightCloseRequest === undefined) {
        return false;
    }
    return true;
}
function WritableStreamMarkCloseRequestInFlight(stream) {
    stream._inFlightCloseRequest = stream._closeRequest;
    stream._closeRequest = undefined;
}
function WritableStreamMarkFirstWriteRequestInFlight(stream) {
    stream._inFlightWriteRequest = stream._writeRequests.shift();
}
function WritableStreamRejectCloseAndClosedPromiseIfNeeded(stream) {
    if (stream._closeRequest !== undefined) {
        stream._closeRequest._reject(stream._storedError);
        stream._closeRequest = undefined;
    }
    const writer = stream._writer;
    if (writer !== undefined) {
        defaultWriterClosedPromiseReject(writer, stream._storedError);
    }
}
function WritableStreamUpdateBackpressure(stream, backpressure) {
    const writer = stream._writer;
    if (writer !== undefined && backpressure !== stream._backpressure) {
        if (backpressure === true) {
            defaultWriterReadyPromiseReset(writer);
        }
        else {
            defaultWriterReadyPromiseResolve(writer);
        }
    }
    stream._backpressure = backpressure;
}
class WritableStreamDefaultWriter {
    constructor(stream) {
        if (IsWritableStream(stream) === false) {
            throw new TypeError('WritableStreamDefaultWriter can only be constructed with a WritableStream instance');
        }
        if (IsWritableStreamLocked(stream) === true) {
            throw new TypeError('This stream has already been locked for exclusive writing by another writer');
        }
        this._ownerWritableStream = stream;
        stream._writer = this;
        const state = stream._state;
        if (state === 'writable') {
            if (WritableStreamCloseQueuedOrInFlight(stream) === false && stream._backpressure === true) {
                defaultWriterReadyPromiseInitialize(this);
            }
            else {
                defaultWriterReadyPromiseInitializeAsResolved(this);
            }
            defaultWriterClosedPromiseInitialize(this);
        }
        else if (state === 'erroring') {
            defaultWriterReadyPromiseInitializeAsRejected(this, stream._storedError);
            defaultWriterClosedPromiseInitialize(this);
        }
        else if (state === 'closed') {
            defaultWriterReadyPromiseInitializeAsResolved(this);
            defaultWriterClosedPromiseInitializeAsResolved(this);
        }
        else {
            const storedError = stream._storedError;
            defaultWriterReadyPromiseInitializeAsRejected(this, storedError);
            defaultWriterClosedPromiseInitializeAsRejected(this, storedError);
        }
    }
    get closed() {
        if (IsWritableStreamDefaultWriter(this) === false) {
            return promiseRejectedWith(defaultWriterBrandCheckException('closed'));
        }
        return this._closedPromise;
    }
    get desiredSize() {
        if (IsWritableStreamDefaultWriter(this) === false) {
            throw defaultWriterBrandCheckException('desiredSize');
        }
        if (this._ownerWritableStream === undefined) {
            throw defaultWriterLockException('desiredSize');
        }
        return WritableStreamDefaultWriterGetDesiredSize(this);
    }
    get ready() {
        if (IsWritableStreamDefaultWriter(this) === false) {
            return promiseRejectedWith(defaultWriterBrandCheckException('ready'));
        }
        return this._readyPromise;
    }
    abort(reason) {
        if (IsWritableStreamDefaultWriter(this) === false) {
            return promiseRejectedWith(defaultWriterBrandCheckException('abort'));
        }
        if (this._ownerWritableStream === undefined) {
            return promiseRejectedWith(defaultWriterLockException('abort'));
        }
        return WritableStreamDefaultWriterAbort(this, reason);
    }
    close() {
        if (IsWritableStreamDefaultWriter(this) === false) {
            return promiseRejectedWith(defaultWriterBrandCheckException('close'));
        }
        const stream = this._ownerWritableStream;
        if (stream === undefined) {
            return promiseRejectedWith(defaultWriterLockException('close'));
        }
        if (WritableStreamCloseQueuedOrInFlight(stream) === true) {
            return promiseRejectedWith(new TypeError('Cannot close an already-closing stream'));
        }
        return WritableStreamDefaultWriterClose(this);
    }
    releaseLock() {
        if (IsWritableStreamDefaultWriter(this) === false) {
            throw defaultWriterBrandCheckException('releaseLock');
        }
        const stream = this._ownerWritableStream;
        if (stream === undefined) {
            return;
        }
        WritableStreamDefaultWriterRelease(this);
    }
    write(chunk) {
        if (IsWritableStreamDefaultWriter(this) === false) {
            return promiseRejectedWith(defaultWriterBrandCheckException('write'));
        }
        if (this._ownerWritableStream === undefined) {
            return promiseRejectedWith(defaultWriterLockException('write to'));
        }
        return WritableStreamDefaultWriterWrite(this, chunk);
    }
}
// Abstract operations for the WritableStreamDefaultWriter.
function IsWritableStreamDefaultWriter(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_ownerWritableStream')) {
        return false;
    }
    return true;
}
// A client of WritableStreamDefaultWriter may use these functions directly to bypass state check.
function WritableStreamDefaultWriterAbort(writer, reason) {
    const stream = writer._ownerWritableStream;
    return WritableStreamAbort(stream, reason);
}
function WritableStreamDefaultWriterClose(writer) {
    const stream = writer._ownerWritableStream;
    return WritableStreamClose(stream);
}
function WritableStreamDefaultWriterCloseWithErrorPropagation(writer) {
    const stream = writer._ownerWritableStream;
    const state = stream._state;
    if (WritableStreamCloseQueuedOrInFlight(stream) === true || state === 'closed') {
        return promiseResolvedWith(undefined);
    }
    if (state === 'errored') {
        return promiseRejectedWith(stream._storedError);
    }
    return WritableStreamDefaultWriterClose(writer);
}
function WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, error) {
    if (writer._closedPromiseState === 'pending') {
        defaultWriterClosedPromiseReject(writer, error);
    }
    else {
        defaultWriterClosedPromiseResetToRejected(writer, error);
    }
}
function WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, error) {
    if (writer._readyPromiseState === 'pending') {
        defaultWriterReadyPromiseReject(writer, error);
    }
    else {
        defaultWriterReadyPromiseResetToRejected(writer, error);
    }
}
function WritableStreamDefaultWriterGetDesiredSize(writer) {
    const stream = writer._ownerWritableStream;
    const state = stream._state;
    if (state === 'errored' || state === 'erroring') {
        return null;
    }
    if (state === 'closed') {
        return 0;
    }
    return WritableStreamDefaultControllerGetDesiredSize(stream._writableStreamController);
}
function WritableStreamDefaultWriterRelease(writer) {
    const stream = writer._ownerWritableStream;
    const releasedError = new TypeError('Writer was released and can no longer be used to monitor the stream\'s closedness');
    WritableStreamDefaultWriterEnsureReadyPromiseRejected(writer, releasedError);
    // The state transitions to "errored" before the sink abort() method runs, but the writer.closed promise is not
    // rejected until afterwards. This means that simply testing state will not work.
    WritableStreamDefaultWriterEnsureClosedPromiseRejected(writer, releasedError);
    stream._writer = undefined;
    writer._ownerWritableStream = undefined;
}
function WritableStreamDefaultWriterWrite(writer, chunk) {
    const stream = writer._ownerWritableStream;
    const controller = stream._writableStreamController;
    const chunkSize = WritableStreamDefaultControllerGetChunkSize(controller, chunk);
    if (stream !== writer._ownerWritableStream) {
        return promiseRejectedWith(defaultWriterLockException('write to'));
    }
    const state = stream._state;
    if (state === 'errored') {
        return promiseRejectedWith(stream._storedError);
    }
    if (WritableStreamCloseQueuedOrInFlight(stream) === true || state === 'closed') {
        return promiseRejectedWith(new TypeError('The stream is closing or closed and cannot be written to'));
    }
    if (state === 'erroring') {
        return promiseRejectedWith(stream._storedError);
    }
    const promise = WritableStreamAddWriteRequest(stream);
    WritableStreamDefaultControllerWrite(controller, chunk, chunkSize);
    return promise;
}
class WritableStreamDefaultController {
    /** @internal */
    constructor() {
        throw new TypeError('WritableStreamDefaultController cannot be constructed explicitly');
    }
    error(e) {
        if (IsWritableStreamDefaultController(this) === false) {
            throw new TypeError('WritableStreamDefaultController.prototype.error can only be used on a WritableStreamDefaultController');
        }
        const state = this._controlledWritableStream._state;
        if (state !== 'writable') {
            // The stream is closed, errored or will be soon. The sink can't do anything useful if it gets an error here, so
            // just treat it as a no-op.
            return;
        }
        WritableStreamDefaultControllerError(this, e);
    }
    /** @internal */
    [AbortSteps](reason) {
        const result = this._abortAlgorithm(reason);
        WritableStreamDefaultControllerClearAlgorithms(this);
        return result;
    }
    /** @internal */
    [ErrorSteps]() {
        ResetQueue(this);
    }
}
// Abstract operations implementing interface required by the WritableStream.
function IsWritableStreamDefaultController(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_controlledWritableStream')) {
        return false;
    }
    return true;
}
function SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm) {
    controller._controlledWritableStream = stream;
    stream._writableStreamController = controller;
    // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
    controller._queue = undefined;
    controller._queueTotalSize = undefined;
    ResetQueue(controller);
    controller._started = false;
    controller._strategySizeAlgorithm = sizeAlgorithm;
    controller._strategyHWM = highWaterMark;
    controller._writeAlgorithm = writeAlgorithm;
    controller._closeAlgorithm = closeAlgorithm;
    controller._abortAlgorithm = abortAlgorithm;
    const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
    WritableStreamUpdateBackpressure(stream, backpressure);
    const startResult = startAlgorithm();
    const startPromise = promiseResolvedWith(startResult);
    uponPromise(startPromise, () => {
        controller._started = true;
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }, r => {
        controller._started = true;
        WritableStreamDealWithRejection(stream, r);
    });
}
function SetUpWritableStreamDefaultControllerFromUnderlyingSink(stream, underlyingSink, highWaterMark, sizeAlgorithm) {
    const controller = Object.create(WritableStreamDefaultController.prototype);
    function startAlgorithm() {
        return InvokeOrNoop(underlyingSink, 'start', [controller]);
    }
    const writeAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingSink, 'write', 1, [controller]);
    const closeAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingSink, 'close', 0, []);
    const abortAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingSink, 'abort', 1, []);
    SetUpWritableStreamDefaultController(stream, controller, startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, highWaterMark, sizeAlgorithm);
}
// ClearAlgorithms may be called twice. Erroring the same stream in multiple ways will often result in redundant calls.
function WritableStreamDefaultControllerClearAlgorithms(controller) {
    controller._writeAlgorithm = undefined;
    controller._closeAlgorithm = undefined;
    controller._abortAlgorithm = undefined;
    controller._strategySizeAlgorithm = undefined;
}
function WritableStreamDefaultControllerClose(controller) {
    EnqueueValueWithSize(controller, 'close', 0);
    WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
}
function WritableStreamDefaultControllerGetChunkSize(controller, chunk) {
    try {
        return controller._strategySizeAlgorithm(chunk);
    }
    catch (chunkSizeE) {
        WritableStreamDefaultControllerErrorIfNeeded(controller, chunkSizeE);
        return 1;
    }
}
function WritableStreamDefaultControllerGetDesiredSize(controller) {
    return controller._strategyHWM - controller._queueTotalSize;
}
function WritableStreamDefaultControllerWrite(controller, chunk, chunkSize) {
    const writeRecord = { chunk };
    try {
        EnqueueValueWithSize(controller, writeRecord, chunkSize);
    }
    catch (enqueueE) {
        WritableStreamDefaultControllerErrorIfNeeded(controller, enqueueE);
        return;
    }
    const stream = controller._controlledWritableStream;
    if (WritableStreamCloseQueuedOrInFlight(stream) === false && stream._state === 'writable') {
        const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
        WritableStreamUpdateBackpressure(stream, backpressure);
    }
    WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
}
// Abstract operations for the WritableStreamDefaultController.
function WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller) {
    const stream = controller._controlledWritableStream;
    if (controller._started === false) {
        return;
    }
    if (stream._inFlightWriteRequest !== undefined) {
        return;
    }
    const state = stream._state;
    if (state === 'erroring') {
        WritableStreamFinishErroring(stream);
        return;
    }
    if (controller._queue.length === 0) {
        return;
    }
    const writeRecord = PeekQueueValue(controller);
    if (writeRecord === 'close') {
        WritableStreamDefaultControllerProcessClose(controller);
    }
    else {
        WritableStreamDefaultControllerProcessWrite(controller, writeRecord.chunk);
    }
}
function WritableStreamDefaultControllerErrorIfNeeded(controller, error) {
    if (controller._controlledWritableStream._state === 'writable') {
        WritableStreamDefaultControllerError(controller, error);
    }
}
function WritableStreamDefaultControllerProcessClose(controller) {
    const stream = controller._controlledWritableStream;
    WritableStreamMarkCloseRequestInFlight(stream);
    DequeueValue(controller);
    const sinkClosePromise = controller._closeAlgorithm();
    WritableStreamDefaultControllerClearAlgorithms(controller);
    uponPromise(sinkClosePromise, () => {
        WritableStreamFinishInFlightClose(stream);
    }, reason => {
        WritableStreamFinishInFlightCloseWithError(stream, reason);
    });
}
function WritableStreamDefaultControllerProcessWrite(controller, chunk) {
    const stream = controller._controlledWritableStream;
    WritableStreamMarkFirstWriteRequestInFlight(stream);
    const sinkWritePromise = controller._writeAlgorithm(chunk);
    uponPromise(sinkWritePromise, () => {
        WritableStreamFinishInFlightWrite(stream);
        const state = stream._state;
        DequeueValue(controller);
        if (WritableStreamCloseQueuedOrInFlight(stream) === false && state === 'writable') {
            const backpressure = WritableStreamDefaultControllerGetBackpressure(controller);
            WritableStreamUpdateBackpressure(stream, backpressure);
        }
        WritableStreamDefaultControllerAdvanceQueueIfNeeded(controller);
    }, reason => {
        if (stream._state === 'writable') {
            WritableStreamDefaultControllerClearAlgorithms(controller);
        }
        WritableStreamFinishInFlightWriteWithError(stream, reason);
    });
}
function WritableStreamDefaultControllerGetBackpressure(controller) {
    const desiredSize = WritableStreamDefaultControllerGetDesiredSize(controller);
    return desiredSize <= 0;
}
// A client of WritableStreamDefaultController may use these functions directly to bypass state check.
function WritableStreamDefaultControllerError(controller, error) {
    const stream = controller._controlledWritableStream;
    WritableStreamDefaultControllerClearAlgorithms(controller);
    WritableStreamStartErroring(stream, error);
}
// Helper functions for the WritableStream.
function streamBrandCheckException(name) {
    return new TypeError(`WritableStream.prototype.${name} can only be used on a WritableStream`);
}
// Helper functions for the WritableStreamDefaultWriter.
function defaultWriterBrandCheckException(name) {
    return new TypeError(`WritableStreamDefaultWriter.prototype.${name} can only be used on a WritableStreamDefaultWriter`);
}
function defaultWriterLockException(name) {
    return new TypeError('Cannot ' + name + ' a stream using a released writer');
}
function defaultWriterClosedPromiseInitialize(writer) {
    writer._closedPromise = newPromise((resolve, reject) => {
        writer._closedPromise_resolve = resolve;
        writer._closedPromise_reject = reject;
        writer._closedPromiseState = 'pending';
    });
}
function defaultWriterClosedPromiseInitializeAsRejected(writer, reason) {
    defaultWriterClosedPromiseInitialize(writer);
    defaultWriterClosedPromiseReject(writer, reason);
}
function defaultWriterClosedPromiseInitializeAsResolved(writer) {
    defaultWriterClosedPromiseInitialize(writer);
    defaultWriterClosedPromiseResolve(writer);
}
function defaultWriterClosedPromiseReject(writer, reason) {
    setPromiseIsHandledToTrue(writer._closedPromise);
    writer._closedPromise_reject(reason);
    writer._closedPromise_resolve = undefined;
    writer._closedPromise_reject = undefined;
    writer._closedPromiseState = 'rejected';
}
function defaultWriterClosedPromiseResetToRejected(writer, reason) {
    defaultWriterClosedPromiseInitializeAsRejected(writer, reason);
}
function defaultWriterClosedPromiseResolve(writer) {
    writer._closedPromise_resolve(undefined);
    writer._closedPromise_resolve = undefined;
    writer._closedPromise_reject = undefined;
    writer._closedPromiseState = 'resolved';
}
function defaultWriterReadyPromiseInitialize(writer) {
    writer._readyPromise = newPromise((resolve, reject) => {
        writer._readyPromise_resolve = resolve;
        writer._readyPromise_reject = reject;
    });
    writer._readyPromiseState = 'pending';
}
function defaultWriterReadyPromiseInitializeAsRejected(writer, reason) {
    defaultWriterReadyPromiseInitialize(writer);
    defaultWriterReadyPromiseReject(writer, reason);
}
function defaultWriterReadyPromiseInitializeAsResolved(writer) {
    defaultWriterReadyPromiseInitialize(writer);
    defaultWriterReadyPromiseResolve(writer);
}
function defaultWriterReadyPromiseReject(writer, reason) {
    setPromiseIsHandledToTrue(writer._readyPromise);
    writer._readyPromise_reject(reason);
    writer._readyPromise_resolve = undefined;
    writer._readyPromise_reject = undefined;
    writer._readyPromiseState = 'rejected';
}
function defaultWriterReadyPromiseReset(writer) {
    defaultWriterReadyPromiseInitialize(writer);
}
function defaultWriterReadyPromiseResetToRejected(writer, reason) {
    defaultWriterReadyPromiseInitializeAsRejected(writer, reason);
}
function defaultWriterReadyPromiseResolve(writer) {
    writer._readyPromise_resolve(undefined);
    writer._readyPromise_resolve = undefined;
    writer._readyPromise_reject = undefined;
    writer._readyPromiseState = 'fulfilled';
}

function isAbortSignal(value) {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    try {
        return typeof value.aborted === 'boolean';
    }
    catch {
        // AbortSignal.prototype.aborted throws if its brand check fails
        return false;
    }
}

/// <reference lib="dom" />
const NativeDOMException = typeof DOMException !== 'undefined' ? DOMException : undefined;

/// <reference types="node" />
function isDOMExceptionConstructor(ctor) {
    if (!(typeof ctor === 'function' || typeof ctor === 'object')) {
        return false;
    }
    try {
        new ctor();
        return true;
    }
    catch {
        return false;
    }
}
function createDOMExceptionPolyfill() {
    const ctor = function DOMException(message, name) {
        this.message = message || '';
        this.name = name || 'Error';
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    };
    ctor.prototype = Object.create(Error.prototype);
    Object.defineProperty(ctor.prototype, 'constructor', { value: ctor, writable: true, configurable: true });
    return ctor;
}
const DOMException$1 = isDOMExceptionConstructor(NativeDOMException) ? NativeDOMException : createDOMExceptionPolyfill();

function ReadableStreamPipeTo(source, dest, preventClose, preventAbort, preventCancel, signal) {
    const reader = AcquireReadableStreamDefaultReader(source);
    const writer = AcquireWritableStreamDefaultWriter(dest);
    source._disturbed = true;
    let shuttingDown = false;
    // This is used to keep track of the spec's requirement that we wait for ongoing writes during shutdown.
    let currentWrite = promiseResolvedWith(undefined);
    return newPromise((resolve, reject) => {
        let abortAlgorithm;
        if (signal !== undefined) {
            abortAlgorithm = () => {
                const error = new DOMException$1('Aborted', 'AbortError');
                const actions = [];
                if (preventAbort === false) {
                    actions.push(() => {
                        if (dest._state === 'writable') {
                            return WritableStreamAbort(dest, error);
                        }
                        return promiseResolvedWith(undefined);
                    });
                }
                if (preventCancel === false) {
                    actions.push(() => {
                        if (source._state === 'readable') {
                            return ReadableStreamCancel(source, error);
                        }
                        return promiseResolvedWith(undefined);
                    });
                }
                shutdownWithAction(() => Promise.all(actions.map(action => action())), true, error);
            };
            if (signal.aborted === true) {
                abortAlgorithm();
                return;
            }
            signal.addEventListener('abort', abortAlgorithm);
        }
        // Using reader and writer, read all chunks from this and write them to dest
        // - Backpressure must be enforced
        // - Shutdown must stop all activity
        function pipeLoop() {
            return newPromise((resolveLoop, rejectLoop) => {
                function next(done) {
                    if (done) {
                        resolveLoop();
                    }
                    else {
                        // Use `PerformPromiseThen` instead of `uponPromise` to avoid
                        // adding unnecessary `.catch(rethrowAssertionErrorRejection)` handlers
                        PerformPromiseThen(pipeStep(), next, rejectLoop);
                    }
                }
                next(false);
            });
        }
        function pipeStep() {
            if (shuttingDown === true) {
                return promiseResolvedWith(true);
            }
            return PerformPromiseThen(writer._readyPromise, () => {
                return PerformPromiseThen(ReadableStreamDefaultReaderRead(reader), result => {
                    if (result.done === true) {
                        return true;
                    }
                    currentWrite = PerformPromiseThen(WritableStreamDefaultWriterWrite(writer, result.value), undefined, noop);
                    return false;
                });
            });
        }
        // Errors must be propagated forward
        isOrBecomesErrored(source, reader._closedPromise, storedError => {
            if (preventAbort === false) {
                shutdownWithAction(() => WritableStreamAbort(dest, storedError), true, storedError);
            }
            else {
                shutdown(true, storedError);
            }
        });
        // Errors must be propagated backward
        isOrBecomesErrored(dest, writer._closedPromise, storedError => {
            if (preventCancel === false) {
                shutdownWithAction(() => ReadableStreamCancel(source, storedError), true, storedError);
            }
            else {
                shutdown(true, storedError);
            }
        });
        // Closing must be propagated forward
        isOrBecomesClosed(source, reader._closedPromise, () => {
            if (preventClose === false) {
                shutdownWithAction(() => WritableStreamDefaultWriterCloseWithErrorPropagation(writer));
            }
            else {
                shutdown();
            }
        });
        // Closing must be propagated backward
        if (WritableStreamCloseQueuedOrInFlight(dest) === true || dest._state === 'closed') {
            const destClosed = new TypeError('the destination writable stream closed before all data could be piped to it');
            if (preventCancel === false) {
                shutdownWithAction(() => ReadableStreamCancel(source, destClosed), true, destClosed);
            }
            else {
                shutdown(true, destClosed);
            }
        }
        setPromiseIsHandledToTrue(pipeLoop());
        function waitForWritesToFinish() {
            // Another write may have started while we were waiting on this currentWrite, so we have to be sure to wait
            // for that too.
            const oldCurrentWrite = currentWrite;
            return PerformPromiseThen(currentWrite, () => oldCurrentWrite !== currentWrite ? waitForWritesToFinish() : undefined);
        }
        function isOrBecomesErrored(stream, promise, action) {
            if (stream._state === 'errored') {
                action(stream._storedError);
            }
            else {
                uponRejection(promise, action);
            }
        }
        function isOrBecomesClosed(stream, promise, action) {
            if (stream._state === 'closed') {
                action();
            }
            else {
                uponFulfillment(promise, action);
            }
        }
        function shutdownWithAction(action, originalIsError, originalError) {
            if (shuttingDown === true) {
                return;
            }
            shuttingDown = true;
            if (dest._state === 'writable' && WritableStreamCloseQueuedOrInFlight(dest) === false) {
                uponFulfillment(waitForWritesToFinish(), doTheRest);
            }
            else {
                doTheRest();
            }
            function doTheRest() {
                uponPromise(action(), () => finalize(originalIsError, originalError), newError => finalize(true, newError));
            }
        }
        function shutdown(isError, error) {
            if (shuttingDown === true) {
                return;
            }
            shuttingDown = true;
            if (dest._state === 'writable' && WritableStreamCloseQueuedOrInFlight(dest) === false) {
                uponFulfillment(waitForWritesToFinish(), () => finalize(isError, error));
            }
            else {
                finalize(isError, error);
            }
        }
        function finalize(isError, error) {
            WritableStreamDefaultWriterRelease(writer);
            ReadableStreamReaderGenericRelease(reader);
            if (signal !== undefined) {
                signal.removeEventListener('abort', abortAlgorithm);
            }
            if (isError) {
                reject(error);
            }
            else {
                resolve(undefined);
            }
        }
    });
}

class ReadableStreamDefaultController {
    /** @internal */
    constructor() {
        throw new TypeError();
    }
    get desiredSize() {
        if (IsReadableStreamDefaultController(this) === false) {
            throw defaultControllerBrandCheckException('desiredSize');
        }
        return ReadableStreamDefaultControllerGetDesiredSize(this);
    }
    close() {
        if (IsReadableStreamDefaultController(this) === false) {
            throw defaultControllerBrandCheckException('close');
        }
        if (ReadableStreamDefaultControllerCanCloseOrEnqueue(this) === false) {
            throw new TypeError('The stream is not in a state that permits close');
        }
        ReadableStreamDefaultControllerClose(this);
    }
    enqueue(chunk) {
        if (IsReadableStreamDefaultController(this) === false) {
            throw defaultControllerBrandCheckException('enqueue');
        }
        if (ReadableStreamDefaultControllerCanCloseOrEnqueue(this) === false) {
            throw new TypeError('The stream is not in a state that permits enqueue');
        }
        return ReadableStreamDefaultControllerEnqueue(this, chunk);
    }
    error(e) {
        if (IsReadableStreamDefaultController(this) === false) {
            throw defaultControllerBrandCheckException('error');
        }
        ReadableStreamDefaultControllerError(this, e);
    }
    /** @internal */
    [CancelSteps](reason) {
        ResetQueue(this);
        const result = this._cancelAlgorithm(reason);
        ReadableStreamDefaultControllerClearAlgorithms(this);
        return result;
    }
    /** @internal */
    [PullSteps]() {
        const stream = this._controlledReadableStream;
        if (this._queue.length > 0) {
            const chunk = DequeueValue(this);
            if (this._closeRequested === true && this._queue.length === 0) {
                ReadableStreamDefaultControllerClearAlgorithms(this);
                ReadableStreamClose(stream);
            }
            else {
                ReadableStreamDefaultControllerCallPullIfNeeded(this);
            }
            return promiseResolvedWith(ReadableStreamCreateReadResult(chunk, false, stream._reader._forAuthorCode));
        }
        const pendingPromise = ReadableStreamAddReadRequest(stream);
        ReadableStreamDefaultControllerCallPullIfNeeded(this);
        return pendingPromise;
    }
}
// Abstract operations for the ReadableStreamDefaultController.
function IsReadableStreamDefaultController(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableStream')) {
        return false;
    }
    return true;
}
function ReadableStreamDefaultControllerCallPullIfNeeded(controller) {
    const shouldPull = ReadableStreamDefaultControllerShouldCallPull(controller);
    if (shouldPull === false) {
        return;
    }
    if (controller._pulling === true) {
        controller._pullAgain = true;
        return;
    }
    controller._pulling = true;
    const pullPromise = controller._pullAlgorithm();
    uponPromise(pullPromise, () => {
        controller._pulling = false;
        if (controller._pullAgain === true) {
            controller._pullAgain = false;
            ReadableStreamDefaultControllerCallPullIfNeeded(controller);
        }
    }, e => {
        ReadableStreamDefaultControllerError(controller, e);
    });
}
function ReadableStreamDefaultControllerShouldCallPull(controller) {
    const stream = controller._controlledReadableStream;
    if (ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) === false) {
        return false;
    }
    if (controller._started === false) {
        return false;
    }
    if (IsReadableStreamLocked(stream) === true && ReadableStreamGetNumReadRequests(stream) > 0) {
        return true;
    }
    const desiredSize = ReadableStreamDefaultControllerGetDesiredSize(controller);
    if (desiredSize > 0) {
        return true;
    }
    return false;
}
function ReadableStreamDefaultControllerClearAlgorithms(controller) {
    controller._pullAlgorithm = undefined;
    controller._cancelAlgorithm = undefined;
    controller._strategySizeAlgorithm = undefined;
}
// A client of ReadableStreamDefaultController may use these functions directly to bypass state check.
function ReadableStreamDefaultControllerClose(controller) {
    const stream = controller._controlledReadableStream;
    controller._closeRequested = true;
    if (controller._queue.length === 0) {
        ReadableStreamDefaultControllerClearAlgorithms(controller);
        ReadableStreamClose(stream);
    }
}
function ReadableStreamDefaultControllerEnqueue(controller, chunk) {
    const stream = controller._controlledReadableStream;
    if (IsReadableStreamLocked(stream) === true && ReadableStreamGetNumReadRequests(stream) > 0) {
        ReadableStreamFulfillReadRequest(stream, chunk, false);
    }
    else {
        let chunkSize;
        try {
            chunkSize = controller._strategySizeAlgorithm(chunk);
        }
        catch (chunkSizeE) {
            ReadableStreamDefaultControllerError(controller, chunkSizeE);
            throw chunkSizeE;
        }
        try {
            EnqueueValueWithSize(controller, chunk, chunkSize);
        }
        catch (enqueueE) {
            ReadableStreamDefaultControllerError(controller, enqueueE);
            throw enqueueE;
        }
    }
    ReadableStreamDefaultControllerCallPullIfNeeded(controller);
}
function ReadableStreamDefaultControllerError(controller, e) {
    const stream = controller._controlledReadableStream;
    if (stream._state !== 'readable') {
        return;
    }
    ResetQueue(controller);
    ReadableStreamDefaultControllerClearAlgorithms(controller);
    ReadableStreamError(stream, e);
}
function ReadableStreamDefaultControllerGetDesiredSize(controller) {
    const stream = controller._controlledReadableStream;
    const state = stream._state;
    if (state === 'errored') {
        return null;
    }
    if (state === 'closed') {
        return 0;
    }
    return controller._strategyHWM - controller._queueTotalSize;
}
// This is used in the implementation of TransformStream.
function ReadableStreamDefaultControllerHasBackpressure(controller) {
    if (ReadableStreamDefaultControllerShouldCallPull(controller) === true) {
        return false;
    }
    return true;
}
function ReadableStreamDefaultControllerCanCloseOrEnqueue(controller) {
    const state = controller._controlledReadableStream._state;
    if (controller._closeRequested === false && state === 'readable') {
        return true;
    }
    return false;
}
function SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm) {
    controller._controlledReadableStream = stream;
    controller._queue = undefined;
    controller._queueTotalSize = undefined;
    ResetQueue(controller);
    controller._started = false;
    controller._closeRequested = false;
    controller._pullAgain = false;
    controller._pulling = false;
    controller._strategySizeAlgorithm = sizeAlgorithm;
    controller._strategyHWM = highWaterMark;
    controller._pullAlgorithm = pullAlgorithm;
    controller._cancelAlgorithm = cancelAlgorithm;
    stream._readableStreamController = controller;
    const startResult = startAlgorithm();
    uponPromise(promiseResolvedWith(startResult), () => {
        controller._started = true;
        ReadableStreamDefaultControllerCallPullIfNeeded(controller);
    }, r => {
        ReadableStreamDefaultControllerError(controller, r);
    });
}
function SetUpReadableStreamDefaultControllerFromUnderlyingSource(stream, underlyingSource, highWaterMark, sizeAlgorithm) {
    const controller = Object.create(ReadableStreamDefaultController.prototype);
    function startAlgorithm() {
        return InvokeOrNoop(underlyingSource, 'start', [controller]);
    }
    const pullAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingSource, 'pull', 0, [controller]);
    const cancelAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingSource, 'cancel', 1, []);
    SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
}
// Helper functions for the ReadableStreamDefaultController.
function defaultControllerBrandCheckException(name) {
    return new TypeError(`ReadableStreamDefaultController.prototype.${name} can only be used on a ReadableStreamDefaultController`);
}

function ReadableStreamTee(stream, cloneForBranch2) {
    const reader = AcquireReadableStreamDefaultReader(stream);
    let reading = false;
    let canceled1 = false;
    let canceled2 = false;
    let reason1;
    let reason2;
    let branch1;
    let branch2;
    let resolveCancelPromise;
    const cancelPromise = newPromise(resolve => {
        resolveCancelPromise = resolve;
    });
    function pullAlgorithm() {
        if (reading === true) {
            return promiseResolvedWith(undefined);
        }
        reading = true;
        const readPromise = transformPromiseWith(ReadableStreamDefaultReaderRead(reader), result => {
            reading = false;
            const done = result.done;
            if (done === true) {
                if (canceled1 === false) {
                    ReadableStreamDefaultControllerClose(branch1._readableStreamController);
                }
                if (canceled2 === false) {
                    ReadableStreamDefaultControllerClose(branch2._readableStreamController);
                }
                return;
            }
            const value = result.value;
            const value1 = value;
            const value2 = value;
            // There is no way to access the cloning code right now in the reference implementation.
            // If we add one then we'll need an implementation for serializable objects.
            // if (canceled2 === false && cloneForBranch2 === true) {
            //   value2 = StructuredDeserialize(StructuredSerialize(value2));
            // }
            if (canceled1 === false) {
                ReadableStreamDefaultControllerEnqueue(branch1._readableStreamController, value1);
            }
            if (canceled2 === false) {
                ReadableStreamDefaultControllerEnqueue(branch2._readableStreamController, value2);
            }
        });
        setPromiseIsHandledToTrue(readPromise);
        return promiseResolvedWith(undefined);
    }
    function cancel1Algorithm(reason) {
        canceled1 = true;
        reason1 = reason;
        if (canceled2 === true) {
            const compositeReason = createArrayFromList([reason1, reason2]);
            const cancelResult = ReadableStreamCancel(stream, compositeReason);
            resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
    }
    function cancel2Algorithm(reason) {
        canceled2 = true;
        reason2 = reason;
        if (canceled1 === true) {
            const compositeReason = createArrayFromList([reason1, reason2]);
            const cancelResult = ReadableStreamCancel(stream, compositeReason);
            resolveCancelPromise(cancelResult);
        }
        return cancelPromise;
    }
    function startAlgorithm() { }
    branch1 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel1Algorithm);
    branch2 = CreateReadableStream(startAlgorithm, pullAlgorithm, cancel2Algorithm);
    uponRejection(reader._closedPromise, (r) => {
        ReadableStreamDefaultControllerError(branch1._readableStreamController, r);
        ReadableStreamDefaultControllerError(branch2._readableStreamController, r);
    });
    return [branch1, branch2];
}

/// <reference lib="es2015.core" />
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger#Polyfill
const NumberIsInteger = Number.isInteger || function (value) {
    return typeof value === 'number' &&
        isFinite(value) &&
        Math.floor(value) === value;
};

class ReadableStreamBYOBRequest {
    /** @internal */
    constructor() {
        throw new TypeError('ReadableStreamBYOBRequest cannot be used directly');
    }
    get view() {
        if (IsReadableStreamBYOBRequest(this) === false) {
            throw byobRequestBrandCheckException('view');
        }
        return this._view;
    }
    respond(bytesWritten) {
        if (IsReadableStreamBYOBRequest(this) === false) {
            throw byobRequestBrandCheckException('respond');
        }
        if (this._associatedReadableByteStreamController === undefined) {
            throw new TypeError('This BYOB request has been invalidated');
        }
        if (IsDetachedBuffer(this._view.buffer) === true) ;
        ReadableByteStreamControllerRespond(this._associatedReadableByteStreamController, bytesWritten);
    }
    respondWithNewView(view) {
        if (IsReadableStreamBYOBRequest(this) === false) {
            throw byobRequestBrandCheckException('respond');
        }
        if (this._associatedReadableByteStreamController === undefined) {
            throw new TypeError('This BYOB request has been invalidated');
        }
        if (!ArrayBuffer.isView(view)) {
            throw new TypeError('You can only respond with array buffer views');
        }
        if (IsDetachedBuffer(view.buffer) === true) ;
        ReadableByteStreamControllerRespondWithNewView(this._associatedReadableByteStreamController, view);
    }
}
class ReadableByteStreamController {
    /** @internal */
    constructor() {
        throw new TypeError('ReadableByteStreamController constructor cannot be used directly');
    }
    get byobRequest() {
        if (IsReadableByteStreamController(this) === false) {
            throw byteStreamControllerBrandCheckException('byobRequest');
        }
        if (this._byobRequest === undefined && this._pendingPullIntos.length > 0) {
            const firstDescriptor = this._pendingPullIntos.peek();
            const view = new Uint8Array(firstDescriptor.buffer, firstDescriptor.byteOffset + firstDescriptor.bytesFilled, firstDescriptor.byteLength - firstDescriptor.bytesFilled);
            const byobRequest = Object.create(ReadableStreamBYOBRequest.prototype);
            SetUpReadableStreamBYOBRequest(byobRequest, this, view);
            this._byobRequest = byobRequest;
        }
        return this._byobRequest;
    }
    get desiredSize() {
        if (IsReadableByteStreamController(this) === false) {
            throw byteStreamControllerBrandCheckException('desiredSize');
        }
        return ReadableByteStreamControllerGetDesiredSize(this);
    }
    close() {
        if (IsReadableByteStreamController(this) === false) {
            throw byteStreamControllerBrandCheckException('close');
        }
        if (this._closeRequested === true) {
            throw new TypeError('The stream has already been closed; do not close it again!');
        }
        const state = this._controlledReadableByteStream._state;
        if (state !== 'readable') {
            throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be closed`);
        }
        ReadableByteStreamControllerClose(this);
    }
    enqueue(chunk) {
        if (IsReadableByteStreamController(this) === false) {
            throw byteStreamControllerBrandCheckException('enqueue');
        }
        if (this._closeRequested === true) {
            throw new TypeError('stream is closed or draining');
        }
        const state = this._controlledReadableByteStream._state;
        if (state !== 'readable') {
            throw new TypeError(`The stream (in ${state} state) is not in the readable state and cannot be enqueued to`);
        }
        if (!ArrayBuffer.isView(chunk)) {
            throw new TypeError('You can only enqueue array buffer views when using a ReadableByteStreamController');
        }
        if (IsDetachedBuffer(chunk.buffer) === true) ;
        ReadableByteStreamControllerEnqueue(this, chunk);
    }
    error(e) {
        if (IsReadableByteStreamController(this) === false) {
            throw byteStreamControllerBrandCheckException('error');
        }
        ReadableByteStreamControllerError(this, e);
    }
    /** @internal */
    [CancelSteps](reason) {
        if (this._pendingPullIntos.length > 0) {
            const firstDescriptor = this._pendingPullIntos.peek();
            firstDescriptor.bytesFilled = 0;
        }
        ResetQueue(this);
        const result = this._cancelAlgorithm(reason);
        ReadableByteStreamControllerClearAlgorithms(this);
        return result;
    }
    /** @internal */
    [PullSteps]() {
        const stream = this._controlledReadableByteStream;
        if (this._queueTotalSize > 0) {
            const entry = this._queue.shift();
            this._queueTotalSize -= entry.byteLength;
            ReadableByteStreamControllerHandleQueueDrain(this);
            let view;
            try {
                view = new Uint8Array(entry.buffer, entry.byteOffset, entry.byteLength);
            }
            catch (viewE) {
                return promiseRejectedWith(viewE);
            }
            return promiseResolvedWith(ReadableStreamCreateReadResult(view, false, stream._reader._forAuthorCode));
        }
        const autoAllocateChunkSize = this._autoAllocateChunkSize;
        if (autoAllocateChunkSize !== undefined) {
            let buffer;
            try {
                buffer = new ArrayBuffer(autoAllocateChunkSize);
            }
            catch (bufferE) {
                return promiseRejectedWith(bufferE);
            }
            const pullIntoDescriptor = {
                buffer,
                byteOffset: 0,
                byteLength: autoAllocateChunkSize,
                bytesFilled: 0,
                elementSize: 1,
                ctor: Uint8Array,
                readerType: 'default'
            };
            this._pendingPullIntos.push(pullIntoDescriptor);
        }
        const promise = ReadableStreamAddReadRequest(stream);
        ReadableByteStreamControllerCallPullIfNeeded(this);
        return promise;
    }
}
// Abstract operations for the ReadableByteStreamController.
function IsReadableByteStreamController(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_controlledReadableByteStream')) {
        return false;
    }
    return true;
}
function IsReadableStreamBYOBRequest(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_associatedReadableByteStreamController')) {
        return false;
    }
    return true;
}
function ReadableByteStreamControllerCallPullIfNeeded(controller) {
    const shouldPull = ReadableByteStreamControllerShouldCallPull(controller);
    if (shouldPull === false) {
        return;
    }
    if (controller._pulling === true) {
        controller._pullAgain = true;
        return;
    }
    controller._pulling = true;
    // TODO: Test controller argument
    const pullPromise = controller._pullAlgorithm();
    uponPromise(pullPromise, () => {
        controller._pulling = false;
        if (controller._pullAgain === true) {
            controller._pullAgain = false;
            ReadableByteStreamControllerCallPullIfNeeded(controller);
        }
    }, e => {
        ReadableByteStreamControllerError(controller, e);
    });
}
function ReadableByteStreamControllerClearPendingPullIntos(controller) {
    ReadableByteStreamControllerInvalidateBYOBRequest(controller);
    controller._pendingPullIntos = new SimpleQueue();
}
function ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor) {
    let done = false;
    if (stream._state === 'closed') {
        done = true;
    }
    const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
    if (pullIntoDescriptor.readerType === 'default') {
        ReadableStreamFulfillReadRequest(stream, filledView, done);
    }
    else {
        ReadableStreamFulfillReadIntoRequest(stream, filledView, done);
    }
}
function ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor) {
    const bytesFilled = pullIntoDescriptor.bytesFilled;
    const elementSize = pullIntoDescriptor.elementSize;
    return new pullIntoDescriptor.ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, bytesFilled / elementSize);
}
function ReadableByteStreamControllerEnqueueChunkToQueue(controller, buffer, byteOffset, byteLength) {
    controller._queue.push({ buffer, byteOffset, byteLength });
    controller._queueTotalSize += byteLength;
}
function ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) {
    const elementSize = pullIntoDescriptor.elementSize;
    const currentAlignedBytes = pullIntoDescriptor.bytesFilled - pullIntoDescriptor.bytesFilled % elementSize;
    const maxBytesToCopy = Math.min(controller._queueTotalSize, pullIntoDescriptor.byteLength - pullIntoDescriptor.bytesFilled);
    const maxBytesFilled = pullIntoDescriptor.bytesFilled + maxBytesToCopy;
    const maxAlignedBytes = maxBytesFilled - maxBytesFilled % elementSize;
    let totalBytesToCopyRemaining = maxBytesToCopy;
    let ready = false;
    if (maxAlignedBytes > currentAlignedBytes) {
        totalBytesToCopyRemaining = maxAlignedBytes - pullIntoDescriptor.bytesFilled;
        ready = true;
    }
    const queue = controller._queue;
    while (totalBytesToCopyRemaining > 0) {
        const headOfQueue = queue.peek();
        const bytesToCopy = Math.min(totalBytesToCopyRemaining, headOfQueue.byteLength);
        const destStart = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
        ArrayBufferCopy(pullIntoDescriptor.buffer, destStart, headOfQueue.buffer, headOfQueue.byteOffset, bytesToCopy);
        if (headOfQueue.byteLength === bytesToCopy) {
            queue.shift();
        }
        else {
            headOfQueue.byteOffset += bytesToCopy;
            headOfQueue.byteLength -= bytesToCopy;
        }
        controller._queueTotalSize -= bytesToCopy;
        ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesToCopy, pullIntoDescriptor);
        totalBytesToCopyRemaining -= bytesToCopy;
    }
    return ready;
}
function ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, size, pullIntoDescriptor) {
    ReadableByteStreamControllerInvalidateBYOBRequest(controller);
    pullIntoDescriptor.bytesFilled += size;
}
function ReadableByteStreamControllerHandleQueueDrain(controller) {
    if (controller._queueTotalSize === 0 && controller._closeRequested === true) {
        ReadableByteStreamControllerClearAlgorithms(controller);
        ReadableStreamClose(controller._controlledReadableByteStream);
    }
    else {
        ReadableByteStreamControllerCallPullIfNeeded(controller);
    }
}
function ReadableByteStreamControllerInvalidateBYOBRequest(controller) {
    if (controller._byobRequest === undefined) {
        return;
    }
    controller._byobRequest._associatedReadableByteStreamController = undefined;
    controller._byobRequest._view = undefined;
    controller._byobRequest = undefined;
}
function ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller) {
    while (controller._pendingPullIntos.length > 0) {
        if (controller._queueTotalSize === 0) {
            return;
        }
        const pullIntoDescriptor = controller._pendingPullIntos.peek();
        if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) === true) {
            ReadableByteStreamControllerShiftPendingPullInto(controller);
            ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
        }
    }
}
function ReadableByteStreamControllerPullInto(controller, view) {
    const stream = controller._controlledReadableByteStream;
    let elementSize = 1;
    if (view.constructor !== DataView) {
        elementSize = view.constructor.BYTES_PER_ELEMENT;
    }
    const ctor = view.constructor;
    const buffer = TransferArrayBuffer(view.buffer);
    const pullIntoDescriptor = {
        buffer,
        byteOffset: view.byteOffset,
        byteLength: view.byteLength,
        bytesFilled: 0,
        elementSize,
        ctor,
        readerType: 'byob'
    };
    if (controller._pendingPullIntos.length > 0) {
        controller._pendingPullIntos.push(pullIntoDescriptor);
        // No ReadableByteStreamControllerCallPullIfNeeded() call since:
        // - No change happens on desiredSize
        // - The source has already been notified of that there's at least 1 pending read(view)
        return ReadableStreamAddReadIntoRequest(stream);
    }
    if (stream._state === 'closed') {
        const emptyView = new ctor(pullIntoDescriptor.buffer, pullIntoDescriptor.byteOffset, 0);
        return promiseResolvedWith(ReadableStreamCreateReadResult(emptyView, true, stream._reader._forAuthorCode));
    }
    if (controller._queueTotalSize > 0) {
        if (ReadableByteStreamControllerFillPullIntoDescriptorFromQueue(controller, pullIntoDescriptor) === true) {
            const filledView = ReadableByteStreamControllerConvertPullIntoDescriptor(pullIntoDescriptor);
            ReadableByteStreamControllerHandleQueueDrain(controller);
            return promiseResolvedWith(ReadableStreamCreateReadResult(filledView, false, stream._reader._forAuthorCode));
        }
        if (controller._closeRequested === true) {
            const e = new TypeError('Insufficient bytes to fill elements in the given buffer');
            ReadableByteStreamControllerError(controller, e);
            return promiseRejectedWith(e);
        }
    }
    controller._pendingPullIntos.push(pullIntoDescriptor);
    const promise = ReadableStreamAddReadIntoRequest(stream);
    ReadableByteStreamControllerCallPullIfNeeded(controller);
    return promise;
}
function ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor) {
    firstDescriptor.buffer = TransferArrayBuffer(firstDescriptor.buffer);
    const stream = controller._controlledReadableByteStream;
    if (ReadableStreamHasBYOBReader(stream) === true) {
        while (ReadableStreamGetNumReadIntoRequests(stream) > 0) {
            const pullIntoDescriptor = ReadableByteStreamControllerShiftPendingPullInto(controller);
            ReadableByteStreamControllerCommitPullIntoDescriptor(stream, pullIntoDescriptor);
        }
    }
}
function ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, pullIntoDescriptor) {
    if (pullIntoDescriptor.bytesFilled + bytesWritten > pullIntoDescriptor.byteLength) {
        throw new RangeError('bytesWritten out of range');
    }
    ReadableByteStreamControllerFillHeadPullIntoDescriptor(controller, bytesWritten, pullIntoDescriptor);
    if (pullIntoDescriptor.bytesFilled < pullIntoDescriptor.elementSize) {
        // TODO: Figure out whether we should detach the buffer or not here.
        return;
    }
    ReadableByteStreamControllerShiftPendingPullInto(controller);
    const remainderSize = pullIntoDescriptor.bytesFilled % pullIntoDescriptor.elementSize;
    if (remainderSize > 0) {
        const end = pullIntoDescriptor.byteOffset + pullIntoDescriptor.bytesFilled;
        const remainder = pullIntoDescriptor.buffer.slice(end - remainderSize, end);
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, remainder, 0, remainder.byteLength);
    }
    pullIntoDescriptor.buffer = TransferArrayBuffer(pullIntoDescriptor.buffer);
    pullIntoDescriptor.bytesFilled -= remainderSize;
    ReadableByteStreamControllerCommitPullIntoDescriptor(controller._controlledReadableByteStream, pullIntoDescriptor);
    ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
}
function ReadableByteStreamControllerRespondInternal(controller, bytesWritten) {
    const firstDescriptor = controller._pendingPullIntos.peek();
    const stream = controller._controlledReadableByteStream;
    if (stream._state === 'closed') {
        if (bytesWritten !== 0) {
            throw new TypeError('bytesWritten must be 0 when calling respond() on a closed stream');
        }
        ReadableByteStreamControllerRespondInClosedState(controller, firstDescriptor);
    }
    else {
        ReadableByteStreamControllerRespondInReadableState(controller, bytesWritten, firstDescriptor);
    }
    ReadableByteStreamControllerCallPullIfNeeded(controller);
}
function ReadableByteStreamControllerShiftPendingPullInto(controller) {
    const descriptor = controller._pendingPullIntos.shift();
    ReadableByteStreamControllerInvalidateBYOBRequest(controller);
    return descriptor;
}
function ReadableByteStreamControllerShouldCallPull(controller) {
    const stream = controller._controlledReadableByteStream;
    if (stream._state !== 'readable') {
        return false;
    }
    if (controller._closeRequested === true) {
        return false;
    }
    if (controller._started === false) {
        return false;
    }
    if (ReadableStreamHasDefaultReader(stream) === true && ReadableStreamGetNumReadRequests(stream) > 0) {
        return true;
    }
    if (ReadableStreamHasBYOBReader(stream) === true && ReadableStreamGetNumReadIntoRequests(stream) > 0) {
        return true;
    }
    const desiredSize = ReadableByteStreamControllerGetDesiredSize(controller);
    if (desiredSize > 0) {
        return true;
    }
    return false;
}
function ReadableByteStreamControllerClearAlgorithms(controller) {
    controller._pullAlgorithm = undefined;
    controller._cancelAlgorithm = undefined;
}
// A client of ReadableByteStreamController may use these functions directly to bypass state check.
function ReadableByteStreamControllerClose(controller) {
    const stream = controller._controlledReadableByteStream;
    if (controller._queueTotalSize > 0) {
        controller._closeRequested = true;
        return;
    }
    if (controller._pendingPullIntos.length > 0) {
        const firstPendingPullInto = controller._pendingPullIntos.peek();
        if (firstPendingPullInto.bytesFilled > 0) {
            const e = new TypeError('Insufficient bytes to fill elements in the given buffer');
            ReadableByteStreamControllerError(controller, e);
            throw e;
        }
    }
    ReadableByteStreamControllerClearAlgorithms(controller);
    ReadableStreamClose(stream);
}
function ReadableByteStreamControllerEnqueue(controller, chunk) {
    const stream = controller._controlledReadableByteStream;
    const buffer = chunk.buffer;
    const byteOffset = chunk.byteOffset;
    const byteLength = chunk.byteLength;
    const transferredBuffer = TransferArrayBuffer(buffer);
    if (ReadableStreamHasDefaultReader(stream) === true) {
        if (ReadableStreamGetNumReadRequests(stream) === 0) {
            ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        }
        else {
            const transferredView = new Uint8Array(transferredBuffer, byteOffset, byteLength);
            ReadableStreamFulfillReadRequest(stream, transferredView, false);
        }
    }
    else if (ReadableStreamHasBYOBReader(stream) === true) {
        // TODO: Ideally in this branch detaching should happen only if the buffer is not consumed fully.
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
        ReadableByteStreamControllerProcessPullIntoDescriptorsUsingQueue(controller);
    }
    else {
        ReadableByteStreamControllerEnqueueChunkToQueue(controller, transferredBuffer, byteOffset, byteLength);
    }
    ReadableByteStreamControllerCallPullIfNeeded(controller);
}
function ReadableByteStreamControllerError(controller, e) {
    const stream = controller._controlledReadableByteStream;
    if (stream._state !== 'readable') {
        return;
    }
    ReadableByteStreamControllerClearPendingPullIntos(controller);
    ResetQueue(controller);
    ReadableByteStreamControllerClearAlgorithms(controller);
    ReadableStreamError(stream, e);
}
function ReadableByteStreamControllerGetDesiredSize(controller) {
    const stream = controller._controlledReadableByteStream;
    const state = stream._state;
    if (state === 'errored') {
        return null;
    }
    if (state === 'closed') {
        return 0;
    }
    return controller._strategyHWM - controller._queueTotalSize;
}
function ReadableByteStreamControllerRespond(controller, bytesWritten) {
    bytesWritten = Number(bytesWritten);
    if (IsFiniteNonNegativeNumber(bytesWritten) === false) {
        throw new RangeError('bytesWritten must be a finite');
    }
    ReadableByteStreamControllerRespondInternal(controller, bytesWritten);
}
function ReadableByteStreamControllerRespondWithNewView(controller, view) {
    const firstDescriptor = controller._pendingPullIntos.peek();
    if (firstDescriptor.byteOffset + firstDescriptor.bytesFilled !== view.byteOffset) {
        throw new RangeError('The region specified by view does not match byobRequest');
    }
    if (firstDescriptor.byteLength !== view.byteLength) {
        throw new RangeError('The buffer of view has different capacity than byobRequest');
    }
    firstDescriptor.buffer = view.buffer;
    ReadableByteStreamControllerRespondInternal(controller, view.byteLength);
}
function SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize) {
    controller._controlledReadableByteStream = stream;
    controller._pullAgain = false;
    controller._pulling = false;
    controller._byobRequest = undefined;
    // Need to set the slots so that the assert doesn't fire. In the spec the slots already exist implicitly.
    controller._queue = controller._queueTotalSize = undefined;
    ResetQueue(controller);
    controller._closeRequested = false;
    controller._started = false;
    controller._strategyHWM = ValidateAndNormalizeHighWaterMark(highWaterMark);
    controller._pullAlgorithm = pullAlgorithm;
    controller._cancelAlgorithm = cancelAlgorithm;
    controller._autoAllocateChunkSize = autoAllocateChunkSize;
    controller._pendingPullIntos = new SimpleQueue();
    stream._readableStreamController = controller;
    const startResult = startAlgorithm();
    uponPromise(promiseResolvedWith(startResult), () => {
        controller._started = true;
        ReadableByteStreamControllerCallPullIfNeeded(controller);
    }, r => {
        ReadableByteStreamControllerError(controller, r);
    });
}
function SetUpReadableByteStreamControllerFromUnderlyingSource(stream, underlyingByteSource, highWaterMark) {
    const controller = Object.create(ReadableByteStreamController.prototype);
    function startAlgorithm() {
        return InvokeOrNoop(underlyingByteSource, 'start', [controller]);
    }
    const pullAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingByteSource, 'pull', 0, [controller]);
    const cancelAlgorithm = CreateAlgorithmFromUnderlyingMethod(underlyingByteSource, 'cancel', 1, []);
    let autoAllocateChunkSize = underlyingByteSource.autoAllocateChunkSize;
    if (autoAllocateChunkSize !== undefined) {
        autoAllocateChunkSize = Number(autoAllocateChunkSize);
        if (NumberIsInteger(autoAllocateChunkSize) === false || autoAllocateChunkSize <= 0) {
            throw new RangeError('autoAllocateChunkSize must be a positive integer');
        }
    }
    SetUpReadableByteStreamController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, autoAllocateChunkSize);
}
function SetUpReadableStreamBYOBRequest(request, controller, view) {
    request._associatedReadableByteStreamController = controller;
    request._view = view;
}
// Helper functions for the ReadableStreamBYOBRequest.
function byobRequestBrandCheckException(name) {
    return new TypeError(`ReadableStreamBYOBRequest.prototype.${name} can only be used on a ReadableStreamBYOBRequest`);
}
// Helper functions for the ReadableByteStreamController.
function byteStreamControllerBrandCheckException(name) {
    return new TypeError(`ReadableByteStreamController.prototype.${name} can only be used on a ReadableByteStreamController`);
}

// Abstract operations for the ReadableStream.
function AcquireReadableStreamBYOBReader(stream, forAuthorCode = false) {
    const reader = new ReadableStreamBYOBReader(stream);
    reader._forAuthorCode = forAuthorCode;
    return reader;
}
// ReadableStream API exposed for controllers.
function ReadableStreamAddReadIntoRequest(stream) {
    const promise = newPromise((resolve, reject) => {
        const readIntoRequest = {
            _resolve: resolve,
            _reject: reject
        };
        stream._reader._readIntoRequests.push(readIntoRequest);
    });
    return promise;
}
function ReadableStreamFulfillReadIntoRequest(stream, chunk, done) {
    const reader = stream._reader;
    const readIntoRequest = reader._readIntoRequests.shift();
    readIntoRequest._resolve(ReadableStreamCreateReadResult(chunk, done, reader._forAuthorCode));
}
function ReadableStreamGetNumReadIntoRequests(stream) {
    return stream._reader._readIntoRequests.length;
}
function ReadableStreamHasBYOBReader(stream) {
    const reader = stream._reader;
    if (reader === undefined) {
        return false;
    }
    if (!IsReadableStreamBYOBReader(reader)) {
        return false;
    }
    return true;
}
class ReadableStreamBYOBReader {
    constructor(stream) {
        if (!IsReadableStream(stream)) {
            throw new TypeError('ReadableStreamBYOBReader can only be constructed with a ReadableStream instance given a ' +
                'byte source');
        }
        if (IsReadableByteStreamController(stream._readableStreamController) === false) {
            throw new TypeError('Cannot construct a ReadableStreamBYOBReader for a stream not constructed with a byte ' +
                'source');
        }
        if (IsReadableStreamLocked(stream)) {
            throw new TypeError('This stream has already been locked for exclusive reading by another reader');
        }
        ReadableStreamReaderGenericInitialize(this, stream);
        this._readIntoRequests = new SimpleQueue();
    }
    get closed() {
        if (!IsReadableStreamBYOBReader(this)) {
            return promiseRejectedWith(byobReaderBrandCheckException('closed'));
        }
        return this._closedPromise;
    }
    cancel(reason) {
        if (!IsReadableStreamBYOBReader(this)) {
            return promiseRejectedWith(byobReaderBrandCheckException('cancel'));
        }
        if (this._ownerReadableStream === undefined) {
            return promiseRejectedWith(readerLockException('cancel'));
        }
        return ReadableStreamReaderGenericCancel(this, reason);
    }
    read(view) {
        if (!IsReadableStreamBYOBReader(this)) {
            return promiseRejectedWith(byobReaderBrandCheckException('read'));
        }
        if (this._ownerReadableStream === undefined) {
            return promiseRejectedWith(readerLockException('read from'));
        }
        if (!ArrayBuffer.isView(view)) {
            return promiseRejectedWith(new TypeError('view must be an array buffer view'));
        }
        if (IsDetachedBuffer(view.buffer) === true) ;
        if (view.byteLength === 0) {
            return promiseRejectedWith(new TypeError('view must have non-zero byteLength'));
        }
        return ReadableStreamBYOBReaderRead(this, view);
    }
    releaseLock() {
        if (!IsReadableStreamBYOBReader(this)) {
            throw byobReaderBrandCheckException('releaseLock');
        }
        if (this._ownerReadableStream === undefined) {
            return;
        }
        if (this._readIntoRequests.length > 0) {
            throw new TypeError('Tried to release a reader lock when that reader has pending read() calls un-settled');
        }
        ReadableStreamReaderGenericRelease(this);
    }
}
// Abstract operations for the readers.
function IsReadableStreamBYOBReader(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_readIntoRequests')) {
        return false;
    }
    return true;
}
function ReadableStreamBYOBReaderRead(reader, view) {
    const stream = reader._ownerReadableStream;
    stream._disturbed = true;
    if (stream._state === 'errored') {
        return promiseRejectedWith(stream._storedError);
    }
    // Controllers must implement this.
    return ReadableByteStreamControllerPullInto(stream._readableStreamController, view);
}
// Helper functions for the ReadableStreamBYOBReader.
function byobReaderBrandCheckException(name) {
    return new TypeError(`ReadableStreamBYOBReader.prototype.${name} can only be used on a ReadableStreamBYOBReader`);
}

class ReadableStream {
    constructor(underlyingSource = {}, strategy = {}) {
        InitializeReadableStream(this);
        const size = strategy.size;
        let highWaterMark = strategy.highWaterMark;
        const type = underlyingSource.type;
        const typeString = String(type);
        if (typeString === 'bytes') {
            if (size !== undefined) {
                throw new RangeError('The strategy for a byte stream cannot have a size function');
            }
            if (highWaterMark === undefined) {
                highWaterMark = 0;
            }
            highWaterMark = ValidateAndNormalizeHighWaterMark(highWaterMark);
            SetUpReadableByteStreamControllerFromUnderlyingSource(this, underlyingSource, highWaterMark);
        }
        else if (type === undefined) {
            const sizeAlgorithm = MakeSizeAlgorithmFromSizeFunction(size);
            if (highWaterMark === undefined) {
                highWaterMark = 1;
            }
            highWaterMark = ValidateAndNormalizeHighWaterMark(highWaterMark);
            SetUpReadableStreamDefaultControllerFromUnderlyingSource(this, underlyingSource, highWaterMark, sizeAlgorithm);
        }
        else {
            throw new RangeError('Invalid type is specified');
        }
    }
    get locked() {
        if (IsReadableStream(this) === false) {
            throw streamBrandCheckException$1('locked');
        }
        return IsReadableStreamLocked(this);
    }
    cancel(reason) {
        if (IsReadableStream(this) === false) {
            return promiseRejectedWith(streamBrandCheckException$1('cancel'));
        }
        if (IsReadableStreamLocked(this) === true) {
            return promiseRejectedWith(new TypeError('Cannot cancel a stream that already has a reader'));
        }
        return ReadableStreamCancel(this, reason);
    }
    getReader({ mode } = {}) {
        if (IsReadableStream(this) === false) {
            throw streamBrandCheckException$1('getReader');
        }
        if (mode === undefined) {
            return AcquireReadableStreamDefaultReader(this, true);
        }
        mode = String(mode);
        if (mode === 'byob') {
            return AcquireReadableStreamBYOBReader(this, true);
        }
        throw new RangeError('Invalid mode is specified');
    }
    pipeThrough({ writable, readable }, { preventClose, preventAbort, preventCancel, signal } = {}) {
        if (IsReadableStream(this) === false) {
            throw streamBrandCheckException$1('pipeThrough');
        }
        if (IsWritableStream(writable) === false) {
            throw new TypeError('writable argument to pipeThrough must be a WritableStream');
        }
        if (IsReadableStream(readable) === false) {
            throw new TypeError('readable argument to pipeThrough must be a ReadableStream');
        }
        preventClose = Boolean(preventClose);
        preventAbort = Boolean(preventAbort);
        preventCancel = Boolean(preventCancel);
        if (signal !== undefined && !isAbortSignal(signal)) {
            throw new TypeError('ReadableStream.prototype.pipeThrough\'s signal option must be an AbortSignal');
        }
        if (IsReadableStreamLocked(this) === true) {
            throw new TypeError('ReadableStream.prototype.pipeThrough cannot be used on a locked ReadableStream');
        }
        if (IsWritableStreamLocked(writable) === true) {
            throw new TypeError('ReadableStream.prototype.pipeThrough cannot be used on a locked WritableStream');
        }
        const promise = ReadableStreamPipeTo(this, writable, preventClose, preventAbort, preventCancel, signal);
        setPromiseIsHandledToTrue(promise);
        return readable;
    }
    pipeTo(dest, { preventClose, preventAbort, preventCancel, signal } = {}) {
        if (IsReadableStream(this) === false) {
            return promiseRejectedWith(streamBrandCheckException$1('pipeTo'));
        }
        if (IsWritableStream(dest) === false) {
            return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo\'s first argument must be a WritableStream'));
        }
        preventClose = Boolean(preventClose);
        preventAbort = Boolean(preventAbort);
        preventCancel = Boolean(preventCancel);
        if (signal !== undefined && !isAbortSignal(signal)) {
            return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo\'s signal option must be an AbortSignal'));
        }
        if (IsReadableStreamLocked(this) === true) {
            return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo cannot be used on a locked ReadableStream'));
        }
        if (IsWritableStreamLocked(dest) === true) {
            return promiseRejectedWith(new TypeError('ReadableStream.prototype.pipeTo cannot be used on a locked WritableStream'));
        }
        return ReadableStreamPipeTo(this, dest, preventClose, preventAbort, preventCancel, signal);
    }
    tee() {
        if (IsReadableStream(this) === false) {
            throw streamBrandCheckException$1('tee');
        }
        const branches = ReadableStreamTee(this);
        return createArrayFromList(branches);
    }
    getIterator({ preventCancel = false } = {}) {
        if (IsReadableStream(this) === false) {
            throw streamBrandCheckException$1('getIterator');
        }
        return AcquireReadableStreamAsyncIterator(this, preventCancel);
    }
}
if (typeof SymbolPolyfill.asyncIterator === 'symbol') {
    Object.defineProperty(ReadableStream.prototype, SymbolPolyfill.asyncIterator, {
        value: ReadableStream.prototype.getIterator,
        enumerable: false,
        writable: true,
        configurable: true
    });
}
// Abstract operations for the ReadableStream.
// Throws if and only if startAlgorithm throws.
function CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark = 1, sizeAlgorithm = () => 1) {
    const stream = Object.create(ReadableStream.prototype);
    InitializeReadableStream(stream);
    const controller = Object.create(ReadableStreamDefaultController.prototype);
    SetUpReadableStreamDefaultController(stream, controller, startAlgorithm, pullAlgorithm, cancelAlgorithm, highWaterMark, sizeAlgorithm);
    return stream;
}
function InitializeReadableStream(stream) {
    stream._state = 'readable';
    stream._reader = undefined;
    stream._storedError = undefined;
    stream._disturbed = false;
}
function IsReadableStream(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_readableStreamController')) {
        return false;
    }
    return true;
}
function IsReadableStreamLocked(stream) {
    if (stream._reader === undefined) {
        return false;
    }
    return true;
}
// ReadableStream API exposed for controllers.
function ReadableStreamCancel(stream, reason) {
    stream._disturbed = true;
    if (stream._state === 'closed') {
        return promiseResolvedWith(undefined);
    }
    if (stream._state === 'errored') {
        return promiseRejectedWith(stream._storedError);
    }
    ReadableStreamClose(stream);
    const sourceCancelPromise = stream._readableStreamController[CancelSteps](reason);
    return transformPromiseWith(sourceCancelPromise, noop);
}
function ReadableStreamClose(stream) {
    stream._state = 'closed';
    const reader = stream._reader;
    if (reader === undefined) {
        return;
    }
    if (IsReadableStreamDefaultReader(reader)) {
        reader._readRequests.forEach(readRequest => {
            readRequest._resolve(ReadableStreamCreateReadResult(undefined, true, reader._forAuthorCode));
        });
        reader._readRequests = new SimpleQueue();
    }
    defaultReaderClosedPromiseResolve(reader);
}
function ReadableStreamError(stream, e) {
    stream._state = 'errored';
    stream._storedError = e;
    const reader = stream._reader;
    if (reader === undefined) {
        return;
    }
    if (IsReadableStreamDefaultReader(reader)) {
        reader._readRequests.forEach(readRequest => {
            readRequest._reject(e);
        });
        reader._readRequests = new SimpleQueue();
    }
    else {
        reader._readIntoRequests.forEach(readIntoRequest => {
            readIntoRequest._reject(e);
        });
        reader._readIntoRequests = new SimpleQueue();
    }
    defaultReaderClosedPromiseReject(reader, e);
}
// Helper functions for the ReadableStream.
function streamBrandCheckException$1(name) {
    return new TypeError(`ReadableStream.prototype.${name} can only be used on a ReadableStream`);
}

class ByteLengthQueuingStrategy {
    constructor({ highWaterMark }) {
        this.highWaterMark = highWaterMark;
    }
    size(chunk) {
        return chunk.byteLength;
    }
}

class CountQueuingStrategy {
    constructor({ highWaterMark }) {
        this.highWaterMark = highWaterMark;
    }
    size() {
        return 1;
    }
}

// Class TransformStream
class TransformStream {
    constructor(transformer = {}, writableStrategy = {}, readableStrategy = {}) {
        const writableSizeFunction = writableStrategy.size;
        let writableHighWaterMark = writableStrategy.highWaterMark;
        const readableSizeFunction = readableStrategy.size;
        let readableHighWaterMark = readableStrategy.highWaterMark;
        const writableType = transformer.writableType;
        if (writableType !== undefined) {
            throw new RangeError('Invalid writable type specified');
        }
        const writableSizeAlgorithm = MakeSizeAlgorithmFromSizeFunction(writableSizeFunction);
        if (writableHighWaterMark === undefined) {
            writableHighWaterMark = 1;
        }
        writableHighWaterMark = ValidateAndNormalizeHighWaterMark(writableHighWaterMark);
        const readableType = transformer.readableType;
        if (readableType !== undefined) {
            throw new RangeError('Invalid readable type specified');
        }
        const readableSizeAlgorithm = MakeSizeAlgorithmFromSizeFunction(readableSizeFunction);
        if (readableHighWaterMark === undefined) {
            readableHighWaterMark = 0;
        }
        readableHighWaterMark = ValidateAndNormalizeHighWaterMark(readableHighWaterMark);
        let startPromise_resolve;
        const startPromise = newPromise(resolve => {
            startPromise_resolve = resolve;
        });
        InitializeTransformStream(this, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
        SetUpTransformStreamDefaultControllerFromTransformer(this, transformer);
        const startResult = InvokeOrNoop(transformer, 'start', [this._transformStreamController]);
        startPromise_resolve(startResult);
    }
    get readable() {
        if (IsTransformStream(this) === false) {
            throw streamBrandCheckException$2('readable');
        }
        return this._readable;
    }
    get writable() {
        if (IsTransformStream(this) === false) {
            throw streamBrandCheckException$2('writable');
        }
        return this._writable;
    }
}
function InitializeTransformStream(stream, startPromise, writableHighWaterMark, writableSizeAlgorithm, readableHighWaterMark, readableSizeAlgorithm) {
    function startAlgorithm() {
        return startPromise;
    }
    function writeAlgorithm(chunk) {
        return TransformStreamDefaultSinkWriteAlgorithm(stream, chunk);
    }
    function abortAlgorithm(reason) {
        return TransformStreamDefaultSinkAbortAlgorithm(stream, reason);
    }
    function closeAlgorithm() {
        return TransformStreamDefaultSinkCloseAlgorithm(stream);
    }
    stream._writable = CreateWritableStream(startAlgorithm, writeAlgorithm, closeAlgorithm, abortAlgorithm, writableHighWaterMark, writableSizeAlgorithm);
    function pullAlgorithm() {
        return TransformStreamDefaultSourcePullAlgorithm(stream);
    }
    function cancelAlgorithm(reason) {
        TransformStreamErrorWritableAndUnblockWrite(stream, reason);
        return promiseResolvedWith(undefined);
    }
    stream._readable = CreateReadableStream(startAlgorithm, pullAlgorithm, cancelAlgorithm, readableHighWaterMark, readableSizeAlgorithm);
    // The [[backpressure]] slot is set to undefined so that it can be initialised by TransformStreamSetBackpressure.
    stream._backpressure = undefined;
    stream._backpressureChangePromise = undefined;
    stream._backpressureChangePromise_resolve = undefined;
    TransformStreamSetBackpressure(stream, true);
    // Used by IsWritableStream() which is called by SetUpTransformStreamDefaultController().
    stream._transformStreamController = undefined;
}
function IsTransformStream(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_transformStreamController')) {
        return false;
    }
    return true;
}
// This is a no-op if both sides are already errored.
function TransformStreamError(stream, e) {
    ReadableStreamDefaultControllerError(stream._readable._readableStreamController, e);
    TransformStreamErrorWritableAndUnblockWrite(stream, e);
}
function TransformStreamErrorWritableAndUnblockWrite(stream, e) {
    TransformStreamDefaultControllerClearAlgorithms(stream._transformStreamController);
    WritableStreamDefaultControllerErrorIfNeeded(stream._writable._writableStreamController, e);
    if (stream._backpressure === true) {
        // Pretend that pull() was called to permit any pending write() calls to complete. TransformStreamSetBackpressure()
        // cannot be called from enqueue() or pull() once the ReadableStream is errored, so this will will be the final time
        // _backpressure is set.
        TransformStreamSetBackpressure(stream, false);
    }
}
function TransformStreamSetBackpressure(stream, backpressure) {
    // Passes also when called during construction.
    if (stream._backpressureChangePromise !== undefined) {
        stream._backpressureChangePromise_resolve();
    }
    stream._backpressureChangePromise = newPromise(resolve => {
        stream._backpressureChangePromise_resolve = resolve;
    });
    stream._backpressure = backpressure;
}
class TransformStreamDefaultController {
    /** @internal */
    constructor() {
        throw new TypeError('TransformStreamDefaultController instances cannot be created directly');
    }
    get desiredSize() {
        if (IsTransformStreamDefaultController(this) === false) {
            throw defaultControllerBrandCheckException$1('desiredSize');
        }
        const readableController = this._controlledTransformStream._readable._readableStreamController;
        return ReadableStreamDefaultControllerGetDesiredSize(readableController);
    }
    enqueue(chunk) {
        if (IsTransformStreamDefaultController(this) === false) {
            throw defaultControllerBrandCheckException$1('enqueue');
        }
        TransformStreamDefaultControllerEnqueue(this, chunk);
    }
    error(reason) {
        if (IsTransformStreamDefaultController(this) === false) {
            throw defaultControllerBrandCheckException$1('error');
        }
        TransformStreamDefaultControllerError(this, reason);
    }
    terminate() {
        if (IsTransformStreamDefaultController(this) === false) {
            throw defaultControllerBrandCheckException$1('terminate');
        }
        TransformStreamDefaultControllerTerminate(this);
    }
}
// Transform Stream Default Controller Abstract Operations
function IsTransformStreamDefaultController(x) {
    if (!typeIsObject(x)) {
        return false;
    }
    if (!Object.prototype.hasOwnProperty.call(x, '_controlledTransformStream')) {
        return false;
    }
    return true;
}
function SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm) {
    controller._controlledTransformStream = stream;
    stream._transformStreamController = controller;
    controller._transformAlgorithm = transformAlgorithm;
    controller._flushAlgorithm = flushAlgorithm;
}
function SetUpTransformStreamDefaultControllerFromTransformer(stream, transformer) {
    const controller = Object.create(TransformStreamDefaultController.prototype);
    let transformAlgorithm = (chunk) => {
        try {
            TransformStreamDefaultControllerEnqueue(controller, chunk);
            return promiseResolvedWith(undefined);
        }
        catch (transformResultE) {
            return promiseRejectedWith(transformResultE);
        }
    };
    const transformMethod = transformer.transform;
    if (transformMethod !== undefined) {
        if (typeof transformMethod !== 'function') {
            throw new TypeError('transform is not a method');
        }
        transformAlgorithm = chunk => PromiseCall(transformMethod, transformer, [chunk, controller]);
    }
    const flushAlgorithm = CreateAlgorithmFromUnderlyingMethod(transformer, 'flush', 0, [controller]);
    SetUpTransformStreamDefaultController(stream, controller, transformAlgorithm, flushAlgorithm);
}
function TransformStreamDefaultControllerClearAlgorithms(controller) {
    controller._transformAlgorithm = undefined;
    controller._flushAlgorithm = undefined;
}
function TransformStreamDefaultControllerEnqueue(controller, chunk) {
    const stream = controller._controlledTransformStream;
    const readableController = stream._readable._readableStreamController;
    if (ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController) === false) {
        throw new TypeError('Readable side is not in a state that permits enqueue');
    }
    // We throttle transform invocations based on the backpressure of the ReadableStream, but we still
    // accept TransformStreamDefaultControllerEnqueue() calls.
    try {
        ReadableStreamDefaultControllerEnqueue(readableController, chunk);
    }
    catch (e) {
        // This happens when readableStrategy.size() throws.
        TransformStreamErrorWritableAndUnblockWrite(stream, e);
        throw stream._readable._storedError;
    }
    const backpressure = ReadableStreamDefaultControllerHasBackpressure(readableController);
    if (backpressure !== stream._backpressure) {
        TransformStreamSetBackpressure(stream, true);
    }
}
function TransformStreamDefaultControllerError(controller, e) {
    TransformStreamError(controller._controlledTransformStream, e);
}
function TransformStreamDefaultControllerPerformTransform(controller, chunk) {
    const transformPromise = controller._transformAlgorithm(chunk);
    return transformPromiseWith(transformPromise, undefined, r => {
        TransformStreamError(controller._controlledTransformStream, r);
        throw r;
    });
}
function TransformStreamDefaultControllerTerminate(controller) {
    const stream = controller._controlledTransformStream;
    const readableController = stream._readable._readableStreamController;
    if (ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController) === true) {
        ReadableStreamDefaultControllerClose(readableController);
    }
    const error = new TypeError('TransformStream terminated');
    TransformStreamErrorWritableAndUnblockWrite(stream, error);
}
// TransformStreamDefaultSink Algorithms
function TransformStreamDefaultSinkWriteAlgorithm(stream, chunk) {
    const controller = stream._transformStreamController;
    if (stream._backpressure === true) {
        const backpressureChangePromise = stream._backpressureChangePromise;
        return transformPromiseWith(backpressureChangePromise, () => {
            const writable = stream._writable;
            const state = writable._state;
            if (state === 'erroring') {
                throw writable._storedError;
            }
            return TransformStreamDefaultControllerPerformTransform(controller, chunk);
        });
    }
    return TransformStreamDefaultControllerPerformTransform(controller, chunk);
}
function TransformStreamDefaultSinkAbortAlgorithm(stream, reason) {
    // abort() is not called synchronously, so it is possible for abort() to be called when the stream is already
    // errored.
    TransformStreamError(stream, reason);
    return promiseResolvedWith(undefined);
}
function TransformStreamDefaultSinkCloseAlgorithm(stream) {
    // stream._readable cannot change after construction, so caching it across a call to user code is safe.
    const readable = stream._readable;
    const controller = stream._transformStreamController;
    const flushPromise = controller._flushAlgorithm();
    TransformStreamDefaultControllerClearAlgorithms(controller);
    // Return a promise that is fulfilled with undefined on success.
    return transformPromiseWith(flushPromise, () => {
        if (readable._state === 'errored') {
            throw readable._storedError;
        }
        const readableController = readable._readableStreamController;
        if (ReadableStreamDefaultControllerCanCloseOrEnqueue(readableController) === true) {
            ReadableStreamDefaultControllerClose(readableController);
        }
    }, r => {
        TransformStreamError(stream, r);
        throw readable._storedError;
    });
}
// TransformStreamDefaultSource Algorithms
function TransformStreamDefaultSourcePullAlgorithm(stream) {
    // Invariant. Enforced by the promises returned by start() and pull().
    TransformStreamSetBackpressure(stream, false);
    // Prevent the next pull() call until there is backpressure.
    return stream._backpressureChangePromise;
}
// Helper functions for the TransformStreamDefaultController.
function defaultControllerBrandCheckException$1(name) {
    return new TypeError(`TransformStreamDefaultController.prototype.${name} can only be used on a TransformStreamDefaultController`);
}
// Helper functions for the TransformStream.
function streamBrandCheckException$2(name) {
    return new TypeError(`TransformStream.prototype.${name} can only be used on a TransformStream`);
}

export { ByteLengthQueuingStrategy, CountQueuingStrategy, ReadableStream, TransformStream, WritableStream };
//# sourceMappingURL=ponyfill.es2018.mjs.map