import {dirname, join} from 'node:path';

export const packageDir = dirname(dirname(import.meta.dirname));
export const packageJsonFile = join(packageDir, 'package.json');
export const parentNodeModulesDir = dirname(packageDir);
export const parentPrismaClientDir = join(parentNodeModulesDir, '.prisma', 'client');
export const siblingPrismaClientDir = join(packageDir, 'node_modules', '.prisma', 'client');