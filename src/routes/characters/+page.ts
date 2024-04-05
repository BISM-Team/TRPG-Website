import { propagateErrors } from '$lib/utils';
import type { PageLoad } from './$types';
import { goto } from '$app/navigation';
import { redirect } from '@sveltejs/kit';

export const load = (async ({ fetch, url }) => {
  const response = await fetch('/api/characters');
  await propagateErrors(response, url);
  if (!response.ok) throw new Error('unexpected error');

  return { characters: (await response.json()).characters };
}) satisfies PageLoad;

/*let id = 'caolhc';

  // @ts-expect-error no matched routes
  goto('');
  // @ts-expect-error no matched routes
  goto('/campaig');
  // @ts-expect-error no matched routes (is an endpoint)
  goto('/api/logout');
  // @ts-expect-error no matched routes (is an endpoint)
  goto('/api/campaign');
  // @ts-expect-error cannot assign type number to parameter of type string | URL
  goto(2);
  // @ts-expect-error no matched routes
  goto('https://external-url');

  goto('/');
  goto('/campaigns');
  goto(`/campaigns/${id}`);
  goto('/campaig' + 'n'); // unchecked
  goto(new URL('')); // unchecked

  // @ts-expect-error no matched endpoints
  fetch('');
  // @ts-expect-error no matched endpoints
  fetch('/api');
  // @ts-expect-error invalid method
  fetch('/api/campaign', { method: 'POST' });
  // @ts-expect-error invalid method
  fetch('/api/logout');
  // @ts-expect-error type 'number' is not assignable to parameter of type 'URL | RequestInfo'
  fetch(2);

  // can fetch routes with GET
  fetch('/');
  fetch('/campaigns');

  // @ts-expect-error cannote fetch routes with other methods
  fetch('/', { method: 'POST' });
  // @ts-expect-error cannote fetch routes with other methods
  fetch('/campaign', { method: 'POST' });

  fetch(`/api/campaigns/${id}`);
  fetch(`/api/campaigns/${id}`, { method: 'GET' });
  fetch('/api/logout', { method: 'POST' });
  fetch('/api/campaign' + '', { method: 'GET' }); // untyped and unchecked
  fetch('/' + '/api'); // untyped and unchecked
  fetch(new URL('')); // untyped and unchecked
  fetch('https://external-url'); // untyped and unchecked

  try {
    // @ts-expect-error no matched path
    redirect(300, '');
  } catch {}
  try {
    // @ts-expect-error no matched path
    redirect(300, '/api');
  } catch {}
  try {
    // @ts-expect-error cannot assign type number to string
    redirect(300, 2);
  } catch {}
  try {
    // @ts-expect-error cannot assign URL to type string
    redirect(300, new URL(''));
  } catch {}
  try {
    redirect(300, '/api/campaigns');
  } catch {}
  try {
    redirect(300, '/campaigns');
  } catch {}
  try {
    redirect(300, `/campaigns/${id}`);
  } catch {}
  try {
    redirect(300, `/campaign/${id}` + 'a'); // unchecked
  } catch {}
  try {
    redirect(300, '/campaig' + 'n'); // unchecked
  } catch {}
  try {
    redirect(300, 'https://external-url'); // unchecked
  } catch {}

  let trailing: string = 'abc';
  // slug route trailing
  fetch(`/api/campaigns/${id}?`);
  fetch(`/api/campaigns/${id}?trailing`);
  fetch(`/api/campaigns/${id}#`);
  fetch(`/api/campaigns/${id}#trailing`);
  fetch(`/api/campaigns/${id}${trailing}`);
  fetch(`/api/campaigns/${id}?${trailing}`);
  fetch(`/api/campaigns/${id}#${trailing}`);

  // static route trailing
  fetch(`/api/campaigns?`);
  fetch(`/api/campaigns?trailing`);
  fetch(`/api/campaigns#`);
  fetch(`/api/campaigns#trailing`);
  fetch(`/api/campaigns${trailing}`);
  fetch(`/api/campaigns?${trailing}`);
  fetch(`/api/campaigns#${trailing}`);

  // tecnhically allowed wierd slugs
  fetch(`/api/campaigns/${id}?/dashboards`);
  fetch(`/api/campaigns/${id}?trailing/dashboards`);
  fetch(`/api/campaigns/${id}#/dashboards`);
  fetch(`/api/campaigns/${id}#trailing/dashboards`);
  fetch(`/api/campaigns/${id}${trailing}/dashboards`);
  fetch(`/api/campaigns/${id}?${trailing}/dashboards`);
  fetch(`/api/campaigns/${id}#${trailing}/dashboards`);*/
