import type { PrismaClient as ImportedPrismaClient } from "@prisma/client";
import { createRequire } from "module";

const { PrismaClient: RequiredPrismaClient } = createRequire(
  import.meta.url ?? __filename
)("@prisma/client");

const _PrismaClient: typeof ImportedPrismaClient = RequiredPrismaClient;

class PrismaClient extends _PrismaClient {}

export const db = new PrismaClient();
