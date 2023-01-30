import type { WikiPreview } from '$lib/data_types';
import type { PageServerLoad } from './$types';

const wikis : WikiPreview[] = [
    {name: 'Unanys', description: 'Il mondo dell\' ultima campagna di gianni, la sua più bella.'},
    {name: 'BISM', description: 'Il mondo di cui non mi ricordo mai il nome della campagna originale dei BISM.'},
    {name: 'Elidan', description: 'Il mondo della campagna di Tommidi.'},
    {name: 'Neva', description: 'Il mondo della campagna di Coco, non mi ricordo come si chiama ma mi ricordo che c\'è la neva.'}
];

export const load = (async () => {
    return {world_wikis:  wikis};
}) satisfies PageServerLoad;