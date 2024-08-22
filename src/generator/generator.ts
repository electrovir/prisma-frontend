import {log} from '@augment-vir/node-js';
import generatorHelper from '@prisma/generator-helper';
import prismaInternals from '@prisma/internals';
import {basename, join} from 'node:path';
import {packageDir, packageParentDir} from '../util/file-paths.js';
import {readThisPackageJson} from '../util/package-file.js';
import {generate, updateIndexExport} from './generate.js';
import {waitForClientJs} from './wait-for-client-js.js';

const defaultOutput = join(process.cwd(), 'node_modules', 'prisma-frontend');

/**
 * Registers the generator with Prisma so it can be triggered via a `prisma generate` command.
 *
 * @category Prisma Generator
 */
export function registerGenerator() {
    generatorHelper.generatorHandler({
        onManifest() {
            return {
                defaultOutput,
                prettyName: 'Frontend Generator',
                version: readThisPackageJson().version,
            };
        },
        async onGenerate({generator, otherGenerators, schemaPath}) {
            const jsGenerator = otherGenerators.find(
                (generator) => generator.provider.value === 'prisma-client-js',
            );

            if (!jsGenerator) {
                throw new Error(
                    'Cannot use prisma-frontend generator without prisma-client-js generator.',
                );
            }
            log.faint(`Waiting for JS client generation...`);
            const jsClientPath = await waitForClientJs(schemaPath);

            const outputDir =
                generator.output?.value === defaultOutput
                    ? determineOutputDir()
                    : // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                      prismaInternals.parseEnvValue(generator.output!);

            try {
                await generate(jsClientPath, outputDir);
                await updateIndexExport(outputDir);
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
    });
}

function determineOutputDir() {
    if (basename(packageParentDir) === 'node_modules') {
        return join(packageParentDir, '.prisma', 'frontend');
    } else {
        return join(packageDir, 'node_modules', '.prisma', 'frontend');
    }
}
