// See https://kit.svelte.dev/docs/types#app

import type { MyJwtPayload } from "$lib/db/auth.server";
import type { User } from "@prisma/client";

// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals { user: MyJwtPayload | null }
		// interface PageData {}
		// interface Platform {}
	}
}

export {};
