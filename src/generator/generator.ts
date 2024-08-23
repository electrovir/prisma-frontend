import {log} from '@augment-vir/node-js';
import generatorHelper from '@prisma/generator-helper';
import prismaInternals from '@prisma/internals';
import {basename, join} from 'node:path';
import {packageDir, packageParentDir} from '../util/file-paths.js';
import {readThisPackageJson} from '../util/package-file.js';
import {generate, updateIndexExport} from './generate.js';
import {waitForClientJs} from './wait-for-client-js.js';

/**
 * Registers the generator with Prisma so it can be triggered via a `prisma generate` command.
 *
 * @category Prisma Generator
 */
export function registerGenerator() {
    generatorHelper.generatorHandler({
        onManifest() {
            return {
                /**
                 * There's no way to convince Prisma to print a different output path other than
                 * this default, so we just have to leave it as is even though the generator will be
                 * much more intelligent about where to generate the output.
                 */
                defaultOutput: 'node_modules/.prisma/frontend',
                requiresGenerators: ['prisma-client-js'],
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
            } else if (!jsGenerator.output) {
                throw new Error('Cannot find prisma-client-js output path.');
            }

            const jsOutputDir = prismaInternals.parseEnvValue(jsGenerator.output);

            log.faint(`Waiting for JS client generation...`);
            const jsClientPath = await waitForClientJs(schemaPath, jsOutputDir);

            const frontendOutputDir =
                generator.isCustomOutput && generator.output
                    ? prismaInternals.parseEnvValue(generator.output)
                    : determineOutputDir();

            try {
                await generate(jsClientPath, frontendOutputDir);
                await updateIndexExport(frontendOutputDir);
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
