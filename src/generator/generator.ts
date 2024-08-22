import {log} from '@augment-vir/node-js';
import generatorHelper from '@prisma/generator-helper';
import {readThisPackageJson} from '../util/package-file.js';
import {generate} from './generate.js';
import {generatorOptionsShape, readGeneratorOptions} from './generator-options.js';
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
                defaultOutput: generatorOptionsShape.defaultValue.outputDir,
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
            const options = readGeneratorOptions(generator);

            log.faint(`Waiting for JS client generation...`);
            const jsClientPath = await waitForClientJs(schemaPath);

            try {
                await generate(jsClientPath, options);
            } catch (error) {
                console.error(error);
                throw error;
            }
        },
    });
}
