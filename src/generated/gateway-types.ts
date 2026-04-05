export type GetHealth200 = {
  status: string;
  core: string;
  providers?: string[];
  backends?: string[];
  cache_available?: boolean;
};

export type GetModels200 = {
  models: string[];
};

export type GetModelsCatalog200Domains = Record<string, string>;

export type GetModelsCatalog200ModelsItem = {
  id: string;
  name: string;
  provider: string;
  domain: string;
  description: string;
  size: string;
  location: string;
  context_window?: string;
};

export type GetModelsCatalog200 = {
  models: GetModelsCatalog200ModelsItem[];
  domains: GetModelsCatalog200Domains;
};

export type SemanticSearchResultMetadata = {
  file_path?: string;
  filename?: string;
  source?: string;
  user?: string;
  mime_type?: string;
  collection?: string;
  summary?: string;
  themes?: string[];
  [key: string]: unknown;
};

export type GetApiSearch200ResultsItem = {
  content: string;
  document_id: string;
  chunk_index: number;
  metadata?: SemanticSearchResultMetadata;
  score: number;
  dense_score: number;
  sparse_score: number;
};

export type GetApiSearch200 = {
  query: string;
  mode: string;
  collections: string[];
  results: GetApiSearch200ResultsItem[];
};

export type GetApiProviders200 = {
  providers: string[];
};

export type GetApiVersion200 = {
  service: string;
  version: string;
};

export type GetStats200 = {
  chat_service: {
    requests: number;
    cache_hits: number;
    cache_stats: {
      l1: {
        hits: number;
        misses: number;
        size: number;
        max_size: number;
      };
      l2: {
        hits: number;
        misses: number;
        available: boolean;
      };
    };
    rag_stats?: {
      documents?: number;
      chunks?: number;
      vectors: number;
      retrieval_mode?: string;
    } | null;
  };
  router: {
    status: Record<string, boolean>;
  };
};

export type GetStatsTimeseries200SeriesItem = {
  time: string;
  timestamp: number;
  p50: number;
  p99: number;
  calls: number;
  errors: number;
};

export type GetStatsTimeseries200Summary = {
  total_calls: number;
  total_errors: number;
  p50_ms: number;
  p99_ms: number;
  error_rate: number;
};

export type GetStatsTimeseries200 = {
  series: GetStatsTimeseries200SeriesItem[];
  summary: GetStatsTimeseries200Summary;
};

export type GetLogsRecent200LogsItem = {
  timestamp: string;
  level: string;
  message: string;
  source: string;
};

export type GetLogsRecent200 = {
  logs: GetLogsRecent200LogsItem[];
  total: number;
};

export type GetRagStats200 = {
  documents: number;
  chunks: number;
  vectors: number;
};

export type GetRagSearch200ResultsItem = GetApiSearch200ResultsItem;

export type GetRagSearch200 = {
  query: string;
  mode: string;
  collections: string[];
  results: GetRagSearch200ResultsItem[];
};

export type GetRagDocuments200DocumentsItem = {
  id: string;
  name: string;
  chunks: number;
  metadata?: Record<string, unknown>;
};

export type GetRagDocuments200 = {
  documents: GetRagDocuments200DocumentsItem[];
};

export type PostRagDocuments200 = {
  id: string;
  name: string;
  chunks: number;
  metadata?: Record<string, unknown>;
};

export type DeleteRagDocumentsId200 = {
  deleted: boolean;
  id: string;
};

export type GetConversations200ConversationsItem = {
  id: string;
  title: string;
  created_at: string;
  provider: string;
  message_count: number;
};

export type GetConversations200 = {
  conversations: GetConversations200ConversationsItem[];
};

export type ConversationMessage = {
  role: string;
  content: string;
};

export type GetConversationsConvId200 = {
  id: string;
  title: string;
  provider: string;
  messages: ConversationMessage[];
  created_at: string;
};

export type PostConversations200 = GetConversationsConvId200;

export type PostConversationsConvIdMessages200 = {
  status: string;
  message_count?: number;
};

export type DeleteConversationsConvId200 = {
  status: string;
};

export type GetTracesRecent200DataItem = {
  traceID?: string;
  operationName?: string;
  operation?: string;
  startTime?: number;
  duration?: number;
  serviceName?: string;
  status?: string;
  statusCode?: string | number;
  spans?: Array<Record<string, unknown>>;
  processes?: Record<string, { serviceName?: string } & Record<string, unknown>>;
  [key: string]: unknown;
};

export type GetTracesRecent200 = {
  data: GetTracesRecent200DataItem[];
  total?: number;
  limit?: number;
  offset?: number;
  error?: string;
};

export type GetTracesServices200 = {
  data: string[];
  error?: string;
};

export type GetInfraContainers200ContainersItem = {
  name: string;
  image: string;
  status: string;
  health: string;
  cpu_percent: number;
  memory_mb: number;
  memory_limit_mb: number;
  uptime_hours: number;
  error?: string;
};

export type GetInfraContainers200 = {
  containers: GetInfraContainers200ContainersItem[];
};

export type GetInfraStorage200Redis = {
  status?: string;
  used_memory_human?: string;
  connected_clients?: number;
  keys?: number;
  collections?: number;
  collection_names?: string[];
  code?: number;
  error?: string;
  [key: string]: unknown;
};

export type GetInfraStorage200Qdrant = GetInfraStorage200Redis;

export type GetInfraStorage200 = {
  redis: GetInfraStorage200Redis;
  qdrant: GetInfraStorage200Qdrant;
};

export type InfraNetworkCheck = {
  status: string;
  models?: number | string[];
  url?: string;
  error?: string;
  [key: string]: unknown;
};

export type GetInfraNetwork200OllamaLocal = InfraNetworkCheck;
export type GetInfraNetwork200OllamaGpu = InfraNetworkCheck;
export type GetInfraNetwork200VllmGpu = InfraNetworkCheck;
export type GetInfraNetwork200Jaeger = InfraNetworkCheck;

export type GetInfraNetwork200 = {
  ollama_local?: GetInfraNetwork200OllamaLocal;
  ollama_gpu?: GetInfraNetwork200OllamaGpu;
  vllm_gpu?: GetInfraNetwork200VllmGpu;
  jaeger?: GetInfraNetwork200Jaeger;
  [key: string]: unknown;
};

export type GetInfraMachines200MachinesItem = {
  name: string;
  ip: string;
  cpu_percent: number;
  ram_used_gb: number;
  ram_total_gb: number;
  disk_used_gb: number;
  disk_total_gb: number;
  uptime_hours: number;
  error?: string;
};

export type GetInfraMachines200 = {
  machines: GetInfraMachines200MachinesItem[];
};

export type GetInfraGpu200 = {
  model: string;
  vram_used_gb: number;
  vram_total_gb: number;
  requests_active: number;
  tokens_per_sec: number;
  kv_cache_usage_percent: number;
  error?: string;
};

export type GetInfraActivepieces200FlowsItem = {
  id: string;
  name: string;
  status: string;
  trigger: string;
  last_run_at: string;
  last_run_status: string;
};

export type GetInfraActivepieces200 = {
  flows: GetInfraActivepieces200FlowsItem[];
  error?: string;
};

export type AuditCheckDetail = {
  check: string;
  severity: "error" | "warning" | "info";
  message: string;
  auto_fixable?: boolean;
};

export type AuditValidationResult = {
  filepath?: string;
  file?: string;
  status: "pass" | "warn" | "fail";
  errors?: number;
  warnings?: number;
  score?: number;
  last_modified?: string;
  details?: AuditCheckDetail[];
};

export type GetApiAuditStatus200 =
  | {
      status: "no_report";
      message: string;
    }
  | {
      last_run: string;
      total_audits: number;
      pass?: number;
      warn?: number;
      fail?: number;
      avg_score?: number;
      ai_score_avg?: number;
    };

export type GetApiAuditReport200 =
  | {
      status: "no_report";
      results: AuditValidationResult[];
    }
  | {
      timestamp?: string;
      total_files?: number;
      summary?: {
        pass?: number;
        warn?: number;
        fail?: number;
      };
      results: AuditValidationResult[];
      cross_analysis?: {
        contradictions: string[];
        untracked_debts: string[];
        coverage_gaps: string[];
      };
    };
