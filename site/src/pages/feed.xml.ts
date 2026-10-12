import type { APIRoute } from "astro";
import { getWriting } from "../lib/content";
import { atomFeed } from "./_feeds";
export const GET: APIRoute = async () =>
  new Response(atomFeed(await getWriting()), {
    headers: { "Content-Type": "application/atom+xml; charset=utf-8" },
  });
