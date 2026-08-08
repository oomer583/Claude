import "server-only";

import { onyxRequest } from "./client";

export type OnyxWebSearchResult = {
  document_citation_number: number;
  snippet: string;
  title: string;
  unique_identifier_to_strip_away: string;
  url: string;
};

export type OnyxOpenUrlResult = {
  content: string;
  document_citation_number: number;
  unique_identifier_to_strip_away: string;
};

export type OnyxWebSearchResponse = {
  content_provider_type: string | null;
  full_content_results: OnyxOpenUrlResult[];
  search_provider_type: string;
  search_results: OnyxWebSearchResult[];
};

export function searchOnyxWeb({
  bearerToken,
  maxResults = 5,
  queries,
}: {
  bearerToken: string;
  maxResults?: number;
  queries: string[];
}) {
  return onyxRequest<OnyxWebSearchResponse>({
    bearerToken,
    init: {
      body: JSON.stringify({
        max_results: maxResults,
        queries,
      }),
      method: "POST",
    },
    path: "/web-search/search",
    timeoutMs: 45_000,
  });
}
