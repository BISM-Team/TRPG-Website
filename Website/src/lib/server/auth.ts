import jwt, { type JwtPayload } from "jsonwebtoken";
import { PrismaClient, type User } from '@prisma/client'
import { error, type Cookies } from "@sveltejs/kit";
import bcrypt from 'bcrypt'

export const db = new PrismaClient(); 

export async function getUserFromToken(token: string | undefined) : Promise<User|null> {
    let jwtUser: string | JwtPayload;
    if(token && (jwtUser = jwt.verify(token, import.meta.env.AUTH_SECRET))) {
        if((typeof jwtUser === 'string')) throw error(400, 'Invalid Token');
        return await db.user.findUnique({ where: { id: jwtUser.id } });
    }
    else return null;
}

export function createToken(id: string) {
    return jwt.sign({id: id}, import.meta.env.AUTH_SECRET, {
		expiresIn: '8h'
	});
}

export function setToken(cookies: Cookies, id: string) {
    cookies.set('AuthorizationToken', `Bearer ${createToken(id)}`, {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'strict',
        maxAge: 60 * 60 * 8 // 8 hours
      });
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