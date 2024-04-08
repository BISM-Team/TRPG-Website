import { propagateErrors, replaceCardSource } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageLoad, PageLoadEvent } from './$types';

async function loadCampaign(fetch: PageLoadEvent['fetch'], campaignId: string, url: URL) {
  const response = await fetch(`/api/campaigns/${campaignId}`);
  await propagateErrors(response, url);
  if (!response.ok) throw new Error('unexpected error');
  const data = await response.json();
  if (!data.campaign) error(404);

  return data.campaign;
}

async function loadDashboard(fetch: PageLoadEvent['fetch'], dashboardId: string, url: URL) {
  const response = await fetch(`/api/dashboards/${dashboardId}`);
  if (!response.ok) return null;
  const data = await response.json();

  if (!data.dashboard) return null;

  const new_cards = data.dashboard.cards.map((card) => {
    return replaceCardSource(card, data.dashboard);
  });
  const { cards, ...rest } = data.dashboard;
  return { ...rest, cards: new_cards };
}

export const load = (async ({ fetch, params, url }) => {
  return {
    params,
    campaign: await loadCampaign(fetch, params.campaign, url),
    dashboard:
      params.dashboard !== 'empty'
        ? loadDashboard(fetch, params.dashboard, url).catch(() => {})
        : null
  };
}) satisfies PageLoad;

