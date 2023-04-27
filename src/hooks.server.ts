import { deleteToken, getUserFromToken } from "$lib/db/auth.server";
import type { Handle, HandleServerError } from "@sveltejs/kit";

export const handle = async function ({ event, resolve }) {
  const token = event.cookies.get("Authorization");
  event.locals.user = await getUserFromToken(token);
  if (!event.locals.user && token) deleteToken(event.cookies);
  return await resolve(event);
} satisfies Handle;

export const handleError = async function ({ error }) {
  console.error("UNEXPECTED: ", error);

  return {
    code: 500,
    message: "Unexpected Server Error, please contact us!!",
  };
} satisfies HandleServerError;
