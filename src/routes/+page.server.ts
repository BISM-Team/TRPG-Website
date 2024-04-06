import { getLogin } from '$lib/utils.server';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { capitalizeFirstLetter } from '$lib/utils';
import { createCampaign } from '$lib/db/campaigns.server';
import { createCharacter } from '$lib/db/characters.server';
import { createDashboardFromTemplate } from '$lib/db/dashboard_templates.server';
import { createDashboard } from '$lib/db/dashboards.server';
import { DashboardType } from '@prisma/client';
import { db } from '$lib/db/db.server';
import { createWiki } from '$lib/db/wikis.server';
import { isHttpError } from '@sveltejs/kit';

export const actions: Actions = {
  createCampaign: async function ({ locals, request }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get('name')?.toString();
    if (!name) return fail(400, { name_missing: true });
    try {
      await createCampaign(user.id, { name: capitalizeFirstLetter(name) });
    } catch (exc) {
      if (isHttpError(exc)) throw exc;
      console.error(exc);
      return fail(500, { name: name, server_error: true });
    }
  },

  createCharacter: async function ({ locals, request, params }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get('name')?.toString();

    const savedData = {
      name: name
    };

    if (!name) return fail(400, { ...savedData, name_missing: true });

    try {
      const character_sheet_default = null; //await getDashboardTemplate(...); ensure type === DashboardType.character_sheet
      const character = {
        name: name,
        abilities: await db.ability.findMany({ include: { effects: true } }),
        items: await db.item.findMany({ include: { effects: true } })
      };

      const created_character = await createCharacter(user.id, character);

      character_sheet_default
        ? await createDashboardFromTemplate(user.id, name, character_sheet_default, true, {
            character: created_character,
            campaign: undefined
          })
        : await createDashboard(user.id, name, DashboardType.character_sheet, true, {
            character: created_character,
            campaign: undefined
          });
    } catch (exc) {
      if (isHttpError(exc)) throw exc;
      console.error(exc);
      return fail(500, { ...savedData, server_error: true });
    }
  },

  createWiki: async function ({ locals, request }) {
    const user = getLogin(locals);

    const data = await request.formData();
    const name = data.get('name')?.toString();
    if (!name) return fail(400, { name_missing: true });
    try {
      await createWiki(user.id, {
        name: capitalizeFirstLetter(name),
        wikiTree: {
          name: 'root',
          viewers: ['all'],
          modifiers: ['all'],
          children: [
            {
              name: 'Index',
              viewers: ['all'],
              modifiers: ['all'],
              children: []
            },
            {
              name: 'Unsorted',
              viewers: ['all'],
              modifiers: ['all'],
              children: []
            }
          ]
        }
      });
    } catch (exc) {
      if (isHttpError(exc)) throw exc;
      console.error(exc);
      return fail(500, { name: name, server_error: true });
    }
  }
};

