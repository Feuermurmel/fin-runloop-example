import * as futures from "./futures";
import * as runtime from "./runtime";
import * as tasks from "./tasks";

// Main script. Think of this function as the content of the
// main (EEPROM) script. It would be run by the runtime and
// can call blocking functions (e.g. Future.await()).
tasks.task(() => {
    let httpFutures = [];

    for (let i = 0; i < 5; i += 1) {
        httpFutures.push(futures.httpRequest(`http://example.com/${i}`));
    }

    for (let future of httpFutures) {
        future.await();
    }

    print("Done.");
});

// This starts the dummy implementation of the runtime.
runtime.run();
