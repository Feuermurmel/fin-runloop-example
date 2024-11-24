import * as runtime from "./runtime";

// A future wraps a result produced asynchronously.
//
// A function can return a future, which allows the calling
// function to decide if and when to wait for the result.
export interface Future<T> {
    // Whether this future's result has been set.
    readonly isCompleted: boolean;

    // Add a function to be run when the result of this
    // future will be set.
    then(onComplete: (result: T) => void): void;

    // Get the result of the future, or undefined, if the
    // future is not yet completed.
    get(): T | undefined;

    // Get the result of the future. This function will
    // block until the result is set.
    await(): T;
}

// A future is the default implementation of a future.
//
// This is done here as a separate type to separate the properties
// that should be accessible from outside the function creating
// the future from properties that shouldn't be accessible.
export class FutureImpl<T> implements Future<T> {
    private _isCompleted = false;
    private _result: T | undefined = undefined;
    private _onCompleteHandlers: ((result: T) => void)[] = [];

    // Set the result of the future and call the completion handler
    // registered with this future.
    setResult(result: T): void {
        assert(!this._isCompleted);
        this._isCompleted = true;
        this._result = result;

        // Call all registered completion handlers.
        for (let handler of this._onCompleteHandlers) {
            handler(result);
        }
    }

    get isCompleted(): boolean {
        return this._isCompleted;
    }

    then(onComplete: (result: T) => void): void {
        assert(!this._isCompleted);
        this._onCompleteHandlers.push(onComplete);
    }

    get(): T | undefined {
        return this._result;
    }

    // This is a blocking function.
    await(): T {
        if (!this._isCompleted) {
            coroutine.yield(this);
            assert(this._isCompleted);
        }

        return this._result as T;
    }
}

// Convenience helper to create a future.
//
// The passed function will be called with a completion handler.
// The passed function can call the completion handler to set
// the result of the future.
export function createFuture<T>(
    fn: (onComplete: (result: T) => void) => void,
): Future<T> {
    let future = new FutureImpl<T>();
    fn((result: T) => future.setResult(result));
    return future;
}

// Make an HTTP request.
export function httpRequest(url: string): Future<string> {
    return createFuture((onComplete) => runtime.httpRequest(url, onComplete));
}

// Sleep for the specified time.
export function sleep(delay: number): Future<void> {
    return createFuture<void>((onComplete) => runtime.timer(delay, onComplete));
}
