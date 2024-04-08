import { propagateErrors } from '$lib/utils';
import type { PageLoad } from './$types';

const fetchWiki = async function ({ fetch, params, url }) {
  const wiki_response = await fetch(`/api/wikis/${params.wiki}`);
  await propagateErrors(wiki_response, url);
  if (!wiki_response.ok) throw new Error('unexpected error');
  return (await wiki_response.json()).wiki;
} satisfies PageLoad;

export const load: PageLoad = async (event) => {
  const { params, fetch, url } = event;
  const page_response = await fetch(`/api/wikis/${params.wiki}/pages/${params.page}`);
  await propagateErrors(page_response, url);
  if (!page_response.ok) throw new Error('unexpected error');
  const data = await page_response.json();

  return {
    ...data,
    wiki: await fetchWiki(event),
    params
  };
};

