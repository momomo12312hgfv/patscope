import { PERMISSION_DEFINITIONS, permissionGrantLabel } from "./permissions";
import { SCOPE_DEFINITIONS } from "./scopes";
import type { Capability, CapabilityDefinition, PermissionGrant, Severity } from "./types";

type CapabilityMeta = Omit<CapabilityDefinition, "scopes" | "permissions">;

const CAPABILITY_META: CapabilityMeta[] = [
  {
    id: "code:read",
    title: "Read repository contents",
    description: "Read source code, commits, branches, issues and pull requests in accessible repositories.",
    severity: "low",
    category: "repository",
  },
  {
    id: "code:write",
    title: "Write repository contents",
    description: "Push commits, rewrite branches, edit issues and pull requests, and publish releases.",
    severity: "high",
    category: "repository",
  },
  {
    id: "repo:admin",
    title: "Change repository settings",
    description: "Manage collaborators, deploy keys, branch protection, repository secrets and other settings.",
    severity: "high",
    category: "repository",
  },
  {
    id: "repo:delete",
    title: "Delete repositories",
    description: "Permanently delete repositories, including all code, issues and releases.",
    severity: "critical",
    category: "repository",
  },
  {
    id: "secrets:manage",
    title: "Manage CI/CD secrets",
    description: "Create, overwrite or remove repository and organization secrets used by workflows.",
    severity: "high",
    category: "actions",
  },
  {
    id: "workflow:write",
    title: "Modify GitHub Actions workflows",
    description: "Add or change workflow files, which can execute code and expose repository secrets.",
    severity: "high",
    category: "actions",
  },
  {
    id: "actions:manage",
    title: "Manage Actions runs",
    description: "Cancel or rerun workflows, delete artifacts and caches, and disrupt or extract CI data.",
    severity: "high",
    category: "actions",
  },
  {
    id: "checks:write",
    title: "Write check results",
    description: "Create or update check runs, which can fake CI results and bypass required checks.",
    severity: "high",
    category: "actions",
  },
  {
    id: "variables:manage",
    title: "Manage Actions variables",
    description: "Change repository or organization variables used by workflows.",
    severity: "medium",
    category: "actions",
  },
  {
    id: "runners:manage",
    title: "Manage self-hosted runners",
    description: "Register or remove self-hosted runners, potentially redirecting CI jobs to attacker-controlled machines.",
    severity: "high",
    category: "actions",
  },
  {
    id: "org:admin",
    title: "Manage organization",
    description: "Add or remove members, change roles, manage teams, settings and organization secrets.",
    severity: "critical",
    category: "organization",
  },
  {
    id: "org:write",
    title: "Manage teams and projects",
    description: "Change organization membership, teams and projects.",
    severity: "high",
    category: "organization",
  },
  {
    id: "org:read",
    title: "Read organization membership",
    description: "Enumerate organization members, teams and roles.",
    severity: "low",
    category: "organization",
  },
  {
    id: "enterprise:admin",
    title: "Manage enterprise",
    description: "Change enterprise policies, members, organizations and security settings.",
    severity: "critical",
    category: "enterprise",
  },
  {
    id: "enterprise:read",
    title: "Read enterprise data",
    description: "Read enterprise policies, organizations and member information.",
    severity: "medium",
    category: "enterprise",
  },
  {
    id: "billing:manage",
    title: "Manage billing",
    description: "Read and change billing settings and spending limits.",
    severity: "high",
    category: "enterprise",
  },
  {
    id: "audit:read",
    title: "Read audit log",
    description: "Read enterprise audit events, which may contain sensitive operational data.",
    severity: "medium",
    category: "enterprise",
  },
  {
    id: "network:write",
    title: "Manage network configurations",
    description: "Change enterprise network configurations and private networking settings.",
    severity: "high",
    category: "enterprise",
  },
  {
    id: "network:read",
    title: "Read network configurations",
    description: "Read enterprise network configurations.",
    severity: "low",
    category: "enterprise",
  },
  {
    id: "packages:write",
    title: "Publish packages",
    description: "Publish or overwrite packages that downstream users may install.",
    severity: "high",
    category: "packages",
  },
  {
    id: "packages:read",
    title: "Read packages",
    description: "Download private packages.",
    severity: "low",
    category: "packages",
  },
  {
    id: "packages:delete",
    title: "Delete packages",
    description: "Delete packages, breaking downstream installs and potentially enabling supply-chain attacks.",
    severity: "critical",
    category: "packages",
  },
  {
    id: "keys:write",
    title: "Manage SSH and GPG keys",
    description: "Add, replace or remove keys, enabling persistent access or commit impersonation.",
    severity: "high",
    category: "identity",
  },
  {
    id: "keys:read",
    title: "Read SSH and GPG keys",
    description: "Enumerate public keys associated with the account.",
    severity: "low",
    category: "identity",
  },
  {
    id: "tokens:manage",
    title: "Manage personal access tokens",
    description: "Create, approve or revoke fine-grained personal access tokens for the organization.",
    severity: "critical",
    category: "identity",
  },
  {
    id: "webhooks:write",
    title: "Manage repository webhooks",
    description: "Create webhooks that exfiltrate repository events to an external endpoint.",
    severity: "medium",
    category: "hooks",
  },
  {
    id: "webhooks:read",
    title: "Read repository webhooks",
    description: "Read webhook configurations and target URLs.",
    severity: "low",
    category: "hooks",
  },
  {
    id: "org_webhooks:write",
    title: "Manage organization webhooks",
    description: "Create organization webhooks that exfiltrate events across all repositories.",
    severity: "high",
    category: "hooks",
  },
  {
    id: "gists:write",
    title: "Create or update gists",
    description: "Publish or modify gists, including secret gists.",
    severity: "low",
    category: "account",
  },
  {
    id: "notifications:write",
    title: "Manage notifications",
    description: "Mark notifications as read and change notification settings.",
    severity: "low",
    category: "account",
  },
  {
    id: "profile:write",
    title: "Modify profile",
    description: "Change the account's name, bio, email, company and other public profile fields.",
    severity: "medium",
    category: "account",
  },
  {
    id: "profile:read",
    title: "Read profile",
    description: "Read public and private profile fields.",
    severity: "low",
    category: "account",
  },
  {
    id: "email:read",
    title: "Read email addresses",
    description: "Read the account's email addresses, including private ones.",
    severity: "low",
    category: "account",
  },
  {
    id: "follow:write",
    title: "Follow or unfollow users",
    description: "Change the account's social graph.",
    severity: "low",
    category: "account",
  },
  {
    id: "projects:write",
    title: "Manage projects",
    description: "Create and modify projects, including items and fields.",
    severity: "medium",
    category: "projects",
  },
  {
    id: "projects:read",
    title: "Read projects",
    description: "Read project data.",
    severity: "low",
    category: "projects",
  },
  {
    id: "discussions:write",
    title: "Manage team discussions",
    description: "Create and modify team discussions.",
    severity: "medium",
    category: "organization",
  },
  {
    id: "discussions:read",
    title: "Read team discussions",
    description: "Read team discussions.",
    severity: "low",
    category: "organization",
  },
  {
    id: "codespaces:write",
    title: "Manage Codespaces",
    description: "Create, access and delete Codespaces, which may contain repository credentials.",
    severity: "medium",
    category: "codespaces",
  },
  {
    id: "copilot:manage",
    title: "Manage Copilot",
    description: "Manage Copilot seats, policies and settings.",
    severity: "high",
    category: "copilot",
  },
  {
    id: "status:write",
    title: "Write commit statuses",
    description: "Set commit statuses, which can influence merge decisions.",
    severity: "low",
    category: "repository",
  },
  {
    id: "deployments:write",
    title: "Write deployments",
    description: "Create and update deployments.",
    severity: "low",
    category: "repository",
  },
  {
    id: "public:write",
    title: "Write public repositories",
    description: "Push commits and edit issues or pull requests in public repositories.",
    severity: "medium",
    category: "repository",
  },
  {
    id: "issues:write",
    title: "Manage issues",
    description: "Create, edit or close issues and comments, which can be used for social engineering.",
    severity: "medium",
    category: "repository",
  },
  {
    id: "pages:write",
    title: "Publish GitHub Pages",
    description: "Deploy content to a GitHub Pages site, potentially impersonating the project.",
    severity: "medium",
    category: "repository",
  },
  {
    id: "security:write",
    title: "Dismiss security findings",
    description: "Dismiss or hide code scanning, secret scanning and Dependabot alerts.",
    severity: "high",
    category: "repository",
  },
  {
    id: "attestations:write",
    title: "Write artifact attestations",
    description: "Publish supply-chain attestations that downstream users may trust.",
    severity: "high",
    category: "packages",
  },
  {
    id: "invitations:write",
    title: "Manage repository invitations",
    description: "Accept or decline repository invitations.",
    severity: "low",
    category: "repository",
  },
  {
    id: "security:read",
    title: "Read security events",
    description: "Read code scanning and security alert data.",
    severity: "medium",
    category: "repository",
  },
];

export const CAPABILITY_DEFINITIONS: CapabilityDefinition[] = CAPABILITY_META.map((capability) => ({
  ...capability,
  scopes: Object.values(SCOPE_DEFINITIONS)
    .filter((scope) => scope.capabilities.includes(capability.id))
    .map((scope) => scope.name)
    .sort(),
  permissions: Object.values(PERMISSION_DEFINITIONS)
    .flatMap((permission) => {
      const grants: string[] = [];
      if (permission.readCapabilities.includes(capability.id)) {
        grants.push(`${permission.name}=read`);
      }
      if (permission.writeCapabilities.includes(capability.id)) {
        grants.push(`${permission.name}=write`);
      }
      return grants;
    })
    .sort(),
})).sort((a, b) => a.id.localeCompare(b.id));

export const CAPABILITY_BY_ID: Record<string, CapabilityDefinition> = Object.fromEntries(
  CAPABILITY_DEFINITIONS.map((capability) => [capability.id, capability]),
);

const SEVERITY_RANK: Record<Severity, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};

export function compareSeverity(a: Severity, b: Severity): number {
  return SEVERITY_RANK[b] - SEVERITY_RANK[a];
}

export function highestSeverity(capabilities: Capability[]): Severity | null {
  if (capabilities.length === 0) return null;
  return capabilities.reduce<Severity>(
    (highest, capability) =>
      SEVERITY_RANK[capability.severity] > SEVERITY_RANK[highest] ? capability.severity : highest,
    "low",
  );
}

function buildCapabilities(matched: Map<string, Set<string>>): Capability[] {
  return [...matched.entries()]
    .map(([capabilityId, matchedBy]) => {
      const definition = CAPABILITY_BY_ID[capabilityId];
      if (!definition) {
        throw new Error(`Unknown capability "${capabilityId}" in the capability matrix.`);
      }
      return {
        id: definition.id,
        title: definition.title,
        description: definition.description,
        severity: definition.severity,
        category: definition.category,
        matchedScopes: [...matchedBy].sort(),
      };
    })
    .sort(
      (a, b) =>
        compareSeverity(a.severity, b.severity) || a.title.localeCompare(b.title),
    );
}

export function resolveCapabilities(scopes: string[]): Capability[] {
  const matched = new Map<string, Set<string>>();

  for (const scopeName of scopes) {
    const scope = SCOPE_DEFINITIONS[scopeName];
    if (!scope) continue;

    for (const capabilityId of scope.capabilities) {
      const set = matched.get(capabilityId) ?? new Set<string>();
      set.add(scopeName);
      matched.set(capabilityId, set);
    }
  }

  return buildCapabilities(matched);
}

export function resolveCapabilitiesFromPermissions(grants: PermissionGrant[]): Capability[] {
  const matched = new Map<string, Set<string>>();

  for (const grant of grants) {
    const permission = PERMISSION_DEFINITIONS[grant.permission];
    if (!permission) continue;

    const capabilityIds =
      grant.access === "read" ? permission.readCapabilities : permission.writeCapabilities;

    for (const capabilityId of capabilityIds) {
      const set = matched.get(capabilityId) ?? new Set<string>();
      set.add(permissionGrantLabel(grant));
      matched.set(capabilityId, set);
    }
  }

  return buildCapabilities(matched);
}

export function mergeCapabilities(...groups: Capability[][]): Capability[] {
  const matched = new Map<string, Set<string>>();

  for (const group of groups) {
    for (const capability of group) {
      const set = matched.get(capability.id) ?? new Set<string>();
      for (const source of capability.matchedScopes) {
        set.add(source);
      }
      matched.set(capability.id, set);
    }
  }

  return buildCapabilities(matched);
}

export function capabilityNames(): string[] {
  return CAPABILITY_DEFINITIONS.map((capability) => capability.id);
}
