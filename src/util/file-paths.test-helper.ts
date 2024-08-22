/** Paths for test-only files. */
import {join} from 'node:path';
import {packageDir} from './file-paths.js';

export const testFilesDir = join(packageDir, 'test-files');
