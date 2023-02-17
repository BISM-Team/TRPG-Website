import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load = (async ({ params }) => {
    throw redirect(301, `/WorldWiki/${params.wiki}/index`);
}) satisfies PageLoad;