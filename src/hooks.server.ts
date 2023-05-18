import { LOG_LEVEL } from "$env/static/private";
import { deleteToken, getUserFromToken } from "$lib/db/auth.server";
import type { Handle, HandleServerError } from "@sveltejs/kit";

export const handle = async function ({ event, resolve }) {
  const token = event.cookies.get("Authorization");
  event.locals.user = await getUserFromToken(token);
  if (!event.locals.user && token) deleteToken(event.cookies);
  if (LOG_LEVEL.includes("REQUEST")) {
    const before = Date.now();
    const result = await resolve(event);
    const after = Date.now();
    const url = new URL(event.request.url);
    console.log(
      `Request ${event.request.method} ${url.pathname} took ${after - before}ms`
    );
    return result;
  } else return await resolve(event);
} satisfies Handle;

export const handleError = async function ({ error }) {
  console.error("SERVER ERROR: ", error);

  return {
    code: 500,
    message: "Unexpected Server Error, please contact us!!",
  };
} satisfies HandleServerError;
