import { MetricCard } from "../../components/ui/MetricCard";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export function InfraStorage() {
  const ragStats = useQuery({ queryKey: ["rag-stats"], queryFn: api.rag.stats, refetchInterval: 30_000 });
  const storage = useQuery({ queryKey: ["infra-storage"], queryFn: api.infra.storage, refetchInterval: 30_000 });

  const redisStatus = storage.data?.redis
    ? String((storage.data.redis as Record<string, unknown>).status ?? "Active")
    : "Active";
  const qdrantVectors = ragStats.data?.vectors ?? 0;
  const redisSubtitle = storage.data?.redis
    ? String((storage.data.redis as Record<string, unknown>).used_memory_human ?? "Cache multi-tier")
    : "Cache multi-tier";

  return (
    <div className="grid grid-cols-3 gap-3 p-4">
      <MetricCard label="Redis" value={redisStatus} subtitle={redisSubtitle} color="text-accent-green" />
      <MetricCard label="Qdrant Vecteurs" value={qdrantVectors} subtitle="Collection life_chunks" color="text-accent-blue" />
      <MetricCard label="Forgejo Repos" value="6" subtitle="Miroirs GitHub" color="text-accent-amber" />
    </div>
  );
}
