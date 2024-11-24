import * as futures from "./futures";
import * as runtime from "./runtime";
import * as tasks from "./tasks";

// Simple implementation of join(), which returns a future that
// will only be completed when all the passed futures are completed.
function join<T>(futureArray: futures.Future<T>[]): futures.Future<T[]> {
    return tasks.task(() => futureArray.map((future) => future.await()));
}

// Main script. Think of this function as the content of the
// main (EEPROM) script. It would be run by the runtime and
// can call blocking functions (e.g. Future.await()).
tasks.task(() => {
    let task1 = tasks.task(() => {
        futures.sleep(1).await();
        print("Done 1.");
        return 1;
    });
    let task2 = tasks.task(() => {
        futures.sleep(2).await();
        print("Done 2.");
        return 2;
    });
    let task3 = tasks.task(() => {
        futures.sleep(3).await();
        print("Done 3.");
        return 3;
    });

    let results = join([task1, task2, task3]).await();
    print(`Results: ${results.join(", ")}`);
});

// This starts the dummy implementation of the runtime.
runtime.run();
