import type { PermissionAccess, PermissionDefinition, PermissionGrant } from "./types";

function definePermission(
  name: string,
  title: string,
  description: string,
  category: string,
  access: PermissionAccess[],
  readCapabilities: string[],
  writeCapabilities: string[],
): PermissionDefinition {
  return { name, title, description, category, access, readCapabilities, writeCapabilities };
}

/**
 * Fine-grained personal access token permissions.
 *
 * GitHub does not expose a token's fine-grained permissions through the API, so
 * these grants are self-reported by the user. Names are namespaced to avoid
 * collisions between repository, organization and user permissions.
 */
export const PERMISSION_DEFINITIONS: Record<string, PermissionDefinition> = {
  "repo.contents": definePermission(
    "repo.contents",
    "Contents",
    "Repository contents, commits, branches, tags and releases.",
    "repository",
    ["read", "write"],
    ["code:read"],
    ["code:read", "code:write"],
  ),
  "repo.workflows": definePermission(
    "repo.workflows",
    "Workflows",
    "GitHub Actions workflow files.",
    "repository",
    ["read", "write"],
    [],
    ["workflow:write"],
  ),
  "repo.actions": definePermission(
    "repo.actions",
    "Actions",
    "Actions runs, artifacts and caches.",
    "repository",
    ["read", "write"],
    [],
    ["actions:manage"],
  ),
  "repo.administration": definePermission(
    "repo.administration",
    "Administration",
    "Repository settings, collaborators, deploy keys and branch protection.",
    "repository",
    ["read", "write"],
    [],
    ["repo:admin"],
  ),
  "repo.secrets": definePermission(
    "repo.secrets",
    "Secrets",
    "Repository Actions secrets.",
    "repository",
    ["read", "write"],
    [],
    ["secrets:manage"],
  ),
  "repo.environments": definePermission(
    "repo.environments",
    "Environments",
    "Deployment environments and their protection rules.",
    "repository",
    ["read", "write"],
    [],
    ["repo:admin"],
  ),
  "repo.packages": definePermission(
    "repo.packages",
    "Packages",
    "GitHub Packages published from the repository.",
    "repository",
    ["read", "write"],
    ["packages:read"],
    ["packages:write"],
  ),
  "repo.pages": definePermission(
    "repo.pages",
    "Pages",
    "GitHub Pages sites.",
    "repository",
    ["read", "write"],
    [],
    ["pages:write"],
  ),
  "repo.pull_requests": definePermission(
    "repo.pull_requests",
    "Pull requests",
    "Pull requests, reviews and merges.",
    "repository",
    ["read", "write"],
    ["code:read"],
    ["code:write"],
  ),
  "repo.issues": definePermission(
    "repo.issues",
    "Issues",
    "Issues and issue comments.",
    "repository",
    ["read", "write"],
    ["code:read"],
    ["issues:write"],
  ),
  "repo.checks": definePermission(
    "repo.checks",
    "Checks",
    "Check runs and check suites.",
    "repository",
    ["read", "write"],
    [],
    ["checks:write"],
  ),
  "repo.statuses": definePermission(
    "repo.statuses",
    "Commit statuses",
    "Commit statuses.",
    "repository",
    ["read", "write"],
    [],
    ["status:write"],
  ),
  "repo.deployments": definePermission(
    "repo.deployments",
    "Deployments",
    "Deployments and deployment statuses.",
    "repository",
    ["read", "write"],
    [],
    ["deployments:write"],
  ),
  "repo.discussions": definePermission(
    "repo.discussions",
    "Discussions",
    "Repository discussions.",
    "repository",
    ["read", "write"],
    [],
    ["discussions:write"],
  ),
  "repo.repository_hooks": definePermission(
    "repo.repository_hooks",
    "Webhooks",
    "Repository webhooks.",
    "repository",
    ["read", "write"],
    ["webhooks:read"],
    ["webhooks:write"],
  ),
  "repo.security_events": definePermission(
    "repo.security_events",
    "Security events",
    "Security events and code scanning data.",
    "repository",
    ["read", "write"],
    ["security:read"],
    ["security:write"],
  ),
  "repo.secret_scanning_alerts": definePermission(
    "repo.secret_scanning_alerts",
    "Secret scanning alerts",
    "Secret scanning alerts.",
    "repository",
    ["read", "write"],
    ["security:read"],
    ["security:write"],
  ),
  "repo.dependabot_alerts": definePermission(
    "repo.dependabot_alerts",
    "Dependabot alerts",
    "Dependabot alerts.",
    "repository",
    ["read", "write"],
    ["security:read"],
    ["security:write"],
  ),
  "repo.code_scanning_alerts": definePermission(
    "repo.code_scanning_alerts",
    "Code scanning alerts",
    "Code scanning alerts.",
    "repository",
    ["read", "write"],
    ["security:read"],
    ["security:write"],
  ),
  "repo.repository_advisories": definePermission(
    "repo.repository_advisories",
    "Repository advisories",
    "Security advisories.",
    "repository",
    ["read", "write"],
    ["security:read"],
    ["security:write"],
  ),
  "repo.attestations": definePermission(
    "repo.attestations",
    "Attestations",
    "Artifact attestations used for supply-chain verification.",
    "repository",
    ["read", "write"],
    [],
    ["attestations:write"],
  ),
  "repo.variables": definePermission(
    "repo.variables",
    "Variables",
    "Repository Actions variables.",
    "repository",
    ["read", "write"],
    [],
    ["variables:manage"],
  ),
  "repo.custom_properties": definePermission(
    "repo.custom_properties",
    "Custom properties",
    "Repository custom property values.",
    "repository",
    ["read", "write"],
    [],
    ["repo:admin"],
  ),
  "repo.merge_queues": definePermission(
    "repo.merge_queues",
    "Merge queues",
    "Merge queue configuration.",
    "repository",
    ["read", "write"],
    [],
    ["repo:admin"],
  ),
  "repo.codespaces": definePermission(
    "repo.codespaces",
    "Codespaces",
    "Codespaces for the repository.",
    "repository",
    ["read", "write"],
    [],
    ["codespaces:write"],
  ),
  "repo.metadata": definePermission(
    "repo.metadata",
    "Metadata",
    "Mandatory read-only repository metadata.",
    "repository",
    ["read"],
    [],
    [],
  ),
  "org.administration": definePermission(
    "org.administration",
    "Organization administration",
    "Organization settings, members, teams and custom roles.",
    "organization",
    ["read", "write"],
    ["org:read"],
    ["org:admin"],
  ),
  "org.members": definePermission(
    "org.members",
    "Members",
    "Organization members and membership.",
    "organization",
    ["read", "write"],
    ["org:read"],
    ["org:write"],
  ),
  "org.organization_secrets": definePermission(
    "org.organization_secrets",
    "Organization secrets",
    "Organization-wide Actions secrets.",
    "organization",
    ["read", "write"],
    [],
    ["secrets:manage"],
  ),
  "org.organization_variables": definePermission(
    "org.organization_variables",
    "Organization variables",
    "Organization-wide Actions variables.",
    "organization",
    ["read", "write"],
    [],
    ["variables:manage"],
  ),
  "org.organization_self_hosted_runners": definePermission(
    "org.organization_self_hosted_runners",
    "Self-hosted runners",
    "Organization self-hosted runners.",
    "organization",
    ["read", "write"],
    [],
    ["runners:manage"],
  ),
  "org.organization_webhooks": definePermission(
    "org.organization_webhooks",
    "Organization webhooks",
    "Organization webhooks.",
    "organization",
    ["read", "write"],
    ["webhooks:read"],
    ["org_webhooks:write"],
  ),
  "org.organization_projects": definePermission(
    "org.organization_projects",
    "Organization projects",
    "Organization projects.",
    "organization",
    ["read", "write"],
    ["projects:read"],
    ["projects:write"],
  ),
  "org.organization_packages": definePermission(
    "org.organization_packages",
    "Organization packages",
    "Organization packages.",
    "organization",
    ["read", "write"],
    ["packages:read"],
    ["packages:write"],
  ),
  "org.organization_copilot": definePermission(
    "org.organization_copilot",
    "Copilot",
    "Copilot seats and policies.",
    "organization",
    ["read", "write"],
    [],
    ["copilot:manage"],
  ),
  "org.organization_codespaces": definePermission(
    "org.organization_codespaces",
    "Organization Codespaces",
    "Organization Codespaces.",
    "organization",
    ["read", "write"],
    [],
    ["codespaces:write"],
  ),
  "org.organization_user_blocking": definePermission(
    "org.organization_user_blocking",
    "User blocking",
    "Block or unblock organization users.",
    "organization",
    ["read", "write"],
    [],
    ["org:write"],
  ),
  "org.organization_custom_roles": definePermission(
    "org.organization_custom_roles",
    "Custom organization roles",
    "Custom organization roles.",
    "organization",
    ["read", "write"],
    [],
    ["org:admin"],
  ),
  "org.organization_custom_repository_roles": definePermission(
    "org.organization_custom_repository_roles",
    "Custom repository roles",
    "Custom repository roles.",
    "organization",
    ["read", "write"],
    [],
    ["org:admin"],
  ),
  "org.organization_plan": definePermission(
    "org.organization_plan",
    "Plan",
    "Organization plan information.",
    "organization",
    ["read"],
    ["enterprise:read"],
    [],
  ),
  "org.organization_events": definePermission(
    "org.organization_events",
    "Events",
    "Organization audit events.",
    "organization",
    ["read"],
    ["audit:read"],
    [],
  ),
  "org.organization_dependabot_secrets": definePermission(
    "org.organization_dependabot_secrets",
    "Dependabot secrets",
    "Organization Dependabot secrets.",
    "organization",
    ["read", "write"],
    [],
    ["secrets:manage"],
  ),
  "org.organization_codespaces_secrets": definePermission(
    "org.organization_codespaces_secrets",
    "Codespaces secrets",
    "Organization Codespaces secrets.",
    "organization",
    ["read", "write"],
    [],
    ["secrets:manage"],
  ),
  "org.organization_codespaces_settings": definePermission(
    "org.organization_codespaces_settings",
    "Codespaces settings",
    "Organization Codespaces settings.",
    "organization",
    ["read", "write"],
    [],
    ["codespaces:write"],
  ),
  "org.personal_access_tokens": definePermission(
    "org.personal_access_tokens",
    "Personal access tokens",
    "Fine-grained personal access tokens for the organization.",
    "organization",
    ["read", "write"],
    [],
    ["tokens:manage"],
  ),
  "user.gists": definePermission(
    "user.gists",
    "Gists",
    "Gists owned by the user.",
    "user",
    ["read", "write"],
    [],
    ["gists:write"],
  ),
  "user.git_ssh_keys": definePermission(
    "user.git_ssh_keys",
    "Git SSH keys",
    "SSH keys used for Git access.",
    "user",
    ["read", "write"],
    ["keys:read"],
    ["keys:write"],
  ),
  "user.gpg_keys": definePermission(
    "user.gpg_keys",
    "GPG keys",
    "GPG keys used for commit signing.",
    "user",
    ["read", "write"],
    ["keys:read"],
    ["keys:write"],
  ),
  "user.ssh_signing_keys": definePermission(
    "user.ssh_signing_keys",
    "SSH signing keys",
    "SSH keys used for commit signing.",
    "user",
    ["read", "write"],
    ["keys:read"],
    ["keys:write"],
  ),
  "user.emails": definePermission(
    "user.emails",
    "Email addresses",
    "Email addresses associated with the account.",
    "user",
    ["read"],
    ["email:read"],
    [],
  ),
  "user.followers": definePermission(
    "user.followers",
    "Followers",
    "Follow and unfollow users.",
    "user",
    ["read", "write"],
    [],
    ["follow:write"],
  ),
  "user.notifications": definePermission(
    "user.notifications",
    "Notifications",
    "Notification settings and threads.",
    "user",
    ["read", "write"],
    [],
    ["notifications:write"],
  ),
  "user.codespaces": definePermission(
    "user.codespaces",
    "User Codespaces",
    "Codespaces owned by the user.",
    "user",
    ["read", "write"],
    [],
    ["codespaces:write"],
  ),
};

export function permissionNames(): string[] {
  return Object.keys(PERMISSION_DEFINITIONS).sort();
}

export function getPermission(name: string): PermissionDefinition | null {
  return PERMISSION_DEFINITIONS[name] ?? null;
}

export function resolvePermissionName(input: string): string | null {
  const name = input.trim().toLowerCase();
  if (!name) return null;
  if (PERMISSION_DEFINITIONS[name]) return name;

  const matches = Object.keys(PERMISSION_DEFINITIONS).filter(
    (canonical) => canonical.split(".").at(-1) === name,
  );
  return matches.length === 1 ? (matches[0] ?? null) : null;
}

export interface PermissionParseResult {
  grants: PermissionGrant[];
  errors: string[];
}

export function parsePermissionInput(raw: string): PermissionParseResult {
  const grants: PermissionGrant[] = [];
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const item of raw.split(/[\s,]+/).filter(Boolean)) {
    const match = /^([^=:]+)[=:](read|write)$/i.exec(item);
    if (!match) {
      errors.push(`Invalid permission "${item}". Expected permission=read|write.`);
      continue;
    }

    const inputName = match[1] ?? "";
    const access = (match[2] ?? "").toLowerCase() as PermissionAccess;
    const canonical = resolvePermissionName(inputName);
    if (!canonical) {
      errors.push(`Unknown or ambiguous permission "${inputName}". Use the full name, for example repo.contents.`);
      continue;
    }

    const definition = PERMISSION_DEFINITIONS[canonical];
    if (!definition) {
      errors.push(`Unknown permission "${canonical}".`);
      continue;
    }
    if (!definition.access.includes(access)) {
      errors.push(
        `Permission "${canonical}" does not support "${access}". Supported: ${definition.access.join(", ")}.`,
      );
      continue;
    }

    const key = `${canonical}=${access}`;
    if (seen.has(key)) continue;
    seen.add(key);
    grants.push({ permission: canonical, access });
  }

  return { grants, errors };
}

export function permissionGrantLabel(grant: PermissionGrant): string {
  return `${grant.permission}=${grant.access}`;
}
