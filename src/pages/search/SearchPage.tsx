import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../lib/api";
import { GlassCard } from "../../components/ui/GlassCard";
import { Spinner } from "../../components/ui/Spinner";

// ── Types ────────────────────────────────────────────────────────────────────

type SearchResult = {
  content: string;
  document_id: string;
  chunk_index: number;
  metadata: {
    file_path?: string;
    filename?: string;
    source?: string;
    user?: string;
    mime_type?: string;
    collection?: string;
    summary?: string;
    themes?: string[];
  };
  score: number;
  dense_score: number;
  sparse_score: number;
};

type CollectionFilter = "all" | "nextcloud_docs" | "life_chunks";

// ── Helpers ──────────────────────────────────────────────────────────────────

function getFileEmoji(filename: string, mimeType?: string): string {
  const name = filename.toLowerCase();
  const mime = (mimeType ?? "").toLowerCase();
  if (mime.includes("pdf") || name.endsWith(".pdf")) return "📄";
  if (mime.includes("spreadsheet") || name.endsWith(".xlsx") || name.endsWith(".ods") || name.endsWith(".csv")) return "📊";
  if (mime.includes("presentation") || name.endsWith(".pptx") || name.endsWith(".odp")) return "📽️";
  if (
    name.endsWith(".md") || name.endsWith(".txt") || name.endsWith(".rst") ||
    mime.includes("text/plain") || mime.includes("text/markdown")
  ) return "📝";
  if (
    name.endsWith(".py") || name.endsWith(".ts") || name.endsWith(".tsx") ||
    name.endsWith(".js") || name.endsWith(".jsx") || name.endsWith(".json") ||
    name.endsWith(".yaml") || name.endsWith(".yml") || name.endsWith(".toml") ||
    mime.includes("text/x-") || mime.includes("application/json")
  ) return "💻";
  return "📎";
}

function getScoreClass(score: number): string {
  if (score >= 0.7) return "bg-accent-green/20 text-accent-green";
  if (score >= 0.5) return "bg-accent-amber/20 text-accent-amber";
  return "bg-surface-hover text-text-muted";
}

function getCollectionLabel(collection?: string): string {
  if (collection === "nextcloud_docs") return "Nextcloud";
  if (collection === "life_chunks") return "Projects";
  return collection ?? "Unknown";
}

function buildNextcloudLink(filePath?: string): string | null {
  if (!filePath) return null;
  const dir = filePath.includes("/") ? filePath.substring(0, filePath.lastIndexOf("/")) : "/";
  return `https://cloud.saillant.cc/apps/files/?dir=${encodeURIComponent("/" + dir)}`;
}

function highlightTerms(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;
  const pattern = new RegExp(`(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})`, "gi");
  const parts = text.split(pattern);
  return parts.map((part, i) =>
    pattern.test(part)
      ? <mark key={i} className="bg-accent-green/25 text-accent-green rounded px-0.5">{part}</mark>
      : part
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface SearchResultCardProps {
  result: SearchResult;
  query: string;
}

function SearchResultCard({ result, query }: SearchResultCardProps) {
  const filename = result.metadata.filename ?? result.document_id;
  const snippet = result.content.slice(0, 300);
  const ncLink = result.metadata.source === "nextcloud"
    ? buildNextcloudLink(result.metadata.file_path)
    : null;

  return (
    <GlassCard className="flex flex-col gap-2">
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="shrink-0 text-base leading-none">
            {getFileEmoji(filename, result.metadata.mime_type)}
          </span>
          <span className="truncate text-sm font-semibold text-text-primary">
            {filename}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${getScoreClass(result.score)}`}>
            {(result.score * 100).toFixed(0)}%
          </span>
          <span className="rounded border border-border-glass px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-text-muted">
            {getCollectionLabel(result.metadata.collection)}
          </span>
        </div>
      </div>

      {/* Content snippet */}
      <p className="text-sm leading-relaxed text-text-primary line-clamp-4">
        {highlightTerms(snippet, query)}
        {result.content.length > 300 && <span className="text-text-muted">…</span>}
      </p>

      {/* Metadata footer */}
      <div className="flex flex-wrap items-center gap-3 text-[10px] text-text-muted">
        {result.metadata.user && <span>user: {result.metadata.user}</span>}
        {result.metadata.mime_type && <span>{result.metadata.mime_type}</span>}
        <span>chunk #{result.chunk_index}</span>
        {ncLink && (
          <a
            href={ncLink}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-accent-blue hover:text-accent-blue/80 underline underline-offset-2"
          >
            Ouvrir dans Nextcloud →
          </a>
        )}
      </div>
    </GlassCard>
  );
}

interface SearchFiltersProps {
  collection: CollectionFilter;
  onCollectionChange: (v: CollectionFilter) => void;
  topK: number;
  onTopKChange: (v: number) => void;
}

function SearchFilters({ collection, onCollectionChange, topK, onTopKChange }: SearchFiltersProps) {
  const collectionOptions: { value: CollectionFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "nextcloud_docs", label: "Nextcloud Docs" },
    { value: "life_chunks", label: "Projects" },
  ];

  const selectClass =
    "rounded-lg border border-border-glass bg-surface-card px-3 py-1.5 text-sm text-text-primary focus:border-accent-green focus:outline-none cursor-pointer";

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs uppercase tracking-widest text-text-muted shrink-0">Filtres</span>
      <select
        value={collection}
        onChange={(e) => onCollectionChange(e.target.value as CollectionFilter)}
        className={selectClass}
      >
        {collectionOptions.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <select
        value={topK}
        onChange={(e) => onTopKChange(Number(e.target.value))}
        className={selectClass}
      >
        {[5, 10, 20].map((n) => (
          <option key={n} value={n}>{n} résultats</option>
        ))}
      </select>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SearchPage() {
  const [inputValue, setInputValue] = useState("");
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<CollectionFilter>("all");
  const [topK, setTopK] = useState(10);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useMutation({
    mutationFn: ({ q, col, k }: { q: string; col: CollectionFilter; k: number }) => {
      const collections = col === "all" ? undefined : [col];
      return api.search(q, collections, k);
    },
  });

  const runSearch = useCallback(
    (q: string, col: CollectionFilter, k: number) => {
      if (!q.trim()) return;
      search.mutate({ q: q.trim(), col, k });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Debounced search on input change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!inputValue.trim()) return;
    debounceRef.current = setTimeout(() => {
      setQuery(inputValue);
      runSearch(inputValue, collection, topK);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue]);

  // Re-search when filters change (only if there's a query)
  useEffect(() => {
    if (!query.trim()) return;
    runSearch(query, collection, topK);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collection, topK]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && inputValue.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setQuery(inputValue);
      runSearch(inputValue, collection, topK);
    }
  }

  function handleSearchButton() {
    if (!inputValue.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setQuery(inputValue);
    runSearch(inputValue, collection, topK);
  }

  const hasResults = search.isSuccess && search.data.results.length > 0;
  const noResults = search.isSuccess && search.data.results.length === 0;

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Search bar */}
      <div className="flex gap-2">
        <input
          type="search"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Recherche sémantique…"
          autoFocus
          className="flex-1 rounded-lg border border-border-glass bg-surface-card px-4 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-green focus:outline-none"
        />
        <button
          onClick={handleSearchButton}
          disabled={search.isPending || !inputValue.trim()}
          className="rounded-lg bg-accent-blue/20 px-4 py-2 text-sm text-accent-blue hover:bg-accent-blue/30 disabled:opacity-50"
        >
          Chercher
        </button>
      </div>

      {/* Filters */}
      <SearchFilters
        collection={collection}
        onCollectionChange={setCollection}
        topK={topK}
        onTopKChange={setTopK}
      />

      {/* Loading */}
      {search.isPending && (
        <div className="flex justify-center py-8">
          <Spinner text="Recherche en cours…" />
        </div>
      )}

      {/* Error */}
      {search.isError && (
        <GlassCard>
          <p className="text-sm text-accent-red">{String(search.error)}</p>
          <button
            onClick={handleSearchButton}
            className="mt-2 text-xs text-accent-blue hover:underline"
          >
            Réessayer
          </button>
        </GlassCard>
      )}

      {/* No results */}
      {noResults && (
        <div className="flex flex-col items-center gap-2 py-12">
          <p className="text-sm text-text-muted">
            Aucun résultat pour «{search.data.query}»
          </p>
        </div>
      )}

      {/* Results */}
      {hasResults && (
        <>
          <p className="text-xs text-text-muted">
            {search.data.results.length} résultat{search.data.results.length > 1 ? "s" : ""} pour «{search.data.query}»
          </p>
          <div className="flex flex-col gap-3">
            {search.data.results.map((result, i) => (
              <SearchResultCard key={`${result.document_id}-${result.chunk_index}-${i}`} result={result} query={query} />
            ))}
          </div>
        </>
      )}

      {/* Empty state */}
      {!search.isPending && !search.isError && !search.isSuccess && (
        <div className="flex flex-col items-center gap-3 py-16">
          <p className="text-sm text-text-muted">
            Recherchez parmi vos documents Nextcloud et fichiers de projet
          </p>
          <p className="text-xs text-text-dim">
            Nextcloud Docs · Projects · Recherche hybride dense + sparse
          </p>
        </div>
      )}
    </div>
  );
}
