/////////////////
// This file is here as an example of a set of functions that the
// runtime could provide.
//
// These functions allow an application to perform operations that
// take some time, and that return the result asynchronously. The
// functions will each take a completion handler, which is a function
// that takes the result. The functions will make use of the runloop
// implemented below when the operation has finished.
//
// In this example implementation, all operations simply wait for
// some time before running the completion handler. In a real
// implementation, the runtime would put run the completion handler
// only when the operation has actually completed.
/////////////////

// An example for an async function provided by the runtime.
//
// The function will start the operation and return immediately.
// When the operation has completed, the completion handler
// `onComplete()` will be called with the operation's result.
export function httpRequest(
    url: string,
    onComplete: (resultData: string) => void,
): void {
    print(`Making request to ${url}...`);

    // Dummy implementation, which always waits 5 seconds and then
    // returns a static result.
    post(os.time() + 5, () => {
        print(`Completed request to ${url}.`);
        onComplete("result");
    });
}

// Example for a blocking function provided by the runtime.
//
// This function will simply wait for the specified duration and
// then call onComplete().
export function timer(delay: number, onComplete: () => void): void {
    post(os.time() + delay, () => onComplete());
}

// Example for a blocking function provided by the runtime.
//
// This function will wait for an event and call onComplete()
// with the next event in the queue.
//
// As an extension, this could take an event queue, so that
// multiple queues with different filters can be created and
// waited for.
export function pullEvent(onComplete: (event: string) => void): void {
    // Dummy implementation, which always blocks for 0.2 seconds
    // and then returns the same event evey time.
    post(os.time() + 0.2, () => onComplete("SomeEvent"));
}

/////////////////
// Below is a very simple runloop implementation that uses a priority
// queue of tasks. The functions above use this runloop to run
// completion handlers at the right time.
/////////////////

interface RunLoopTask {
    time: number;
    fn: () => void;
}

let queue: RunLoopTask[] = [];

// The main entry point to the runloop. The runtime would call this
// function automatically when the application starts.
export function run(): void {
    while (true) {
        let task = queue[0];
        let wait;

        if (task === undefined) {
            wait = Infinity;
        } else {
            wait = task.time - os.time();
        }

        if (wait > 0) {
            if (wait === Infinity) {
                // Exit the runloop because we don't have any more tasks
                // to run.
                return;
            }

            print(`Sleeping for ${wait} s.`);
            let result = os.execute(`sleep ${wait}`);

            if (!result[0]) {
                error(`${result[1]} ${result[2]}`);
            }
        } else {
            queue.shift();
            task.fn();
        }
    }
}

// Insert a function into the runloop's queue.
function post(time: number, fn: () => void) {
    // Find the index where this task needs to be inserted so that the
    // queue is kept sorted by time.
    let index = queue.findIndex((x) => x.time > time);

    if (index === -1) {
        index = queue.length;
    }

    queue.splice(index, 0, { time: time, fn: fn });
}
