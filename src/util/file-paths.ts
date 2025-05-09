import {dirname, join} from 'node:path';

export const packageDir = dirname(dirname(import.meta.dirname));
export const packageJsonFile = join(packageDir, 'package.json');
