import { getDashboard } from '$lib/db/dashboards.server';
import { getLogin } from '$lib/utils.server';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET = async function ({ locals, params }) {
  const user = getLogin(locals);
  const dashboard = await getDashboard(user.id, params.dashboard);
  if (!dashboard) error(404, 'Dashboard not found');
  return json({ dashboard });
} satisfies RequestHandler;

