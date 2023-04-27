import { redirect } from "@sveltejs/kit";

export function getLoginOrRedirect(locals: App.Locals, current_url: URL) {
  const user = locals.user;
  if (!user) throw redirect(307, "/login?redirect=" + current_url.toString());
  return user;
}
