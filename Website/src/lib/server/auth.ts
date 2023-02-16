import jwt, { type JwtPayload } from "jsonwebtoken";
import { PrismaClient, type User } from '@prisma/client'
import { error } from "@sveltejs/kit";

export const db = new PrismaClient(); 

export async function getUserFromToken(token: string | undefined) : Promise<User|null> {
    let jwtUser: string | JwtPayload;
    if(token && (jwtUser = jwt.verify(token, import.meta.env.AUTH_SECRET))) {
        if((typeof jwtUser === 'string')) throw error(400, 'Invalid Token');
        return await db.user.findUnique({ where: { id: jwtUser.id } });
    }
    else return null;
}