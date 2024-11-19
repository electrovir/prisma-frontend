/* eslint-disable @typescript-eslint/ban-ts-comment */

import {assert} from '@augment-vir/assert';
import {describe, it} from '@augment-vir/test';

// @ts-ignore: this import won't have types at initial compile time
import type {User} from 'prisma-frontend';

describe('frontend', () => {
    it('can import and use enums and types', async () => {
        // @ts-ignore: this import won't have types at initial compile time
        const {Status} = await import('prisma-frontend');
        assert.strictEquals(Status.Active as string, 'Active');

        // @ts-ignore: this import won't have types at initial compile time
        const user: User = {
            // use this object to test auto complete
            createdAt: new Date(),
        };
    });
});
