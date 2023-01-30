import { marked } from 'marked';
import type { PageServerLoad, RouteParams } from './$types';

interface Page {
    title: string,
    content: string
}

const pages : Page[] = [
    {title: 'index', content: '# Tag 1\n[title1](./title1)'},
    {title: 'title1', content: '# Section 1\ndajlbvlabdvla\n\n# Section 2\ncvpijbòdkgnmhlwirhdajgvs\n\nend'}
]

export const load = (async ({params}) => {
    let out: {params: RouteParams, index: boolean, page: Page|undefined} = {params: params, index: false, page: undefined};
    if(params.page==='index') {
        out.index=true;
    }
    let page = pages.find(page => {return params.page===page.title;})
    if(page)
        out.page = {title: page.title, content: marked.parse(page.content)}
    return out;
}) satisfies PageServerLoad;