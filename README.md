# prisma-frontend

A Prisma generator for creating frontend-friendly exports (types and enums).

Generated outputs can be used just as easily in the backend or frontend, unifying the import source of your model types and enums.

Note that this is still experimental. Please open bug tickets in GitHub.

## Install

```
npm i -D prisma-frontend
```

## Usage

### Prisma Schema

Insert this as a generator in your Prisma schema file:

```prisma
generator jsClient {
    provider = "prisma-client-js"
}

generator jsFrontend {
    provider = "prisma-frontend"
}

```

This generator _must_ also be used with a `prisma-client-js` generator.

### Imports

Import model types and enums from `prisma-frontend`:

```typescript
import {type User, AuthRole} from 'prisma-frontend';

export function authenticateAdmin(user: Partial<User>): boolean {
    return user.authRole === AuthRole.Admin;
}
```
