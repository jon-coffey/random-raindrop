export type RaindropCollection = {
  _id: number;
  title: string;
  count?: number;
  cover?: string[];
};

export type RaindropItem = {
  _id: number;
  title?: string;
  link: string;
  excerpt?: string;
  note?: string;
  cover?: string;
  created?: string;
  lastUpdate?: string;
};

const API_BASE = "https://api.raindrop.io/rest/v1";

export function getAuthHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function raindropFetch<T>(
  path: string,
  token: string,
  init?: RequestInit
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers ?? {}),
      ...getAuthHeader(token),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Raindrop API error ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`
    );
  }

  return (await res.json()) as T;
}
