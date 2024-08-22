import {extractErrorMessage} from '@augment-vir/common';
import {log} from '@augment-vir/node-js';
import {createReadStream, createWriteStream} from 'node:fs';
import {mkdir} from 'node:fs/promises';
import {join} from 'node:path';
import {createInterface} from 'node:readline';
import {GeneratorOptions} from './generator-options.js';

enum ParseMode {
    Models = 'models',
    Enum = 'enum',
    WaitingForPayload = 'waiting-for-payload',
    InsidePayload = 'inside-payload',
    MaybePayloadEnd = 'maybe-payload-end',
}

/**
 * Reads inputs from a the generated JS client and then generates and writes the frontend output.
 *
 * @category Prisma Generator
 */
export async function generate(jsClientPath: string, options: GeneratorOptions) {
    const jsClientFilePath = join(jsClientPath, 'index.d.ts');

    const readLine = createInterface({
        input: createReadStream(jsClientFilePath),
        crlfDelay: Infinity,
    });

    await mkdir(options.outputDir, {recursive: true});

    const typesStream = createWriteStream(join(options.outputDir, 'index.d.ts'));
    const jsStream = createWriteStream(join(options.outputDir, 'index.js'));

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
                typesStream.write(
                    rawLine.replace('Prisma.$', '$').replace('$Result.', 'runtime.Types.Result.') +
                        '\n',
                );
            }
        } else if (currentParseMode === ParseMode.Enum) {
            if (line === '}') {
                currentParseMode = ParseMode.WaitingForPayload;
            } else {
                typesStream.write(rawLine + '\n');
                if (!line.startsWith('export type')) {
                    jsStream.write(rawLine.replace(': {', ' = {') + '\n');
                }
            }
        } else if (currentParseMode === ParseMode.WaitingForPayload) {
            if (line.startsWith('export type $')) {
                typesStream.write(
                    line
                        .replace('export ', 'declare ')
                        .replace('$Extensions.', 'runtime.Types.Extensions.') + '\n',
                );
                currentParseMode = ParseMode.InsidePayload;
            } else if (line.startsWith('* Enums')) {
                break;
            }
        } else {
            if (currentParseMode === ParseMode.MaybePayloadEnd && line === '') {
                currentParseMode = ParseMode.WaitingForPayload;
                continue;
            }

            currentParseMode = ParseMode.InsidePayload;

            typesStream.write(rawLine.replace('$Enums.', '') + '\n');

            if (line === '}') {
                currentParseMode = ParseMode.MaybePayloadEnd;
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
