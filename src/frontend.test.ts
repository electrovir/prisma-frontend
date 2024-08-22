/* eslint-disable @typescript-eslint/ban-ts-comment */

import {assert} from '@open-wc/testing';
// @ts-ignore: this import won't have types at initial compile time
import type {User} from 'prisma-frontend';

describe('frontend', () => {
    it('can import and use enums and types', async () => {
        // @ts-ignore: this import won't have types at initial compile time
        const {Status} = await import('prisma-frontend');
        assert.strictEqual(Status.Active, 'Active');

        // @ts-ignore: this import won't have types at initial compile time
        // eslint-disable-next-line sonarjs/sonar-no-unused-vars, sonarjs/no-dead-store
        const user: User = {
            // use this object to test auto complete
            createdAt: new Date(),
        };
    });
});
