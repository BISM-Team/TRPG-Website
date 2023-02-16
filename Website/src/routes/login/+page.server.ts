import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { createUser, setToken } from '$lib/server/auth';
import { error as _error } from '@sveltejs/kit';

export const load = (async () => {
    return {};
}) satisfies PageServerLoad;

export const actions: Actions = {
    default: async (event) => {
        const data = await event.request.formData();
        let email = data.get('email');
        let name = data.get('name');
        let password = data.get('password');

        if(!email || !name || !password) return fail(400, { email: email, name: name, email_missing: !email, name_missing: !name, password_missing: !password })

        const { user, error } = await createUser(email.toString(), name.toString(), password.toString());
     
        if(error) { return fail(422, error); }
        else if(user) { setToken(event.cookies, user.id) }
        else throw _error(500, 'Unknown error')
    }
}