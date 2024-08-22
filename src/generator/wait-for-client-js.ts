import {collapseWhiteSpace, waitUntilTruthy} from '@augment-vir/common';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {parentPrismaClientDir, siblingPrismaClientDir} from '../util/file-paths.js';

function getPrismaClientDir() {
    if (existsSync(parentPrismaClientDir)) {
        return parentPrismaClientDir;
    } else if (existsSync(siblingPrismaClientDir)) {
        return siblingPrismaClientDir;
    } else {
        throw new Error('No .prisma dir found.');
    }
}

export async function waitForClientJs(schemaPath: string) {
    const currentSchema = collapseWhiteSpace(String(await readFile(schemaPath)));

    await waitUntilTruthy(
        async () => {
            const generatedSchemaContents = collapseWhiteSpace(
                String(await readFile(join(getPrismaClientDir(), 'schema.prisma'))),
            );

            return generatedSchemaContents === currentSchema;
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

    return getPrismaClientDir();
}
