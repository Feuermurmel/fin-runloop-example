import * as futures from "./futures";
import * as runtime from "./runtime";
import * as tasks from "./tasks";

// Main script. Think of this function as the content of the
// main (EEPROM) script. It would be run by the runtime and
// can call blocking functions (e.g. Future.await()).
tasks.task(() => {
    // Demonstrate how two tasks can await a future simultaneously.
    // Both task1 and task2 will await httpFuture, and will be
    // resumed when the future completes.
    let httpFuture = futures.httpRequest(`http://example.com/`);
    let task1 = tasks.task(() => {
        httpFuture.await();
        print("Done 1.");
    });
    let task2 = tasks.task(() => {
        httpFuture.await();
        print("Done 2.");
    });

    task1.await();
    task2.await();

    print("All done.");
});

// This starts the dummy implementation of the runtime.
runtime.run();
