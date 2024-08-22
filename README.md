# prisma-frontend

A Prisma generator for creating frontend-friendly exports (types and enums).

Experimental still. Please open bug tickets in GitHub.

## Install

```
npm i -D prisma-frontend
```

## Usage

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
