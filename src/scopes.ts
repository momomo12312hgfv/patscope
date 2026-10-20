import type { ScopeDefinition } from "./types";

function defineScope(
  name: string,
  description: string,
  severity: ScopeDefinition["severity"],
  category: string,
  capabilities: string[],
): ScopeDefinition {
  return { name, description, severity, category, capabilities };
}

/**
 * Classic GitHub OAuth scopes and the capabilities they grant.
 *
 * Source: https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps
 * Fine-grained PAT permissions are not exposed through the GitHub API and are
 * intentionally not modelled as scopes here.
 */
export const SCOPE_DEFINITIONS: Record<string, ScopeDefinition> = {
  repo: defineScope(
    "repo",
    "Full control of private repositories: code, issues, pull requests, releases, collaborators and settings.",
    "high",
    "repository",
    ["code:read", "code:write", "repo:admin", "secrets:manage"],
  ),
  "repo:status": defineScope(
    "repo:status",
    "Read and write commit statuses.",
    "low",
    "repository",
    ["status:write"],
  ),
  repo_deployment: defineScope(
    "repo_deployment",
    "Read and write deployment statuses.",
    "low",
    "repository",
    ["deployments:write"],
  ),
  public_repo: defineScope(
    "public_repo",
    "Read and write public repositories only.",
    "medium",
    "repository",
    ["public:write"],
  ),
  "repo:invite": defineScope(
    "repo:invite",
    "Accept or decline repository invitations.",
    "low",
    "repository",
    ["invitations:write"],
  ),
  security_events: defineScope(
    "security_events",
    "Read and write security events such as code scanning alerts.",
    "medium",
    "repository",
    ["security:read"],
  ),
  workflow: defineScope(
    "workflow",
    "Add or update GitHub Actions workflow files.",
    "high",
    "actions",
    ["workflow:write"],
  ),
  "write:packages": defineScope(
    "write:packages",
    "Upload and publish packages.",
    "high",
    "packages",
    ["packages:write"],
  ),
  "read:packages": defineScope(
    "read:packages",
    "Download packages.",
    "low",
    "packages",
    ["packages:read"],
  ),
  "delete:packages": defineScope(
    "delete:packages",
    "Delete packages.",
    "critical",
    "packages",
    ["packages:delete"],
  ),
  "admin:org": defineScope(
    "admin:org",
    "Full control of organizations and teams, including members and organization secrets.",
    "critical",
    "organization",
    ["org:admin", "org:read", "secrets:manage"],
  ),
  "write:org": defineScope(
    "write:org",
    "Read and write organization membership, projects and team membership.",
    "high",
    "organization",
    ["org:write"],
  ),
  "read:org": defineScope(
    "read:org",
    "Read organization membership and teams.",
    "low",
    "organization",
    ["org:read"],
  ),
  "manage_runners:org": defineScope(
    "manage_runners:org",
    "Manage organization-level self-hosted runners.",
    "high",
    "organization",
    ["runners:manage"],
  ),
  "admin:public_key": defineScope(
    "admin:public_key",
    "Full control of public SSH keys.",
    "high",
    "identity",
    ["keys:write"],
  ),
  "write:public_key": defineScope(
    "write:public_key",
    "Create and update public SSH keys.",
    "high",
    "identity",
    ["keys:write"],
  ),
  "read:public_key": defineScope(
    "read:public_key",
    "Read public SSH keys.",
    "low",
    "identity",
    ["keys:read"],
  ),
  "admin:repo_hook": defineScope(
    "admin:repo_hook",
    "Full control of repository webhooks.",
    "medium",
    "hooks",
    ["webhooks:write"],
  ),
  "write:repo_hook": defineScope(
    "write:repo_hook",
    "Create and update repository webhooks.",
    "medium",
    "hooks",
    ["webhooks:write"],
  ),
  "read:repo_hook": defineScope(
    "read:repo_hook",
    "Read repository webhooks.",
    "low",
    "hooks",
    ["webhooks:read"],
  ),
  "admin:org_hook": defineScope(
    "admin:org_hook",
    "Full control of organization webhooks.",
    "high",
    "hooks",
    ["org_webhooks:write"],
  ),
  gist: defineScope("gist", "Create and update gists.", "low", "account", ["gists:write"]),
  notifications: defineScope(
    "notifications",
    "Read and manage notifications.",
    "low",
    "account",
    ["notifications:write"],
  ),
  user: defineScope(
    "user",
    "Read and write profile data, including name, email and bio.",
    "medium",
    "account",
    ["profile:write"],
  ),
  "read:user": defineScope("read:user", "Read profile data.", "low", "account", ["profile:read"]),
  "user:email": defineScope(
    "user:email",
    "Read email addresses.",
    "low",
    "account",
    ["email:read"],
  ),
  "user:follow": defineScope(
    "user:follow",
    "Follow and unfollow users.",
    "low",
    "account",
    ["follow:write"],
  ),
  project: defineScope(
    "project",
    "Read and write projects.",
    "medium",
    "projects",
    ["projects:write"],
  ),
  "read:project": defineScope("read:project", "Read projects.", "low", "projects", ["projects:read"]),
  delete_repo: defineScope(
    "delete_repo",
    "Delete repositories.",
    "critical",
    "repository",
    ["repo:delete"],
  ),
  "write:discussion": defineScope(
    "write:discussion",
    "Read and write team discussions.",
    "medium",
    "organization",
    ["discussions:write"],
  ),
  "read:discussion": defineScope(
    "read:discussion",
    "Read team discussions.",
    "low",
    "organization",
    ["discussions:read"],
  ),
  "admin:enterprise": defineScope(
    "admin:enterprise",
    "Full control of enterprises, including policies, members and audit data.",
    "critical",
    "enterprise",
    ["enterprise:admin", "enterprise:read"],
  ),
  "manage_runners:enterprise": defineScope(
    "manage_runners:enterprise",
    "Manage enterprise-level self-hosted runners.",
    "high",
    "enterprise",
    ["runners:manage"],
  ),
  "manage_billing:enterprise": defineScope(
    "manage_billing:enterprise",
    "Read and write enterprise billing data.",
    "high",
    "enterprise",
    ["billing:manage"],
  ),
  "read:enterprise": defineScope(
    "read:enterprise",
    "Read enterprise data.",
    "medium",
    "enterprise",
    ["enterprise:read"],
  ),
  audit_log: defineScope(
    "audit_log",
    "Read the enterprise audit log.",
    "medium",
    "enterprise",
    ["audit:read"],
  ),
  codespace: defineScope(
    "codespace",
    "Create, read, update and delete Codespaces.",
    "medium",
    "codespaces",
    ["codespaces:write"],
  ),
  copilot: defineScope(
    "copilot",
    "Manage GitHub Copilot settings and seats.",
    "high",
    "copilot",
    ["copilot:manage"],
  ),
  "write:network_configurations": defineScope(
    "write:network_configurations",
    "Read and write network configurations.",
    "high",
    "enterprise",
    ["network:write"],
  ),
  "read:network_configurations": defineScope(
    "read:network_configurations",
    "Read network configurations.",
    "low",
    "enterprise",
    ["network:read"],
  ),
  "admin:gpg_key": defineScope(
    "admin:gpg_key",
    "Full control of GPG keys.",
    "high",
    "identity",
    ["keys:write"],
  ),
  "write:gpg_key": defineScope(
    "write:gpg_key",
    "Create and update GPG keys.",
    "high",
    "identity",
    ["keys:write"],
  ),
  "read:gpg_key": defineScope("read:gpg_key", "Read GPG keys.", "low", "identity", ["keys:read"]),
  "admin:ssh_signing_key": defineScope(
    "admin:ssh_signing_key",
    "Full control of SSH signing keys.",
    "high",
    "identity",
    ["keys:write"],
  ),
  "write:ssh_signing_key": defineScope(
    "write:ssh_signing_key",
    "Create and update SSH signing keys.",
    "high",
    "identity",
    ["keys:write"],
  ),
  "read:ssh_signing_key": defineScope(
    "read:ssh_signing_key",
    "Read SSH signing keys.",
    "low",
    "identity",
    ["keys:read"],
  ),
};

export function scopeNames(): string[] {
  return Object.keys(SCOPE_DEFINITIONS).sort();
}

export function getScope(name: string): ScopeDefinition | null {
  return SCOPE_DEFINITIONS[name] ?? null;
}

export function unknownScopes(scopes: string[]): string[] {
  return scopes.filter((scope) => !SCOPE_DEFINITIONS[scope]);
}
