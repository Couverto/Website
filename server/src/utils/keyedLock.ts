const queues = new Map<string, Promise<unknown>>();

/**
 * @function withKeyedLock
 * @description Runs `task` only after every previous task with the same key has finished, so two calls for the
 * same key never overlap. Used to make "check capacity then create booking" atomic per restaurant.
 * Works within one API process: running several API instances would need a database lock instead.
 * @param {string} key - Lock key (e.g. the restaurant id).
 * @param {() => Promise<T>} task - Work to run while holding the lock.
 * @returns {Promise<T>} The task's result.
 */
export const withKeyedLock = async <T>(key: string, task: () => Promise<T>): Promise<T> => {
  const previous = queues.get(key) ?? Promise.resolve();
  const current = previous.catch(() => undefined).then(task);
  queues.set(key, current);

  try {
    return await current;
  } finally {
    // Only the last queued task cleans up, so the map does not grow forever
    if (queues.get(key) === current) queues.delete(key);
  }
};
