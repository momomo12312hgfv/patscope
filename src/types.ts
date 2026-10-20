export const SEVERITIES = ["low", "medium", "high", "critical"] as const;

export type Severity = (typeof SEVERITIES)[number];

export type TokenType =
  | "classic-pat"
  | "fine-grained-pat"
  | "oauth"
  | "github-app-user"
  | "github-app-server"
  | "github-app-refresh"
  | "unknown";

export type PermissionAccess = "read" | "write";

export interface PermissionGrant {
  permission: string;
  access: PermissionAccess;
}

export interface PermissionDefinition {
  name: string;
  title: string;
  description: string;
  category: string;
  access: PermissionAccess[];
  readCapabilities: string[];
  writeCapabilities: string[];
}

export interface ScopeDefinition {
  name: string;
  description: string;
  severity: Severity;
  category: string;
  capabilities: string[];
}

export interface CapabilityDefinition {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  scopes: string[];
  permissions: string[];
}

export interface Capability {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  category: string;
  matchedScopes: string[];
}

export interface ScoreBreakdownItem {
  capability: string;
  title: string;
  severity: Severity;
  weight: number;
}

export interface ScoreResult {
  value: number;
  rawValue: number;
  level: Severity;
  highestSeverity: Severity | null;
  floorApplied: boolean;
  breakdown: ScoreBreakdownItem[];
}

export interface TokenInfo {
  type: TokenType;
  typeLabel: string;
  redacted: string;
  scopes: string[];
  permissions: PermissionGrant[];
  source: string;
}

export interface RepositoryInfo {
  fullName: string;
  private: boolean | null;
  accessible: boolean;
  status: number | null;
  error: string | null;
}

export interface Identity {
  login: string;
  name: string | null;
  twoFactor: boolean | null;
  publicRepos: number | null;
  privateRepos: number | null;
  plan: string | null;
}

export interface Org {
  login: string;
  role: string | null;
}

export interface RateLimitInfo {
  limit: number | null;
  remaining: number | null;
  reset: string | null;
}

export interface Report {
  schemaVersion: 2;
  generatedAt: string;
  identity: Identity | null;
  token: TokenInfo;
  orgs: Org[];
  repositories: RepositoryInfo[];
  capabilities: Capability[];
  score: ScoreResult;
  scoreKnown: boolean;
  warnings: string[];
  rateLimit: RateLimitInfo | null;
}

export interface ScanOptions {
  token?: string;
  tokenType?: TokenType;
  scopes?: string[];
  permissions?: PermissionGrant[];
  repos?: string[];
  login?: string;
  source: string;
  offline: boolean;
}

export interface ReportOptions {
  color: boolean;
}
