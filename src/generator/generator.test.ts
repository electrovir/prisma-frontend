import {runShellCommand} from '@augment-vir/node-js';
import {rm} from 'node:fs/promises';
import {join} from 'node:path';
import {describe, it} from 'node:test';
import {packageDir} from '../util/file-paths.js';

describe('prisma-frontend', () => {
    it('works', async () => {
        await rm(join(packageDir, 'node_modules', '.prisma'), {
            recursive: true,
            force: true,
        });

        await runShellCommand('npx prisma generate --schema=test-files/schema.prisma --no-hints', {
            rejectOnError: true,
            hookUpToConsole: true,
        });
    });
});
