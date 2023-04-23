import { fail, type Actions, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createUser, getUser, setToken } from "$lib/db/auth.server";
import { error as _error } from "@sveltejs/kit";

export const load = (async ({ locals }) => {
  if (locals.user) {
    throw redirect(302, "/");
  } else return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
  login: async (event) => {
    const data = await event.request.formData();
    let identifier = String(data.get("identifier")); // email or name
    let password = String(data.get("password"));
    let redirect_url = String(data.get("redirect"));

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
    let email = String(data.get("email"));
    let name = String(data.get("name"));
    let password = String(data.get("password"));
    let redirect_url = String(data.get("redirect"));

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
