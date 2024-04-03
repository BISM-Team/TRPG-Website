import jwt, { type JwtPayload } from "jsonwebtoken";
import type { User } from "@prisma/client";
import { error, type Cookies } from "@sveltejs/kit";
import { AUTH_SECRET } from "$env/static/private";
import bcrypt from "bcrypt";
import { db } from "./db.server";

export interface MyJwtPayload extends JwtPayload, Pick<User, "id" | "name"> {
  id: string;
  name: string;
}

export async function getUserFromToken(token: string | undefined) {
  let jwtUser: string | JwtPayload;
  if (token && (jwtUser = jwt.verify(token, AUTH_SECRET))) {
    if (typeof jwtUser === "string") error(400, "Invalid Token");
    return jwtUser as MyJwtPayload;
  } else return null;
}

export function createToken(user: User) {
  const payload: MyJwtPayload = { id: user.id, name: user.name };
  return jwt.sign(payload, AUTH_SECRET, {
    expiresIn: "8h",
  });
}

export function setToken(cookies: Cookies, user: User) {
  cookies.set("Authorization", createToken(user), {
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
  });
}

export function deleteToken(cookies: Cookies) {
  cookies.delete("Authorization", { path: "/" });
}

export async function getUser(email: string, password: string) {
  const user = await db.user.findUnique({
    where: {
      email: email,
    },
  });

  if (user) {
    const compare_result = await bcrypt.compare(password, user.password);
    return compare_result
      ? { user: user, error: null }
      : {
          user: null,
          error: { email: email, login_failed: true },
        };
  } else
    return {
      user: null,
      error: { email: email, login_failed: true },
    };
}

export async function createUser(
  email: string,
  name: string,
  password: string
) {
  const user_with_email = await db.user.findUnique({ where: { email: email } });
  if (user_with_email)
    return { user: null, error: { email, name, email_already_existing: true } };

  const user = await db.user.create({
    data: {
      email,
      name,
      password: await bcrypt.hash(password, 10),
    },
  });
  return { user: user, error: null };
}
