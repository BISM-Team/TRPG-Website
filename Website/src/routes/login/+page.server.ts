import { fail, type Actions, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createUser, getUser, setToken } from '$lib/server/auth';
import { error as _error } from '@sveltejs/kit';

export const load = (async ({ locals }) => {
    if(locals.user) { 
        throw redirect(302, '/') 
    }
    else return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    login: async (event) => {
        try {
            const data = await event.request.formData();
            let identifier = data.get('identifier'); // email or name
            let password = data.get('password');
    
            if(!identifier || !password) return fail(400, { identifier: identifier, identifier_missing: !identifier, password_missing: !password })
    
            const { user, error } = await getUser(identifier.toString(), password.toString());
         
            if(error) { return fail(422, error); }
            else if(user) { setToken(event.cookies, user.id) }
            else return fail(500, { identifier: identifier, unspecified_error: true })
        } catch (exc) {
            console.error(exc);
            return fail(500, { unspecified_error: true })
        }
    },

    register: async (event) => {
        try {
            const data = await event.request.formData();
            let email = data.get('email');
            let name = data.get('name');
            let password = data.get('password');
    
            if(!email || !name || !password) return fail(400, { email: email, name: name, email_missing: !email, name_missing: !name, password_missing: !password })
    
            const { user, error } = await createUser(email.toString(), name.toString(), password.toString());
         
            if(error) { return fail(422, error); }
            else if(user) { setToken(event.cookies, user.id) }
            else return fail(500, { email: email, name: name, unspecified_error: true })   
        } catch (exc) {
            console.error(exc);
            return fail(500, { unspecified_error: true })
        }
    }
}