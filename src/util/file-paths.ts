import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const packageDir = dirname(dirname(__dirname));
export const distDir = join(packageDir, 'dist');
export const packageParentDir = dirname(packageDir);
export const packageJsonFile = join(packageDir, 'package.json');
export const parentNodeModulesDir = dirname(packageDir);
export const parentPrismaClientDir = join(parentNodeModulesDir, '.prisma', 'client');
export const siblingPrismaClientDir = join(packageDir, 'node_modules', '.prisma', 'client');
