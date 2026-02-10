// Worker for content processing
import { parentPort } from 'worker_threads';

if (parentPort) {
  parentPort.on('message', (data) => {
    // Process content here
    const result = `Processed: ${data}`;
    parentPort?.postMessage(result);
  });
}