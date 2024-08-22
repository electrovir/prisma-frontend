import {generateDepCruiserConfig} from '@virmator/deps/configs/dep-cruiser.config.base';
import type {IConfiguration} from 'dependency-cruiser';

const baseConfig = generateDepCruiserConfig({
    fileExceptions: {
        // enter file exceptions by rule name here
        'no-orphans': {
            from: [
                'src/index.ts',
            ],
        },
        'no-non-package-json': {
            to: [
                'node_modules/.prisma',
            ],
        },
        'not-to-unresolvable': {
            to: [
                '.prisma/frontend',
            ],
        },
    },
    omitRules: [
        // enter rule names here to omit
    ],
});

const depCruiserConfig: IConfiguration = {
    ...baseConfig,
};

module.exports = depCruiserConfig;
