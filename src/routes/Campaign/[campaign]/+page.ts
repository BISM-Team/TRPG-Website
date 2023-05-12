import type { ValidateRequired } from "../../../../$api";
import type { PageLoad } from "./$types";

type RequiredSlug<S extends string> = ValidateRequired<S> extends true
  ? S
  : never;

export const load = (async ({ params, fetch }) => {
  let str: RequiredSlug<typeof params.campaign> = params.campaign;
  const response_2 = await (
    await fetch("/api/Campaign", { method: "POST" })
  ).json();
  //const response_3_err = await (await fetch("/api/Campaign/ciao/wiki")).json();
  const response_3 = await (
    await fetch("/api/Campaign/ciao/wiki", { method: "POST" })
  ).json();
  const response_4 = await (await fetch("/api/Campaign")).json();
  const response_5 = await (await fetch(new URL("/ciao"))).json();
  const response_6_1 = await (
    await fetch("/api/Campaign/" + str + "/wiki/page/optional")
  ).json();
  const response_6_2 = await (
    await fetch(`/api/Campaign/${params.campaign}/wiki/page/optional/`)
  ).json();
  const response_6 = await (
    await fetch(`/api/Campaign/${params.campaign}/wiki/page/optional/slug`)
  ).json();
  const response_7 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/slug/other`
    )
  ).json();
  const response_7_1 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/slug/another`
    )
  ).json();
  const response_8 = await (
    await fetch(`/api/Campaign/${params.campaign}/wiki/page/optional/another`)
  ).json();
  const response_9_0 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/slug/another/`
    )
  ).json();
  const response_9_1 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/another/rest`
    )
  ).json();
  const response_9_2 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/another/rest/foo`
    )
  ).json();
  const response_9_3 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/another/foo`
    )
  ).json();
  const response_10 = await (
    await fetch(`/api/Campaign/${params.campaign}/wiki/page/optional/other`)
  ).json();

  return {};
}) satisfies PageLoad;
