import {RequiredBy} from '@augment-vir/common';
import {readFileSync} from 'node:fs';
import {PackageJson} from 'type-fest';
import {packageJsonFile} from './file-paths.js';

export type ThisPackageJson = RequiredBy<PackageJson, 'name' | 'author' | 'version'>;

export function readThisPackageJson(): ThisPackageJson {
    const packageContents = readFileSync(packageJsonFile).toString();

    return JSON.parse(packageContents) as ThisPackageJson;
}
