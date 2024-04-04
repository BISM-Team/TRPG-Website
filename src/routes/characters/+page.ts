import { goto } from "$app/navigation";
import { propagateErrors } from "$lib/utils";
import { redirect } from "@sveltejs/kit";
import type { PageLoad } from "./$types";

export const load = (async ({ fetch, url }) => {
  const response = await fetch("/api/characters");
  await propagateErrors(response, url);
  if (!response.ok) throw new Error("unexpected error");

  let id = "caolhc";

  // @ts-expect-error no matched routes
  goto("");
  // @ts-expect-error no matched routes
  goto("/campaig");
  // @ts-expect-error no matched routes (is an endpoint)
  goto("/api/logout");
  // @ts-expect-error no matched routes (is an endpoint)
  goto("/api/campaign");
  // @ts-expect-error cannot assign type number to parameter of type string | URL
  goto(2);
  // @ts-expect-error no matched routes
  goto("https://external-url");

  goto("/");
  goto("/campaign");
  goto(`/campaign/${id}`);
  goto("/campaig" + "n"); // unchecked
  goto(new URL("")); // unchecked

  // @ts-expect-error no matched endpoints
  fetch("");
  // @ts-expect-error no matched endpoints
  fetch("/api");
  // @ts-expect-error invalid method
  fetch("/api/campaign", { method: "POST" });
  // @ts-expect-error invalid method
  fetch("/api/logout");
  // @ts-expect-error type 'number' is not assignable to parameter of type 'URL | RequestInfo'
  fetch(2);

  // can fetch routes with GET
  fetch("/");
  fetch("/campaign");

  // @ts-expect-error cannote fetch routes with other methods
  fetch("/", { method: "POST" });
  // @ts-expect-error cannote fetch routes with other methods
  fetch("/campaign", { method: "POST" });

  fetch(`/api/campaign/${id}`);
  fetch(`/api/campaign/${id}`, { method: "GET" });
  fetch("/api/logout", { method: "POST" });
  fetch("/api/campaign" + "", { method: "GET" }); // untyped and unchecked
  fetch("/" + "/api"); // untyped and unchecked
  fetch(new URL("")); // untyped and unchecked
  fetch("https://external-url"); // untyped and unchecked

  // @ts-expect-error no matched path
  redirect(300, "");
  // @ts-expect-error no matched path
  redirect(300, "/api");
  // @ts-expect-error cannot assign type number to string
  redirect(300, 2);
  // @ts-expect-error cannot assign URL to type string
  redirect(300, new URL(""));

  redirect(300, "/api/campaign");
  redirect(300, "/campaign");
  redirect(300, `/campaign/${id}`);
  redirect(300, `/campaign/${id}` + "a"); // unchecked
  redirect(300, "/campaig" + "n"); // unchecked
  redirect(300, "https://external-url"); // unchecked

  let trailing: string = "abc";
  // slug route trailing
  fetch(`/api/campaign/${id}?`);
  fetch(`/api/campaign/${id}?trailing`);
  fetch(`/api/campaign/${id}#`);
  fetch(`/api/campaign/${id}#trailing`);
  fetch(`/api/campaign/${id}${trailing}`);
  fetch(`/api/campaign/${id}?${trailing}`);
  fetch(`/api/campaign/${id}#${trailing}`);

  // static route trailing
  fetch(`/api/campaign?`);
  fetch(`/api/campaign?trailing`);
  fetch(`/api/campaign#`);
  fetch(`/api/campaign#trailing`);
  fetch(`/api/campaign${trailing}`);
  fetch(`/api/campaign?${trailing}`);
  fetch(`/api/campaign#${trailing}`);

  // tecnhically allowed wierd slugs
  fetch(`/api/campaign/${id}?/dashboards`);
  fetch(`/api/campaign/${id}?trailing/dashboards`);
  fetch(`/api/campaign/${id}#/dashboards`);
  fetch(`/api/campaign/${id}#trailing/dashboards`);
  fetch(`/api/campaign/${id}${trailing}/dashboards`);
  fetch(`/api/campaign/${id}?${trailing}/dashboards`);
  fetch(`/api/campaign/${id}#${trailing}/dashboards`);

  return { characters: (await response.json()).characters };
}) satisfies PageLoad;

