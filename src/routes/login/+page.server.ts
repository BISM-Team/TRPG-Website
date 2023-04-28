import { fail, type Actions, redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { createUser, getUser, setToken } from "$lib/db/auth.server";

export const load = (async ({ locals }) => {
  if (locals.user) {
    throw redirect(307, "/");
  } else return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
  login: async (event) => {
    const data = await event.request.formData();
    const email = data.get("username")?.toString(); // email or name
    const password = data.get("password")?.toString();
    const redirect_url = data.get("redirect")?.toString();

    if (!email || !password || !redirect_url)
      return fail(400, {
        login_email: email,
        login_email_missing: !email,
        login_password_missing: !password,
      });

    try {
      const { user, error } = await getUser(email, password);
      if (error) {
        return fail(422, error);
      } else {
        setToken(event.cookies, user);
      }
    } catch (exc) {
      console.error(exc);
      return fail(500, { login_server_error: true });
    }

    throw redirect(303, redirect_url);
  },

  register: async (event) => {
    const data = await event.request.formData();
    const email = data.get("username")?.toString();
    const name = data.get("name")?.toString();
    const password = data.get("password")?.toString();
    const repeat_password = data.get("repeat_password")?.toString();
    const redirect_url = data.get("redirect")?.toString();

    if (
      !email ||
      !name ||
      !password ||
      !repeat_password ||
      password !== repeat_password
    )
      return fail(400, {
        register_email: email,
        register_name: name,
        register_email_missing: !email,
        register_name_missing: !name,
        register_password_missing: !password,
        register_repeat_password_missing: !repeat_password,
        register_password_mismatched: password !== repeat_password,
      });

    try {
      const { user, error } = await createUser(email, name, password);

      if (error) return fail(422, error);
      else setToken(event.cookies, user);
    } catch (exc) {
      console.error(exc);
      return fail(500, { register_server_error: true });
    }

    if (redirect_url) throw redirect(303, redirect_url);
  },
};
