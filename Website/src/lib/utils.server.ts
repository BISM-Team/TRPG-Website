import { redirect } from "@sveltejs/kit";

export function getLoginOrRedirect(locals: App.Locals) {
  const user = locals.user;
  if (!user) throw redirect(307, "/login");
  return user;
}
