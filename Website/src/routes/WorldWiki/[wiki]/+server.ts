import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
    throw redirect(301, url.pathname = url.pathname.concat('/index'));
};