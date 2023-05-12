import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function () {
  return json({
    page: true,
  });
} satisfies RequestHandler;
