import {extractErrorMessage} from '@augment-vir/common';
import {log} from '@augment-vir/node-js';
import {createReadStream, createWriteStream} from 'node:fs';
import {mkdir, writeFile} from 'node:fs/promises';
import {dirname, join, relative} from 'node:path';
import {createInterface} from 'node:readline';
import {distDir} from '../util/file-paths.js';

enum ParseMode {
    Models = 'models',
    Enum = 'enum',
}

async function openFileWriteStream(filePath: string) {
    await mkdir(dirname(filePath), {recursive: true});
    const writeStream = createWriteStream(filePath);

    writeStream.on('error', (error: unknown) => {
        log.error(`Stream to types file failed: ${extractErrorMessage(error)}`);
        process.exit(1);
    });

    return writeStream;
}

async function perFileLine(filePath: string, callback: (rawLine: string) => void | true) {
    const readLine = createInterface({
        input: createReadStream(filePath),
        crlfDelay: Infinity,
    });

    for await (const rawLine of readLine) {
        if (callback(rawLine)) {
            break;
        }
    }
}

/**
 * Reads inputs from a the generated JS client and then generates and writes the frontend output.
 *
 * @category Prisma Generator
 */
export async function generate(jsClientPath: string, outputDir: string) {
    const typesStream = await openFileWriteStream(join(outputDir, 'index.d.ts'));
    const mjsStream = await openFileWriteStream(join(outputDir, 'index.js'));
    const cjsStream = await openFileWriteStream(join(outputDir, 'index.cjs'));

    const generatedComment = `// generated at ${Date.now()}\n\n`;

    typesStream.write(generatedComment);
    typesStream.write("import type {Prisma} from '@prisma/client'");
    mjsStream.write(generatedComment);
    cjsStream.write(generatedComment);

    let currentParseMode = ParseMode.Models;

    await perFileLine(join(jsClientPath, 'index.d.ts'), (rawLine): void | true => {
        const line = rawLine.trim();

        if (currentParseMode === ParseMode.Models) {
            if (line.startsWith('import * as runtime')) {
                typesStream.write(rawLine.replace('import *', 'import type *') + '\n');
            } else if (
                removeLineStarts.some((removeLineStart) => line.startsWith(removeLineStart))
            ) {
                // skip these lines
                return;
            } else if (line.startsWith('export namespace $Enums {')) {
                currentParseMode = ParseMode.Enum;
            } else {
                typesStream.write(rawLine.replace('$Result.', 'runtime.Types.Result.') + '\n');
            }
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        } else if (currentParseMode === ParseMode.Enum) {
            if (line === '}') {
                return true;
            } else if (line.startsWith('export type')) {
                return;
            } else {
                // types enum output
                if (line.startsWith('export const')) {
                    typesStream.write(
                        rawLine.replace(' const ', ' enum ').replace(': {', ' {') + '\n',
                    );
                } else {
                    typesStream.write(rawLine.replace(": '", " = '") + '\n');
                }

                // js enum output
                mjsStream.write(rawLine.replace(': {', ' = {') + '\n');
                cjsStream.write(
                    rawLine.replace(': {', ' = {').replaceAll('export const ', 'module.exports.') +
                        '\n',
                );
            }
        }
    });

    typesStream.end();
    mjsStream.end();
}

const removeLineStarts = [
    'import $Types =',
    'import $Public =',
    'import $Utils =',
    'import $Extensions =',
    'import $Result =',
    'export type PrismaPromise<T>',
];

export async function updateIndexExport(outputDir: string): Promise<void> {
    const exportLine = `export * from '${relative(distDir, join(outputDir, 'index.js'))}';`;
    await writeFile(join(distDir, 'index.d.ts'), exportLine);
    await writeFile(join(distDir, 'index.js'), exportLine);
}
