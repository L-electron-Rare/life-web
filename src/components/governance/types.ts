import type {
  GetApiAuditReport200 as AuditReportResponse,
  GetApiAuditStatus200 as AuditStatusResponse,
} from "../../../../life-reborn/src/generated/api.client.ts";

export type { AuditReportResponse, AuditStatusResponse };

type AuditStatusNoReport = Extract<AuditStatusResponse, { status: "no_report" }>;
type AuditStatusReady = Exclude<AuditStatusResponse, AuditStatusNoReport>;
type AuditReportNoReport = Extract<AuditReportResponse, { status: "no_report" }>;
type AuditReportReady = Exclude<AuditReportResponse, AuditReportNoReport>;

export interface AuditStatus {
  last_run: string;
  total_audits: number;
  pass: number;
  warn: number;
  fail: number;
  avg_score?: number;
}

export interface CheckResult {
  check: string;
  severity: "error" | "warning" | "info";
  message: string;
  auto_fixable: boolean;
}

export interface ValidationResult {
  filepath: string;
  status: "pass" | "warn" | "fail";
  errors: number;
  warnings: number;
  score?: number;
  last_modified?: string;
  details: CheckResult[];
}

export interface CrossAnalysis {
  contradictions: string[];
  untracked_debts: string[];
  coverage_gaps: string[];
}

export interface AuditReport {
  timestamp: string;
  total_files: number;
  summary: { pass: number; warn: number; fail: number };
  results: ValidationResult[];
  cross_analysis?: CrossAnalysis;
}

function isAuditStatusNoReport(data: AuditStatusResponse): data is AuditStatusNoReport {
  return "status" in data && data.status === "no_report";
}

function isAuditReportNoReport(data: AuditReportResponse): data is AuditReportNoReport {
  return "status" in data && data.status === "no_report";
}

export function normalizeAuditStatus(data: AuditStatusResponse): AuditStatus {
  if (isAuditStatusNoReport(data)) {
    return {
      last_run: "unknown",
      total_audits: 0,
      pass: 0,
      warn: 0,
      fail: 0,
    };
  }

  const ready = data as AuditStatusReady;
  return {
    last_run: ready.last_run ?? "unknown",
    total_audits: ready.total_audits ?? 0,
    pass: ready.pass ?? 0,
    warn: ready.warn ?? 0,
    fail: ready.fail ?? 0,
    avg_score: ready.avg_score ?? ready.ai_score_avg,
  };
}

export function normalizeAuditReport(data: AuditReportResponse): AuditReport {
  if (isAuditReportNoReport(data)) {
    return {
      timestamp: "unknown",
      total_files: 0,
      summary: { pass: 0, warn: 0, fail: 0 },
      results: [],
    };
  }

  const ready = data as AuditReportReady;
  return {
    timestamp: ready.timestamp ?? "unknown",
    total_files: ready.total_files ?? 0,
    summary: {
      pass: ready.summary?.pass ?? 0,
      warn: ready.summary?.warn ?? 0,
      fail: ready.summary?.fail ?? 0,
    },
    results: (ready.results ?? []).map((result) => ({
      filepath: result.filepath ?? result.file ?? "unknown",
      status: result.status,
      errors: result.errors ?? 0,
      warnings: result.warnings ?? 0,
      score: result.score,
      last_modified: result.last_modified,
      details: (result.details ?? []).map((detail) => ({
        check: detail.check,
        severity: detail.severity,
        message: detail.message,
        auto_fixable: detail.auto_fixable ?? false,
      })),
    })),
    cross_analysis: ready.cross_analysis
      ? {
          contradictions: ready.cross_analysis.contradictions,
          untracked_debts: ready.cross_analysis.untracked_debts,
          coverage_gaps: ready.cross_analysis.coverage_gaps,
        }
      : undefined,
  };
}
