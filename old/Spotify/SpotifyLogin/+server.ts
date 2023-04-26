import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { randomHex } from '$lib/utils';

const client_id = '';
const client_secret = '';
const access_token_birth : number | null = null;
let access_token: string | null = null;
let refresh_token: string | null = null;

async function requestRefreshedToken(auth_code: string) {
    const form_body = new URLSearchParams();
    form_body.append('grant_type', 'refresh_token');
    form_body.append('code', auth_code);

    const req = new Request('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': client_id + ':' + client_secret,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form_body
    });

    const res = await fetch(req);
    if(res.ok) {
        return await res.json();
    } else {
        throw new Error(res.statusText + '\n' + (await res.text()));
    }
}

async function requestAccessToken(callbackUrl: string, auth_code: string, ) {
    const form_body = new URLSearchParams();
    form_body.append('grant_type', 'authorization_code');
    form_body.append('code', auth_code);
    form_body.append('redirect_uri', callbackUrl);

    const req = new Request('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form_body
    });

    console.log(req);
    console.log(req.headers);

    const res = await fetch(req);
    if(res.ok) {
        return await res.json();
    } else {
        throw new Error(res.statusText + '\n' + (await res.text()));
    }
}

export const GET: RequestHandler = async ({ url }) => {
    const code=url.searchParams.get('code');
    if(code && url.searchParams.has('state')) {
        const result = await requestAccessToken(url.origin+url.pathname, code);
        access_token = result.access_token;
        refresh_token = result.refresh_token;
        throw redirect(301, new URL('..', url.origin+url.pathname).toString());
    } else if(url.searchParams.has('error') && url.searchParams.has('state')) {
        throw redirect(301, new URL('..', url.origin+url.pathname).toString());
    } else if(access_token === null && refresh_token === null) {
        const state = randomHex(8);
        const scope = 'user-read-private user-read-email user-modify-playback-state streaming';
    
        const req_url = new URL('https://accounts.spotify.com/authorize');
        req_url.searchParams.append('response_type', 'code');
        req_url.searchParams.append('client_id', client_id);
        req_url.searchParams.append('scope', scope);
        req_url.searchParams.append('redirect_uri', url.origin+url.pathname);
        req_url.searchParams.append('state', state);
        throw redirect(302, req_url.toString());
    } else {
        return new Response(access_token);
    }
};