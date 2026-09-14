import { copyFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const workerBundle = join(root, 'cf', 'worker-bundle', '_worker.js');
const dist = join(root, 'client', 'dist');

mkdirSync(dist, { recursive: true });
copyFileSync(workerBundle, join(dist, '_worker.js'));
console.log('Copied _worker.js into client/dist');