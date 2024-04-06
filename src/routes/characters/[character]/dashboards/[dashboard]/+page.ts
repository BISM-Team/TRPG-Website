import { propagateErrors, replaceCardSource } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad, PageLoadEvent } from './$types';

async function loadCharacter(fetch: PageLoadEvent['fetch'], characterId: string, url: URL) {
  const response = await fetch(`/api/characters/${characterId}`);
  await propagateErrors(response, url);
  if (!response.ok) throw new Error('unexpected error');
  const data = await response.json();
  if (!data.character) error(404);

  return data.character;
}

async function loadDashboard(fetch: PageLoadEvent['fetch'], dashboardId: string, url: URL) {
  const response = await fetch(`/api/dashboards/${dashboardId}`);
  await propagateErrors(response, url);
  if (!response.ok) throw new Error('unexpected error');
  const data = await response.json();

  if (!data.dashboard) error(404);

  const new_cards = data.dashboard.cards.map((card) => {
    return replaceCardSource(card, data.dashboard);
  });
  const { cards, ...rest } = data.dashboard;
  return { ...rest, cards: new_cards };
}

export const load = (async ({ fetch, params, url }) => {
  return {
    params,
    character: await loadCharacter(fetch, params.character, url),
    dashboard: params.dashboard !== 'empty' ? loadDashboard(fetch, params.dashboard, url) : null
  };
}) satisfies PageLoad;

