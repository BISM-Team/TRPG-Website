import type { PageLoad } from './$types';

export const load = (async () => {
    return { elements: [{id: 0, content: 'first', width: 25*16, height: 10*16}, {id: 1, content: 'second', width: 10*16, height: 30*16}, {id: 3, content: 'second', width: 6*16, height: 10*16}, {id: 2, content: 'third'}, {id: 4, content: 'fourth'}, {id: 5, content: 'fifth'}]};
}) satisfies PageLoad;