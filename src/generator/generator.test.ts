import {runShellCommand} from '@augment-vir/node-js';
import {describe, it} from 'node:test';

describe('prisma-frontend', () => {
    it('works', async () => {
        await runShellCommand('npx prisma generate --schema=test-files/schema.prisma --no-hints', {
            rejectOnError: true,
            hookUpToConsole: true,
        });
    });
});
