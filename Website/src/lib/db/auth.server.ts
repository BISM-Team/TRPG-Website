import jwt, { type JwtPayload } from "jsonwebtoken";
import type { User } from '@prisma/client'
import { error, type Cookies } from "@sveltejs/kit";
import { AUTH_SECRET } from "$env/static/private";
import bcrypt from 'bcrypt'
import { db } from "./db.server";

export async function getUserFromToken(token: string | undefined) : Promise<User|null> {
    let jwtUser: string | JwtPayload;
    if(token && (jwtUser = jwt.verify(token, AUTH_SECRET))) {
        if((typeof jwtUser === 'string')) throw error(400, 'Invalid Token');
        return await db.user.findUnique({ where: { id: jwtUser.id } });
    }
    else return null;
}

export function createToken(user: User) {
    return jwt.sign({id: user.id, username: user.name}, AUTH_SECRET, { expiresIn: '8h' });
}

export function setToken(cookies: Cookies, user: User) {
    cookies.set('Authorization', createToken(user), {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 8 // 8 hours
      });
}

export function deleteToken(cookies: Cookies) {
    cookies.delete('Authorization', { path: '/' });
}

export async function getUser(identifier: string, password: string) {
    const user = await db.user.findFirst({ 
        where: { 
            OR: [{ email: identifier }, { name: identifier }] 
        }
    });

    if(user) {
        if(await bcrypt.compare(password, user.password)) return {user: user, error: null}
        else return {user: null, error: {identifier: identifier, login_failed: true}}
    }
    else return {user: null, error: {identifier: identifier, login_failed: true}}
}

export async function createUser(email: string, name: string, password: string) {
    const user_with_email = await db.user.findUnique({ where: { email: email } });
    const user_with_name = await db.user.findUnique({ where: { name: name } });
    if(user_with_email || user_with_name) return { user: null, error: {email, name, email_already_existing: user_with_email!==null, name_already_existing: user_with_name!==null }}

    try {
		const user = await db.user.create({
			data: {
				email,
                name,
				password: await bcrypt.hash(password, 10)
			}
		});
		return { user: user, error: null };
	} catch (error) {
        return {user: null, error: null}
	}
}