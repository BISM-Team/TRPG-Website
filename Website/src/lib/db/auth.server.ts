import jwt, { type JwtPayload } from "jsonwebtoken";
import type { User } from "@prisma/client";
import { error, type Cookies } from "@sveltejs/kit";
import { AUTH_SECRET } from "$env/static/private";
import bcrypt from "bcrypt";
import { db } from "./db.server";

export async function getUserFromToken(token: string | undefined) {
  let jwtUser: string | JwtPayload;
  if (token && (jwtUser = jwt.verify(token, AUTH_SECRET))) {
    if (typeof jwtUser === "string") throw error(400, "Invalid Token");
    return await db.user.findUnique({ where: { id: jwtUser.id } });
  } else return null;
}

export function createToken(user: User) {
  return jwt.sign({ id: user.id, username: user.name }, AUTH_SECRET, {
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
  const user = await db.user.findFirst({
    where: {
      email: email,
    },
  });

  if (user) {
    let compare_result: boolean;
    try {
      compare_result = await bcrypt.compare(password, user.password);
    } catch (exc) {
      console.error(exc);
      return { user: null, server_error: true };
    }
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

  try {
    const user = await db.user.create({
      data: {
        email,
        name,
        password: await bcrypt.hash(password, 10),
      },
    });
    return { user: user, error: null };
  } catch (exc) {
    console.error(exc);
    return { user: null, error: { email, name, server_error: true } };
  }
}
