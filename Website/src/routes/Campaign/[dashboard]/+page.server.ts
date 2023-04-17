import type { PageServerLoad } from "./$types";
import { getDashboard } from "$lib/db/dashboard.server";
import { error, redirect } from "@sveltejs/kit";

export const load = (async ({ locals, params }) => {
    const user = locals.user;
    if (!user) throw redirect(302, "/login");
    const dashboard = await getDashboard(user, params.dashboard);
    if (!dashboard) throw error(404, "Dashboard not found");
    return { dashboard: dashboard };
}) satisfies PageServerLoad;
