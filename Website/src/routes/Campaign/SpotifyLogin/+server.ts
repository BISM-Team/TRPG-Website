import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '../$types';
import crypto from 'crypto'

const client_id = '57961fde5fd8420eb16938f7931cc45e';
const client_secret = '29fa74abc8c1401b98390a850fd3151c';
let access_token_birth : number | null = null;
let access_token: string | null = null;
let refresh_token: string | null = null;

async function requestRefreshedToken(auth_code: string) {
    let form_body = new URLSearchParams();
    form_body.append('grant_type', 'refresh_token');
    form_body.append('code', auth_code);

    let req = new Request('https://accounts.spotify.com/api/token', {
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
    let form_body = new URLSearchParams();
    form_body.append('grant_type', 'authorization_code');
    form_body.append('code', auth_code);
    form_body.append('redirect_uri', callbackUrl);

    let req = new Request('https://accounts.spotify.com/api/token', {
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
    if(url.searchParams.has('code') && url.searchParams.has('state')) {
        const result = await requestAccessToken(url.origin+url.pathname,  url.searchParams.get('code'));
        access_token = result.access_token;
        refresh_token = result.refresh_token;
        throw redirect(301, new URL('..', url.origin+url.pathname).toString());
    } else if(url.searchParams.has('error') && url.searchParams.has('state')) {
        throw redirect(301, new URL('..', url.origin+url.pathname).toString());
    } else if(access_token === null && refresh_token === null) {
        let state = crypto.randomBytes(8).toString('hex')
        var scope = 'user-read-private user-read-email user-modify-playback-state';
    
        let req_url = new URL('https://accounts.spotify.com/authorize');
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