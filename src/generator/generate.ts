import {safeMatch} from '@augment-vir/common';
import {writeFileAndDir} from '@augment-vir/node-js';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {GeneratorOptions} from './generator-options.js';

/**
 * Reads inputs from a Prisma generator and then generates and writes all the needed GraphQL and JS
 * code required for a full Node.js GraphQL server to function.
 *
 * @category Prisma Generator
 */
export async function generate(jsClientPath: string, options: GeneratorOptions) {
    await writeTypes(jsClientPath, options);
}

async function writeTypes(jsClientPath: string, options: GeneratorOptions) {
    const indexTypesPath = join(jsClientPath, 'index.d.ts');

    const indexTypesContents = String(await readFile(indexTypesPath));

    const payloadTypes = safeMatch(
        indexTypesContents,
        /(export type \$[^<]+Payload(?:.|\n)+?\n\n)/g,
    );

    const [
        ,
        enumTypes = '',
    ] = safeMatch(indexTypesContents, /export namespace \$Enums {((?:.|\n)+?)}\n\n/);

    const fullContents = [
        `// generated at ${Date.now()}`,
        indexTypesContents
            .replace(/\/\*\*\n \* Enums(?:.|\n)*$/, '')
            .replace(
                `import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result
`,
                '',
            )
            .replace('import * as runtime', 'import type * as runtime'),
        payloadTypes.join('').replaceAll('export', ''),
        enumTypes,
    ]
        .join('\n\n')
        .replaceAll('Prisma.$', '$')
        .replaceAll('export type PrismaPromise<T> = $Public.PrismaPromise<T>', '')
        .replaceAll(/\n{3,}/g, '\n\n')
        .replaceAll('$Enums.', '')
        .replaceAll('$Extensions.', 'runtime.Types.Extensions.')
        .replaceAll('$Result.', 'runtime.Types.Result.');

    await writeFileAndDir(join(options.outputDir, 'index.d.ts'), fullContents);

    const jsContents = enumTypes.replaceAll(/export type.+\n/g, '').replaceAll(/: {/g, ' = {');

    await writeFileAndDir(join(options.outputDir, 'index.js'), jsContents);
}
