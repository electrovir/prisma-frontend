import {runShellCommand} from '@augment-vir/node';
import {describe, it} from '@augment-vir/test';
import {rm} from 'node:fs/promises';
import {join} from 'node:path';
import {testFilesDir} from '../util/file-paths.test-helper.js';

describe('prisma-frontend', () => {
    it('works with a single schema file', async () => {
        await rm(join(testFilesDir, 'generated', 'single'), {
            recursive: true,
            force: true,
        });

        await runShellCommand(
            'npx prisma generate --schema=test-files/single-schema/schema.prisma --no-hints',
            {
                rejectOnError: true,
                hookUpToConsole: true,
            },
        );
    });

    it('works with schema folder', async () => {
        await rm(join(testFilesDir, 'generated', 'folder'), {
            recursive: true,
            force: true,
        });

        await runShellCommand('npx prisma generate --schema=test-files/folder-schema/ --no-hints', {
            rejectOnError: true,
            hookUpToConsole: true,
        });
    });
});
