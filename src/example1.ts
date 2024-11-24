import * as futures from "./futures";
import * as runtime from "./runtime";
import * as tasks from "./tasks";

tasks.task(() => {
    // Main script. Think of this function as the content of the
    // main (EEPROM) script. It would be run by the runtime and
    // can call blocking functions (e.g. Future.await()).
    let n = 0;

    while (true) {
        n += 1;
        print(`n: ${n}`);
        futures.sleep(1).await();
    }
});

// This starts the dummy implementation of the runtime.
runtime.run();
