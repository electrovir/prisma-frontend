import {assert} from '@open-wc/testing';

describe('frontend', () => {
    it('can import and use enums and types', async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore: this import won't have types at initial compile time
        const {Status} = await import('prisma-frontend');
        assert.strictEqual(Status.Active, 'Active');
    });
});
