import type { User } from "@prisma/client";
import { redirect } from "@sveltejs/kit";

export function getLoginOrRedirect(locals: App.Locals) {
  const user = locals.user;
  if (!user) throw redirect(302, "/login");
  return user;
}
