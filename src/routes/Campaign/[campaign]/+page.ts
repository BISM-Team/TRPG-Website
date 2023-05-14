import type {
  ExtractIdFromMatched,
  MatchedPaths,
  TypedResponseFromPath,
  ValidMethod,
  ValidateRequired,
} from "../../../../$api";
import type { PageLoad } from "./$types";

export const load = (async ({ params, fetch }) => {
  const response_2 = await (
    await fetch("/api/Campaign", { method: "POST" })
  ).json();
  const response_3_err = await (await fetch("/api/Campaign/ciao/wiki")).json();
  const response_3 = await (
    await fetch("/api/Campaign/ciao/wiki", { method: "POST" })
  ).json();
  const response_4 = await (await fetch("/api/Campaign")).json();
  const response_5 = await (await fetch(new URL("/ciao"))).json();
  const response_6_1 = await (
    await fetch("/api/Campaign/" + params.campaign + "/wiki/page/optional")
  ).json();
  const response_6_2 = await (
    await fetch(`/api/Campaign/${params.campaign}/wiki/page/optional/` as const)
  ).json();
  const response_6 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/slug` as const
    )
  ).json();
  const response_7 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/slug/other` as const
    )
  ).json();
  const response_7_1 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/slug/another` as const
    )
  ).json();
  const response_8 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/another` as const
    )
  ).json();
  const response_9_0 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/slug/another/` as const
    )
  ).json();
  const response_9_1 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/another/rest` as const
    )
  ).json();
  const response_9_2 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/another/rest/foo` as const
    )
  ).json();
  const response_9_3 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/another/foo` as const
    )
  ).json();
  const response_10 = await (
    await fetch(
      `/api/Campaign/${params.campaign}/wiki/page/optional/other` as const
    )
  ).json();
  const response_11 = await (
    await fetch("/api/Campaign/ciao/wiki", { method: "GET" })
  ).json();
  type A = ExtractIdFromMatched<MatchedPaths<"/api/Campaign/ciao/wiki/kjsfb">>;
  type A = ValidMethod<"/api/Campaign/ciao/wiki/akdvb">;

  return {};
}) satisfies PageLoad;
