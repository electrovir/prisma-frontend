import {runShellCommand} from '@augment-vir/node';
import {describe, it} from '@augment-vir/test';
import {rm} from 'node:fs/promises';
import {join} from 'node:path';
import {packageDir} from '../util/file-paths.js';

describe('prisma-frontend', () => {
    it('works with a single schema file', async () => {
        await rm(join(packageDir, 'node_modules', '.prisma'), {
            recursive: true,
            force: true,
        });

        await runShellCommand('npx prisma generate --schema=test-files/schema.prisma --no-hints', {
            rejectOnError: true,
            hookUpToConsole: true,
        });
    });

    it('works with prismaSchemaFolder preview feature enabled', async () => {
        await rm(join(packageDir, 'node_modules', '.prisma'), {
            recursive: true,
            force: true,
        });

        await runShellCommand('npx prisma generate --schema=test-files/schema-folder --no-hints', {
            rejectOnError: true,
            hookUpToConsole: true,
        });
    });
});
