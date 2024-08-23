# prisma-frontend

A Prisma generator for creating frontend-friendly exports (types and enums).

-   Generated outputs can be used just as easily in the backend or frontend, unifying the import source of your model types and enums.
-   Generated outputs are in ESM format.
-   This is experimental. Please open bug tickets in GitHub.

## Install

```
npm i -D prisma-frontend
```

## Usage

### Prisma Schema

Insert this as a generator in your Prisma schema file:

```prisma
// the standard client generator
generator jsClient {
    provider = "prisma-client-js"
}

// this package's generator
generator jsFrontend {
    provider = "prisma-frontend"
}

```

This generator requires the `prisma-client-js` generator to be used as well (as shown above).

### Imports

Import model types and enums from `prisma-frontend`:

```typescript
import {type User, AuthRole} from 'prisma-frontend';

export function authenticateAdmin(user: Partial<User>): boolean {
    return user.authRole === AuthRole.Admin;
}
```
