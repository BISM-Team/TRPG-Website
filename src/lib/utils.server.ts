import { error } from "@sveltejs/kit";

export function getLogin(locals: App.Locals) {
  const user = locals.user;
  if (!user) error(401);
  return user;
}
