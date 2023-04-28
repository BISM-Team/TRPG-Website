import type { PrismaClient as ImportedPrismaClient } from "@prisma/client";
import { createRequire } from "module";

const { PrismaClient: RequiredPrismaClient } = createRequire(
  import.meta.url ?? __filename
)("@prisma/client");

const _PrismaClient: typeof ImportedPrismaClient = RequiredPrismaClient;

class PrismaClient extends _PrismaClient {}

export const db = new PrismaClient({
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
});

db.$on("query", (e) => {
  console.log("Query: " + e.query);
  console.log("Params: " + e.params);
  console.log("Duration: " + e.duration + "ms");
});
