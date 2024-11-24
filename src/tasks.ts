import * as futures from "./futures";

// Start a task and return its result wrapped in a future.
//
// A task is a function that can call Future.await() and other
// blocking functions.
export function task<T>(taskFn: () => T): futures.Future<T> {
    return futures.createFuture((onTaskComplete) => {
        let coro = coroutine.create(() => taskFn());

        function createOnCompleteFn(): (result: unknown) => void {
            return (resolveResult: unknown) => {
                let result = coroutine.resume(coro, resolveResult);

                if (!result[0]) {
                    // Propagate errors raised by the function running
                    // in the coroutine.
                    throw result[1];
                }

                if (coroutine.status(coro) === "suspended") {
                    // The function passed to task() is expected to only yield
                    // instances of Future.
                    //
                    // We don't know the type of the result returned by the
                    // future, what matters is that the function that yielded
                    // the future will handle the value when it is passed to
                    // back to the function using coroutine.resume().
                    let future = result[1] as futures.Future<unknown>;

                    future.then(createOnCompleteFn());
                } else {
                    // The functino has returned a value.
                    // Return that value as the result of the future.
                    onTaskComplete(result[1]);
                }
            };
        }

        createOnCompleteFn()(undefined);
    });
}
