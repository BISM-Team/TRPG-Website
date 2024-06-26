import { getDashboardTemplates } from '$lib/db/dashboard_templates.server';
import { getLogin } from '$lib/utils.server';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { DashboardType } from '@prisma/client';

export const GET = async function ({ locals, url }) {
  const user = getLogin(locals);
  const query = url.searchParams;
  const _type = query.get('type');
  const type =
    _type && Object.keys(DashboardType).includes(_type) ? (_type as DashboardType) : undefined;
  const templates = await getDashboardTemplates(user.id, type);
  return json({ templates });
} satisfies RequestHandler;

