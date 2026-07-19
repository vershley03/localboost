// Lazily instantiate PrismaClient so the import doesn't crash at build time
// when `prisma generate` hasn't been run yet.

let _client: InstanceType<typeof import("@prisma/client").PrismaClient> | null = null;

function getClient() {
  if (!_client) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client") as typeof import("@prisma/client");
    const g = globalThis as unknown as { __prisma?: InstanceType<typeof PrismaClient> };
    _client = g.__prisma ?? new PrismaClient();
    if (process.env.NODE_ENV !== "production") g.__prisma = _client;
  }
  return _client;
}

// Proxy preserves the `prisma.model.method(...)` calling convention while
// deferring the actual PrismaClient import + instantiation to first access.
export const prisma = new Proxy({} as import("@prisma/client").PrismaClient, {
  get(_target, prop) {
    return Reflect.get(getClient(), prop);
  },
});
