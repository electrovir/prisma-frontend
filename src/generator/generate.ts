import {extractErrorMessage} from '@augment-vir/common';
import {log} from '@augment-vir/node-js';
import {createReadStream, createWriteStream} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createInterface} from 'node:readline';

enum ParseMode {
    Models = 'models',
    Enum = 'enum',
}

/**
 * Reads inputs from a the generated JS client and then generates and writes the frontend output.
 *
 * @category Prisma Generator
 */
export async function generate(jsClientPath: string, outputDir: string) {
    const jsClientFilePath = join(jsClientPath, 'index.d.ts');

    const readLine = createInterface({
        input: createReadStream(jsClientFilePath),
        crlfDelay: Infinity,
    });

    await mkdir(outputDir, {recursive: true});

    const typesStream = createWriteStream(join(outputDir, 'index.d.ts'));
    const jsStream = createWriteStream(join(outputDir, 'index.js'));

    typesStream.on('error', (error: unknown) => {
        log.error(`Stream to types file failed: ${extractErrorMessage(error)}`);
        process.exit(1);
    });
    jsStream.on('error', (error: unknown) => {
        log.error(`Stream to js file failed: ${extractErrorMessage(error)}`);
        process.exit(1);
    });

    const generatedComment = `// generated at ${Date.now()}\n\n`;

    typesStream.write(generatedComment);
    typesStream.write("import type {Prisma} from '@prisma/client'");

    jsStream.write(generatedComment);

    let currentParseMode = ParseMode.Models;

    for await (const rawLine of readLine) {
        const line = rawLine.trim();

        if (currentParseMode === ParseMode.Models) {
            if (line.startsWith('import * as runtime')) {
                typesStream.write(rawLine.replace('import *', 'import type *') + '\n');
            } else if (
                removeLineStarts.some((removeLineStart) => line.startsWith(removeLineStart))
            ) {
                // skip these lines
                continue;
            } else if (line.startsWith('export namespace $Enums {')) {
                currentParseMode = ParseMode.Enum;
            } else {
                typesStream.write(rawLine.replace('$Result.', 'runtime.Types.Result.') + '\n');
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        } else if (currentParseMode === ParseMode.Enum) {
            if (line === '}') {
                break;
            } else {
                typesStream.write(rawLine + '\n');
                if (!line.startsWith('export type')) {
                    jsStream.write(rawLine.replace(': {', ' = {') + '\n');
                }
            }
        }
    }

    typesStream.end();
    jsStream.end();
}

const removeLineStarts = [
    'import $Types =',
    'import $Public =',
    'import $Utils =',
    'import $Extensions =',
    'import $Result =',
    'export type PrismaPromise<T>',
];
