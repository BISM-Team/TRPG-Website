import { expect, test } from 'vitest';
import { mergeTrees } from './lib/server/tree/merge';
import { parseSource } from './lib/tree/tree';
import { logWholeObject } from '$lib/utils';

const src_1 = '::heading[# Test]{#page_title viewers=all} \n\n paragraph visible to all \n\n::heading[## Visible to GM only]{modifiers=GM viewers=GM} \n\nparahraph with some content \n\nanother paragraph \n\n::heading[## Visible to P1 and P2]{viewers=Player1;Player2 modifiers=Player1} \n\n::youtube[Video of an Interesting Algorithm]{#A60q6dcoCjw} \n\nparagraph with more content';
const src_2 = '::heading[# Test]{#page_title viewers=all} \n\n paragraph visible to all \n\n::heading[## Visible to GM only]{modifiers=GM viewers=GM} \n\nparahraph with some content \n\nanother paragraph \n\n::heading[## Visible to P1 and P2]{viewers=Player1;Player2 modifiers=Player1} \n\n::youtube[Video of an Interesting Algorithm]{#A60q6dcoCjw} \n\nparagraph with more content';

test('tree merge', async () => {
	const username = 'gm';
	const left = await parseSource(src_1);
	const right = await parseSource(src_2);
	logWholeObject(mergeTrees(left, right, username));
	expect(false).toBeTruthy();
})