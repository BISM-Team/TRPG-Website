import { LOG_LEVEL } from "$env/static/private";
import type { PrismaClient as ImportedPrismaClient } from "@prisma/client";
import { createRequire } from "module";

const { PrismaClient: RequiredPrismaClient } = createRequire(
  import.meta.url ?? __filename
)("@prisma/client");

const _PrismaClient: typeof ImportedPrismaClient = RequiredPrismaClient;

class PrismaClient extends _PrismaClient {}

export const db = new PrismaClient(
  LOG_LEVEL.includes("DBQUERY")
    ? {
        log: [
          {
            emit: "event",
            level: "query",
          },
          {
            emit: "stdout",
            level: "error",
          },
          {
            emit: "stdout",
            level: "info",
          },
          {
            emit: "stdout",
            level: "warn",
          },
        ],
      }
    : {}
);

if (LOG_LEVEL.includes("DBQUERY")) {
  // @ts-ignore
  db.$on("query", (e) => {
    // @ts-ignore
    console.log("Query duration: " + e.duration + "ms");
  });
}

if (LOG_LEVEL.includes("QUERY")) {
  db.$use(async (params, next) => {
    const before = Date.now();
    const result = await next(params);
    const after = Date.now();
    console.log(`${params.model}.${params.action} took ${after - before}ms`);
    return result;
  });
}
