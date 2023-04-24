import { fail, type Actions, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createUser, getUser, setToken } from "$lib/db/auth.server";

export const load = (async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, "/");
  } else return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
  login: async (event) => {
    const data = await event.request.formData();
    const identifier = data.get("identifier")?.toString(); // email or name
    const password = data.get("password")?.toString();
    const redirect_url = data.get("redirect")?.toString();

    if (!identifier || !password)
      return fail(400, {
        identifier: identifier,
        identifier_missing: !identifier,
        password_missing: !password,
      });

    try {
      const { user, error } = await getUser(identifier, password);
      if (error) {
        return fail(422, error);
      } else if (user) {
        setToken(event.cookies, user);
      } else
        return fail(500, { identifier: identifier, unspecified_error: true });
    } catch (exc) {
      console.error(exc);
      return fail(500, { unspecified_error: true });
    }

    if (redirect_url) throw redirect(302, redirect_url);
  },

  register: async (event) => {
    const data = await event.request.formData();
    const email = data.get("email")?.toString();
    const name = data.get("name")?.toString();
    const password = data.get("password")?.toString();
    const redirect_url = data.get("redirect")?.toString();

    if (!email || !name || !password)
      return fail(400, {
        email: email,
        name: name,
        email_missing: !email,
        name_missing: !name,
        password_missing: !password,
      });

    try {
      const { user, error } = await createUser(email, name, password);

      if (error) {
        return fail(422, error);
      } else if (user) {
        setToken(event.cookies, user);
      } else
        return fail(500, { email: email, name: name, unspecified_error: true });
    } catch (exc) {
      console.error(exc);
      throw fail(500, { unspecified_error: true });
    }

    if (redirect_url) throw redirect(302, redirect_url);
  },
};
