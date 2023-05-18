import { error } from "@sveltejs/kit";

export function getLogin(locals: App.Locals, current_url: URL) {
  const user = locals.user;
  if (!user) throw error(401);
  return user;
}
