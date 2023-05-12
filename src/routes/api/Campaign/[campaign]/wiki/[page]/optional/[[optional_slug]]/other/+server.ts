import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

export const GET = async function ({ params }) {
  return json({
    other: true,
  });
} satisfies RequestHandler;
