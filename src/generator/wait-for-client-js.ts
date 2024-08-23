import {collapseWhiteSpace, waitUntilTruthy} from '@augment-vir/common';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {join, resolve} from 'node:path';
import {parentPrismaClientDir, siblingPrismaClientDir} from '../util/file-paths.js';

const directoriesToTry = [
    parentPrismaClientDir,
    siblingPrismaClientDir,
    resolve(import.meta.resolve('@prisma/client'), '..', '..', '.prisma', 'client'),
];

function getPrismaClientDir(dirFromPrismaOutput: string): string {
    const validDirectory = directoriesToTry.concat(dirFromPrismaOutput).find((dir) => {
        return existsSync(dir);
    });

    if (validDirectory) {
        return validDirectory;
    }

    throw new Error('No .prisma dir found.');
}

/** @returns The path of the found `.prisma/client` dir. */
export async function waitForClientJs(
    schemaPath: string,
    prismaOutputDir: string,
): Promise<string> {
    const currentSchema = collapseWhiteSpace(String(await readFile(schemaPath)));
    const prismaClientNearOutputDir = resolve(prismaOutputDir, '..', '..', '.prisma', 'client');

    return await waitUntilTruthy(
        async () => {
            const path = getPrismaClientDir(prismaClientNearOutputDir);

            const generatedSchemaContents = collapseWhiteSpace(
                String(await readFile(join(path, 'schema.prisma'))),
            );

            if (generatedSchemaContents === currentSchema) {
                return path;
            } else {
                return '';
            }
        },
        'Your JS Prisma client never generated, timed out, or generated in an unexpected location.',
        {
            interval: {
                milliseconds: 1000,
            },
            timeout: {
                milliseconds: 30_000,
            },
        },
    );
}
