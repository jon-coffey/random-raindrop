"use client";

import React from "react";

export default function Home() {
  return <RaindropDecider />;
}

type Collection = {
  _id: number;
  title: string;
  count?: number;
};

type Item = {
  _id: number;
  title?: string;
  link: string;
  excerpt?: string;
  note?: string;
  cover?: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function displayTitle(item: Item) {
  const title = (item.title ?? "").trim();
  if (title) return title;
  try {
    return new URL(item.link).hostname;
  } catch {
    return item.link;
  }
}

function RaindropDecider() {
  const [token, setToken] = React.useState<string>("");
  const [tokenInput, setTokenInput] = React.useState<string>("");
  const [collections, setCollections] = React.useState<Collection[]>([]);
  const [collectionId, setCollectionId] = React.useState<number | null>(null);
  const [current, setCurrent] = React.useState<Item | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const saved = window.localStorage.getItem("raindrop_token") ?? "";
    if (saved) {
      setToken(saved);
    }
  }, []);

  const authHeaders = React.useMemo<HeadersInit | undefined>(() => {
    if (!token) return undefined;
    return { Authorization: `Bearer ${token}` };
  }, [token]);

  const selectedCollection = React.useMemo(() => {
    if (collectionId === null) return null;
    const fromList = collections.find((c) => c._id === collectionId);
    if (fromList) return fromList;
    if (collectionId === -1) return { _id: -1, title: "Unsorted" };
    return { _id: collectionId, title: `Collection ${collectionId}` };
  }, [collectionId, collections]);

  async function loadCollections(nextToken: string) {
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch("/api/collections", {
        headers: { Authorization: `Bearer ${nextToken}` },
      });
      const data = (await res.json()) as
        | { collections: Collection[] }
        | { error: string };
      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Failed to load");
      }
      const list = Array.isArray(data.collections) ? data.collections : [];
      list.sort((a, b) => a.title.localeCompare(b.title));
      setCollections(list);
    } catch (e) {
      setCollections([]);
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function drawNext(nextCollectionId?: number) {
    const cid = nextCollectionId ?? collectionId;
    if (cid === null) return;
    if (!authHeaders) return;
    setError(null);
    setIsLoading(true);
    try {
      const count = collections.find((c) => c._id === cid)?.count;
      const url = new URL("/api/random", window.location.origin);
      url.searchParams.set("collectionId", String(cid));
      if (typeof count === "number" && Number.isFinite(count) && count > 0) {
        url.searchParams.set("count", String(count));
      }
      const res = await fetch(url.toString(), { headers: authHeaders });
      const data = (await res.json()) as { item: Item | null } | { error: string };
      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Failed to draw");
      }
      setCurrent(data.item);
    } catch (e) {
      setCurrent(null);
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteCurrent() {
    if (!current) return;
    if (!authHeaders) return;
    setError(null);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/raindrop/${current._id}`, {
        method: "DELETE",
        headers: authHeaders,
      });
      const data = (await res.json()) as { result: boolean } | { error: string };
      if (!res.ok || "error" in data) {
        throw new Error("error" in data ? data.error : "Failed to delete");
      }
      await drawNext();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  function connect() {
    const next = tokenInput.trim();
    if (!next) return;
    window.localStorage.setItem("raindrop_token", next);
    setToken(next);
    setTokenInput("");
    setCollectionId(null);
    setCurrent(null);
    loadCollections(next);
  }

  function disconnect() {
    window.localStorage.removeItem("raindrop_token");
    setToken("");
    setCollections([]);
    setCollectionId(null);
    setCurrent(null);
    setError(null);
  }

  React.useEffect(() => {
    if (token) loadCollections(token);
  }, [token]);

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-10">
        <header className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-lg font-semibold tracking-tight">Raindrop Random</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Pick one bookmark. Decide. Move on.
            </p>
          </div>
          <button
            type="button"
            onClick={disconnect}
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-medium",
              token
                ? "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                : "pointer-events-none opacity-0"
            )}
          >
            Disconnect
          </button>
        </header>

        {!token ? (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <div className="text-sm font-medium">Raindrop API token</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  Your token is stored only in this browser.
                </div>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste token"
                  className="h-11 flex-1 rounded-xl border border-zinc-200 bg-transparent px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
                  spellCheck={false}
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <button
                  type="button"
                  onClick={connect}
                  className="h-11 rounded-xl bg-zinc-900 px-4 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                >
                  Connect
                </button>
              </div>
            </div>
          </section>
        ) : (
          <section className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm font-medium">Collection</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCollectionId(-1);
                      setCurrent(null);
                      void drawNext(-1);
                    }}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
                  >
                    Unsorted
                  </button>
                  <select
                    value={collectionId ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      const id = v ? Number.parseInt(v, 10) : null;
                      setCollectionId(Number.isFinite(id as number) ? (id as number) : null);
                      setCurrent(null);
                      if (typeof id === "number" && Number.isFinite(id)) {
                        void drawNext(id);
                      }
                    }}
                    className="h-10 rounded-lg border border-zinc-200 bg-transparent px-2 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800 dark:focus:border-zinc-600"
                  >
                    <option value="">Choose…</option>
                    {collections.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {selectedCollection ? selectedCollection.title : "No collection selected"}
                </div>
                <button
                  type="button"
                  onClick={() => void drawNext()}
                  disabled={collectionId === null || isLoading}
                  className={cn(
                    "h-10 rounded-xl px-4 text-sm font-medium",
                    collectionId === null || isLoading
                      ? "cursor-not-allowed bg-zinc-200 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
                      : "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-black dark:hover:bg-zinc-200"
                  )}
                >
                  New random
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-black">
                {current ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <div className="text-base font-semibold leading-snug">
                        {displayTitle(current)}
                      </div>
                      <a
                        href={current.link}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm text-zinc-600 hover:underline dark:text-zinc-400"
                      >
                        {current.link}
                      </a>
                    </div>

                    {(current.excerpt || current.note) && (
                      <div className="text-sm text-zinc-700 dark:text-zinc-300">
                        {(current.note ?? current.excerpt) as string}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        onClick={() => void drawNext()}
                        disabled={isLoading}
                        className={cn(
                          "h-11 flex-1 rounded-xl border border-zinc-200 bg-white text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:bg-zinc-900",
                          isLoading && "cursor-not-allowed opacity-60"
                        )}
                      >
                        Keep
                      </button>
                      <button
                        type="button"
                        onClick={() => void deleteCurrent()}
                        disabled={isLoading}
                        className={cn(
                          "h-11 flex-1 rounded-xl bg-red-600 text-sm font-medium text-white hover:bg-red-500",
                          isLoading && "cursor-not-allowed opacity-60"
                        )}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {collectionId === null
                      ? "Select a collection to start."
                      : "No bookmark found in this collection."}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {isLoading && (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">Loading…</div>
        )}
      </div>
    </div>
  );
}
