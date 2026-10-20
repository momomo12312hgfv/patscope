var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  if (mod && typeof mod === "object" || typeof mod === "function") {
    for (let key of __getOwnPropNames(mod))
      if (!__hasOwnProp.call(to, key))
        __defProp(to, key, {
          get: __accessProp.bind(mod, key),
          enumerable: true
        });
  }
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);

// node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS(function(exports2, module2) {
  var p = process || {};
  var argv = p.argv || [];
  var env = p.env || {};
  var isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
  var formatter = (open, close, replace = open) => (input) => {
    let string = "" + input, index = string.indexOf(close, open.length);
    return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
  };
  var replaceClose = (string, close, replace, index) => {
    let result = "", cursor = 0;
    do {
      result += string.substring(cursor, index) + replace;
      cursor = index + close.length;
      index = string.indexOf(close, cursor);
    } while (~index);
    return result + string.substring(cursor);
  };
  var createColors = (enabled = isColorSupported) => {
    let f = enabled ? formatter : () => String;
    return {
      isColorSupported: enabled,
      reset: f("\x1B[0m", "\x1B[0m"),
      bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
      dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
      italic: f("\x1B[3m", "\x1B[23m"),
      underline: f("\x1B[4m", "\x1B[24m"),
      inverse: f("\x1B[7m", "\x1B[27m"),
      hidden: f("\x1B[8m", "\x1B[28m"),
      strikethrough: f("\x1B[9m", "\x1B[29m"),
      black: f("\x1B[30m", "\x1B[39m"),
      red: f("\x1B[31m", "\x1B[39m"),
      green: f("\x1B[32m", "\x1B[39m"),
      yellow: f("\x1B[33m", "\x1B[39m"),
      blue: f("\x1B[34m", "\x1B[39m"),
      magenta: f("\x1B[35m", "\x1B[39m"),
      cyan: f("\x1B[36m", "\x1B[39m"),
      white: f("\x1B[37m", "\x1B[39m"),
      gray: f("\x1B[90m", "\x1B[39m"),
      bgBlack: f("\x1B[40m", "\x1B[49m"),
      bgRed: f("\x1B[41m", "\x1B[49m"),
      bgGreen: f("\x1B[42m", "\x1B[49m"),
      bgYellow: f("\x1B[43m", "\x1B[49m"),
      bgBlue: f("\x1B[44m", "\x1B[49m"),
      bgMagenta: f("\x1B[45m", "\x1B[49m"),
      bgCyan: f("\x1B[46m", "\x1B[49m"),
      bgWhite: f("\x1B[47m", "\x1B[49m"),
      blackBright: f("\x1B[90m", "\x1B[39m"),
      redBright: f("\x1B[91m", "\x1B[39m"),
      greenBright: f("\x1B[92m", "\x1B[39m"),
      yellowBright: f("\x1B[93m", "\x1B[39m"),
      blueBright: f("\x1B[94m", "\x1B[39m"),
      magentaBright: f("\x1B[95m", "\x1B[39m"),
      cyanBright: f("\x1B[96m", "\x1B[39m"),
      whiteBright: f("\x1B[97m", "\x1B[39m"),
      bgBlackBright: f("\x1B[100m", "\x1B[49m"),
      bgRedBright: f("\x1B[101m", "\x1B[49m"),
      bgGreenBright: f("\x1B[102m", "\x1B[49m"),
      bgYellowBright: f("\x1B[103m", "\x1B[49m"),
      bgBlueBright: f("\x1B[104m", "\x1B[49m"),
      bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
      bgCyanBright: f("\x1B[106m", "\x1B[49m"),
      bgWhiteBright: f("\x1B[107m", "\x1B[49m")
    };
  };
  module2.exports = createColors();
  module2.exports.createColors = createColors;
});

// src/action.ts
var import_node_fs = require("node:fs");
var import_promises = require("node:fs/promises");

// src/permissions.ts
function definePermission(name, title, description, category, access, readCapabilities, writeCapabilities) {
  return { name, title, description, category, access, readCapabilities, writeCapabilities };
}
var PERMISSION_DEFINITIONS = {
  "repo.contents": definePermission("repo.contents", "Contents", "Repository contents, commits, branches, tags and releases.", "repository", ["read", "write"], ["code:read"], ["code:read", "code:write"]),
  "repo.workflows": definePermission("repo.workflows", "Workflows", "GitHub Actions workflow files.", "repository", ["read", "write"], [], ["workflow:write"]),
  "repo.actions": definePermission("repo.actions", "Actions", "Actions runs, artifacts and caches.", "repository", ["read", "write"], [], ["actions:manage"]),
  "repo.administration": definePermission("repo.administration", "Administration", "Repository settings, collaborators, deploy keys and branch protection.", "repository", ["read", "write"], [], ["repo:admin"]),
  "repo.secrets": definePermission("repo.secrets", "Secrets", "Repository Actions secrets.", "repository", ["read", "write"], [], ["secrets:manage"]),
  "repo.environments": definePermission("repo.environments", "Environments", "Deployment environments and their protection rules.", "repository", ["read", "write"], [], ["repo:admin"]),
  "repo.packages": definePermission("repo.packages", "Packages", "GitHub Packages published from the repository.", "repository", ["read", "write"], ["packages:read"], ["packages:write"]),
  "repo.pages": definePermission("repo.pages", "Pages", "GitHub Pages sites.", "repository", ["read", "write"], [], ["pages:write"]),
  "repo.pull_requests": definePermission("repo.pull_requests", "Pull requests", "Pull requests, reviews and merges.", "repository", ["read", "write"], ["code:read"], ["code:write"]),
  "repo.issues": definePermission("repo.issues", "Issues", "Issues and issue comments.", "repository", ["read", "write"], ["code:read"], ["issues:write"]),
  "repo.checks": definePermission("repo.checks", "Checks", "Check runs and check suites.", "repository", ["read", "write"], [], ["checks:write"]),
  "repo.statuses": definePermission("repo.statuses", "Commit statuses", "Commit statuses.", "repository", ["read", "write"], [], ["status:write"]),
  "repo.deployments": definePermission("repo.deployments", "Deployments", "Deployments and deployment statuses.", "repository", ["read", "write"], [], ["deployments:write"]),
  "repo.discussions": definePermission("repo.discussions", "Discussions", "Repository discussions.", "repository", ["read", "write"], [], ["discussions:write"]),
  "repo.repository_hooks": definePermission("repo.repository_hooks", "Webhooks", "Repository webhooks.", "repository", ["read", "write"], ["webhooks:read"], ["webhooks:write"]),
  "repo.security_events": definePermission("repo.security_events", "Security events", "Security events and code scanning data.", "repository", ["read", "write"], ["security:read"], ["security:write"]),
  "repo.secret_scanning_alerts": definePermission("repo.secret_scanning_alerts", "Secret scanning alerts", "Secret scanning alerts.", "repository", ["read", "write"], ["security:read"], ["security:write"]),
  "repo.dependabot_alerts": definePermission("repo.dependabot_alerts", "Dependabot alerts", "Dependabot alerts.", "repository", ["read", "write"], ["security:read"], ["security:write"]),
  "repo.code_scanning_alerts": definePermission("repo.code_scanning_alerts", "Code scanning alerts", "Code scanning alerts.", "repository", ["read", "write"], ["security:read"], ["security:write"]),
  "repo.repository_advisories": definePermission("repo.repository_advisories", "Repository advisories", "Security advisories.", "repository", ["read", "write"], ["security:read"], ["security:write"]),
  "repo.attestations": definePermission("repo.attestations", "Attestations", "Artifact attestations used for supply-chain verification.", "repository", ["read", "write"], [], ["attestations:write"]),
  "repo.variables": definePermission("repo.variables", "Variables", "Repository Actions variables.", "repository", ["read", "write"], [], ["variables:manage"]),
  "repo.custom_properties": definePermission("repo.custom_properties", "Custom properties", "Repository custom property values.", "repository", ["read", "write"], [], ["repo:admin"]),
  "repo.merge_queues": definePermission("repo.merge_queues", "Merge queues", "Merge queue configuration.", "repository", ["read", "write"], [], ["repo:admin"]),
  "repo.codespaces": definePermission("repo.codespaces", "Codespaces", "Codespaces for the repository.", "repository", ["read", "write"], [], ["codespaces:write"]),
  "repo.metadata": definePermission("repo.metadata", "Metadata", "Mandatory read-only repository metadata.", "repository", ["read"], [], []),
  "org.administration": definePermission("org.administration", "Organization administration", "Organization settings, members, teams and custom roles.", "organization", ["read", "write"], ["org:read"], ["org:admin"]),
  "org.members": definePermission("org.members", "Members", "Organization members and membership.", "organization", ["read", "write"], ["org:read"], ["org:write"]),
  "org.organization_secrets": definePermission("org.organization_secrets", "Organization secrets", "Organization-wide Actions secrets.", "organization", ["read", "write"], [], ["secrets:manage"]),
  "org.organization_variables": definePermission("org.organization_variables", "Organization variables", "Organization-wide Actions variables.", "organization", ["read", "write"], [], ["variables:manage"]),
  "org.organization_self_hosted_runners": definePermission("org.organization_self_hosted_runners", "Self-hosted runners", "Organization self-hosted runners.", "organization", ["read", "write"], [], ["runners:manage"]),
  "org.organization_webhooks": definePermission("org.organization_webhooks", "Organization webhooks", "Organization webhooks.", "organization", ["read", "write"], ["webhooks:read"], ["org_webhooks:write"]),
  "org.organization_projects": definePermission("org.organization_projects", "Organization projects", "Organization projects.", "organization", ["read", "write"], ["projects:read"], ["projects:write"]),
  "org.organization_packages": definePermission("org.organization_packages", "Organization packages", "Organization packages.", "organization", ["read", "write"], ["packages:read"], ["packages:write"]),
  "org.organization_copilot": definePermission("org.organization_copilot", "Copilot", "Copilot seats and policies.", "organization", ["read", "write"], [], ["copilot:manage"]),
  "org.organization_codespaces": definePermission("org.organization_codespaces", "Organization Codespaces", "Organization Codespaces.", "organization", ["read", "write"], [], ["codespaces:write"]),
  "org.organization_user_blocking": definePermission("org.organization_user_blocking", "User blocking", "Block or unblock organization users.", "organization", ["read", "write"], [], ["org:write"]),
  "org.organization_custom_roles": definePermission("org.organization_custom_roles", "Custom organization roles", "Custom organization roles.", "organization", ["read", "write"], [], ["org:admin"]),
  "org.organization_custom_repository_roles": definePermission("org.organization_custom_repository_roles", "Custom repository roles", "Custom repository roles.", "organization", ["read", "write"], [], ["org:admin"]),
  "org.organization_plan": definePermission("org.organization_plan", "Plan", "Organization plan information.", "organization", ["read"], ["enterprise:read"], []),
  "org.organization_events": definePermission("org.organization_events", "Events", "Organization audit events.", "organization", ["read"], ["audit:read"], []),
  "org.organization_dependabot_secrets": definePermission("org.organization_dependabot_secrets", "Dependabot secrets", "Organization Dependabot secrets.", "organization", ["read", "write"], [], ["secrets:manage"]),
  "org.organization_codespaces_secrets": definePermission("org.organization_codespaces_secrets", "Codespaces secrets", "Organization Codespaces secrets.", "organization", ["read", "write"], [], ["secrets:manage"]),
  "org.organization_codespaces_settings": definePermission("org.organization_codespaces_settings", "Codespaces settings", "Organization Codespaces settings.", "organization", ["read", "write"], [], ["codespaces:write"]),
  "org.personal_access_tokens": definePermission("org.personal_access_tokens", "Personal access tokens", "Fine-grained personal access tokens for the organization.", "organization", ["read", "write"], [], ["tokens:manage"]),
  "user.gists": definePermission("user.gists", "Gists", "Gists owned by the user.", "user", ["read", "write"], [], ["gists:write"]),
  "user.git_ssh_keys": definePermission("user.git_ssh_keys", "Git SSH keys", "SSH keys used for Git access.", "user", ["read", "write"], ["keys:read"], ["keys:write"]),
  "user.gpg_keys": definePermission("user.gpg_keys", "GPG keys", "GPG keys used for commit signing.", "user", ["read", "write"], ["keys:read"], ["keys:write"]),
  "user.ssh_signing_keys": definePermission("user.ssh_signing_keys", "SSH signing keys", "SSH keys used for commit signing.", "user", ["read", "write"], ["keys:read"], ["keys:write"]),
  "user.emails": definePermission("user.emails", "Email addresses", "Email addresses associated with the account.", "user", ["read"], ["email:read"], []),
  "user.followers": definePermission("user.followers", "Followers", "Follow and unfollow users.", "user", ["read", "write"], [], ["follow:write"]),
  "user.notifications": definePermission("user.notifications", "Notifications", "Notification settings and threads.", "user", ["read", "write"], [], ["notifications:write"]),
  "user.codespaces": definePermission("user.codespaces", "User Codespaces", "Codespaces owned by the user.", "user", ["read", "write"], [], ["codespaces:write"])
};
function resolvePermissionName(input) {
  const name = input.trim().toLowerCase();
  if (!name)
    return null;
  if (PERMISSION_DEFINITIONS[name])
    return name;
  const matches = Object.keys(PERMISSION_DEFINITIONS).filter((canonical) => canonical.split(".").at(-1) === name);
  return matches.length === 1 ? matches[0] ?? null : null;
}
function parsePermissionInput(raw) {
  const grants = [];
  const errors = [];
  const seen = new Set;
  for (const item of raw.split(/[\s,]+/).filter(Boolean)) {
    const match = /^([^=:]+)[=:](read|write)$/i.exec(item);
    if (!match) {
      errors.push(`Invalid permission "${item}". Expected permission=read|write.`);
      continue;
    }
    const inputName = match[1] ?? "";
    const access = (match[2] ?? "").toLowerCase();
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
      errors.push(`Permission "${canonical}" does not support "${access}". Supported: ${definition.access.join(", ")}.`);
      continue;
    }
    const key = `${canonical}=${access}`;
    if (seen.has(key))
      continue;
    seen.add(key);
    grants.push({ permission: canonical, access });
  }
  return { grants, errors };
}
function permissionGrantLabel(grant) {
  return `${grant.permission}=${grant.access}`;
}

// src/report/json.ts
function renderJson(report) {
  return JSON.stringify(report, null, 2);
}
// package.json
var package_default = {
  name: "patscope",
  version: "0.2.0",
  description: "See the blast radius of your GitHub token — and shrink it.",
  type: "module",
  bin: {
    patscope: "dist/patscope"
  },
  files: [
    "dist",
    "action-dist",
    "action.yml",
    "README.md",
    "LICENSE"
  ],
  scripts: {
    dev: "bun run src/cli.ts",
    build: "bun run scripts/build.ts",
    "build:all": "bun run scripts/build-all.ts",
    "build:action": "bun run scripts/build-action.ts",
    docs: "bun run scripts/generate-docs.ts",
    test: "bun test",
    typecheck: "tsc --noEmit",
    check: "bun run typecheck && bun test"
  },
  keywords: [
    "github",
    "security",
    "pat",
    "token",
    "least-privilege",
    "cli",
    "devsecops"
  ],
  license: "MIT",
  engines: {
    bun: ">=1.2.0"
  },
  dependencies: {
    commander: "^15.0.0",
    picocolors: "^1.1.1"
  },
  devDependencies: {
    "@types/bun": "^1.4.3",
    typescript: "^7.0.2"
  }
};

// src/report/markdown.ts
function cell(value) {
  return String(value ?? "—").replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
function identity(report) {
  if (!report.identity)
    return "—";
  const name = report.identity.name ? ` (${report.identity.name})` : "";
  return `@${report.identity.login}${name}`;
}
function renderMarkdown(report) {
  const lines = [];
  lines.push(`# patscope report`);
  lines.push("");
  lines.push(`Generated by [patscope](https://github.com/momomo12312hgfv/patscope) v${package_default.version} at ${report.generatedAt}.`);
  lines.push("");
  lines.push("## Token");
  lines.push("");
  lines.push("| Field | Value |");
  lines.push("| --- | --- |");
  lines.push(`| Identity | ${cell(identity(report))} |`);
  lines.push(`| Token | \`${cell(report.token.redacted)}\` (${cell(report.token.typeLabel)}) |`);
  lines.push(`| Source | ${cell(report.token.source)} |`);
  lines.push(`| Scopes | ${report.token.scopes.length > 0 ? report.token.scopes.map((scope) => `\`${scope}\``).join(", ") : "none"} |`);
  if (report.token.permissions.length > 0) {
    lines.push(`| Permissions (self-reported) | ${report.token.permissions.map((permission) => `\`${permission.permission}=${permission.access}\``).join(", ")} |`);
  }
  if (report.orgs.length > 0) {
    lines.push(`| Organizations | ${report.orgs.map((org) => cell(org.login)).join(", ")} |`);
  }
  lines.push("");
  lines.push("## Blast radius");
  lines.push("");
  if (!report.scoreKnown) {
    lines.push("**UNKNOWN** — this token type does not expose its permissions through the GitHub API.");
  } else {
    lines.push(`**${report.score.level.toUpperCase()}** — ${report.score.value}/100`);
    if (report.score.rawValue !== report.score.value) {
      lines.push("");
      lines.push(`Raw weighted score: ${report.score.rawValue}. The score was raised to the minimum floor for the highest-severity capability.`);
    }
  }
  lines.push("");
  if (report.capabilities.length > 0) {
    lines.push("## Top risks");
    lines.push("");
    for (const capability of report.capabilities.slice(0, 5)) {
      lines.push(`- **${capability.title}** (${capability.severity}) — ${capability.description} _Granted by: ${capability.matchedScopes.join(", ")}._`);
    }
    lines.push("");
    lines.push("## Capabilities");
    lines.push("");
    lines.push("| Capability | Severity | Granted by |");
    lines.push("| --- | --- | --- |");
    for (const capability of report.capabilities) {
      lines.push(`| ${cell(capability.title)} (\`${capability.id}\`) | ${capability.severity} | ${cell(capability.matchedScopes.join(", "))} |`);
    }
    lines.push("");
  } else {
    lines.push("## Capabilities");
    lines.push("");
    lines.push("No capabilities matched the known capability matrix.");
    lines.push("");
  }
  if (report.repositories.length > 0) {
    lines.push("## Repositories");
    lines.push("");
    lines.push("| Repository | Access | Visibility | Status |");
    lines.push("| --- | --- | --- | --- |");
    for (const repository of report.repositories) {
      const access = repository.accessible ? "accessible" : "not accessible";
      const visibility = repository.private === null ? "unknown" : repository.private ? "private" : "public";
      const status = repository.status === null ? repository.error ?? "—" : String(repository.status);
      lines.push(`| ${cell(repository.fullName)} | ${access} | ${visibility} | ${cell(status)} |`);
    }
    lines.push("");
  }
  if (report.warnings.length > 0) {
    lines.push("## Warnings");
    lines.push("");
    for (const warning of report.warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push("");
  }
  lines.push("---");
  lines.push("");
  lines.push(report.token.source === "offline" ? "Offline scan. No network requests were made." : "Local-only scan. The token was sent only to api.github.com.");
  lines.push("");
  return lines.join(`
`);
}

// src/scopes.ts
function defineScope(name, description, severity, category, capabilities) {
  return { name, description, severity, category, capabilities };
}
var SCOPE_DEFINITIONS = {
  repo: defineScope("repo", "Full control of private repositories: code, issues, pull requests, releases, collaborators and settings.", "high", "repository", ["code:read", "code:write", "repo:admin", "secrets:manage"]),
  "repo:status": defineScope("repo:status", "Read and write commit statuses.", "low", "repository", ["status:write"]),
  repo_deployment: defineScope("repo_deployment", "Read and write deployment statuses.", "low", "repository", ["deployments:write"]),
  public_repo: defineScope("public_repo", "Read and write public repositories only.", "medium", "repository", ["public:write"]),
  "repo:invite": defineScope("repo:invite", "Accept or decline repository invitations.", "low", "repository", ["invitations:write"]),
  security_events: defineScope("security_events", "Read and write security events such as code scanning alerts.", "medium", "repository", ["security:read"]),
  workflow: defineScope("workflow", "Add or update GitHub Actions workflow files.", "high", "actions", ["workflow:write"]),
  "write:packages": defineScope("write:packages", "Upload and publish packages.", "high", "packages", ["packages:write"]),
  "read:packages": defineScope("read:packages", "Download packages.", "low", "packages", ["packages:read"]),
  "delete:packages": defineScope("delete:packages", "Delete packages.", "critical", "packages", ["packages:delete"]),
  "admin:org": defineScope("admin:org", "Full control of organizations and teams, including members and organization secrets.", "critical", "organization", ["org:admin", "org:read", "secrets:manage"]),
  "write:org": defineScope("write:org", "Read and write organization membership, projects and team membership.", "high", "organization", ["org:write"]),
  "read:org": defineScope("read:org", "Read organization membership and teams.", "low", "organization", ["org:read"]),
  "manage_runners:org": defineScope("manage_runners:org", "Manage organization-level self-hosted runners.", "high", "organization", ["runners:manage"]),
  "admin:public_key": defineScope("admin:public_key", "Full control of public SSH keys.", "high", "identity", ["keys:write"]),
  "write:public_key": defineScope("write:public_key", "Create and update public SSH keys.", "high", "identity", ["keys:write"]),
  "read:public_key": defineScope("read:public_key", "Read public SSH keys.", "low", "identity", ["keys:read"]),
  "admin:repo_hook": defineScope("admin:repo_hook", "Full control of repository webhooks.", "medium", "hooks", ["webhooks:write"]),
  "write:repo_hook": defineScope("write:repo_hook", "Create and update repository webhooks.", "medium", "hooks", ["webhooks:write"]),
  "read:repo_hook": defineScope("read:repo_hook", "Read repository webhooks.", "low", "hooks", ["webhooks:read"]),
  "admin:org_hook": defineScope("admin:org_hook", "Full control of organization webhooks.", "high", "hooks", ["org_webhooks:write"]),
  gist: defineScope("gist", "Create and update gists.", "low", "account", ["gists:write"]),
  notifications: defineScope("notifications", "Read and manage notifications.", "low", "account", ["notifications:write"]),
  user: defineScope("user", "Read and write profile data, including name, email and bio.", "medium", "account", ["profile:write"]),
  "read:user": defineScope("read:user", "Read profile data.", "low", "account", ["profile:read"]),
  "user:email": defineScope("user:email", "Read email addresses.", "low", "account", ["email:read"]),
  "user:follow": defineScope("user:follow", "Follow and unfollow users.", "low", "account", ["follow:write"]),
  project: defineScope("project", "Read and write projects.", "medium", "projects", ["projects:write"]),
  "read:project": defineScope("read:project", "Read projects.", "low", "projects", ["projects:read"]),
  delete_repo: defineScope("delete_repo", "Delete repositories.", "critical", "repository", ["repo:delete"]),
  "write:discussion": defineScope("write:discussion", "Read and write team discussions.", "medium", "organization", ["discussions:write"]),
  "read:discussion": defineScope("read:discussion", "Read team discussions.", "low", "organization", ["discussions:read"]),
  "admin:enterprise": defineScope("admin:enterprise", "Full control of enterprises, including policies, members and audit data.", "critical", "enterprise", ["enterprise:admin", "enterprise:read"]),
  "manage_runners:enterprise": defineScope("manage_runners:enterprise", "Manage enterprise-level self-hosted runners.", "high", "enterprise", ["runners:manage"]),
  "manage_billing:enterprise": defineScope("manage_billing:enterprise", "Read and write enterprise billing data.", "high", "enterprise", ["billing:manage"]),
  "read:enterprise": defineScope("read:enterprise", "Read enterprise data.", "medium", "enterprise", ["enterprise:read"]),
  audit_log: defineScope("audit_log", "Read the enterprise audit log.", "medium", "enterprise", ["audit:read"]),
  codespace: defineScope("codespace", "Create, read, update and delete Codespaces.", "medium", "codespaces", ["codespaces:write"]),
  copilot: defineScope("copilot", "Manage GitHub Copilot settings and seats.", "high", "copilot", ["copilot:manage"]),
  "write:network_configurations": defineScope("write:network_configurations", "Read and write network configurations.", "high", "enterprise", ["network:write"]),
  "read:network_configurations": defineScope("read:network_configurations", "Read network configurations.", "low", "enterprise", ["network:read"]),
  "admin:gpg_key": defineScope("admin:gpg_key", "Full control of GPG keys.", "high", "identity", ["keys:write"]),
  "write:gpg_key": defineScope("write:gpg_key", "Create and update GPG keys.", "high", "identity", ["keys:write"]),
  "read:gpg_key": defineScope("read:gpg_key", "Read GPG keys.", "low", "identity", ["keys:read"]),
  "admin:ssh_signing_key": defineScope("admin:ssh_signing_key", "Full control of SSH signing keys.", "high", "identity", ["keys:write"]),
  "write:ssh_signing_key": defineScope("write:ssh_signing_key", "Create and update SSH signing keys.", "high", "identity", ["keys:write"]),
  "read:ssh_signing_key": defineScope("read:ssh_signing_key", "Read SSH signing keys.", "low", "identity", ["keys:read"])
};

// src/capabilities.ts
var CAPABILITY_META = [
  {
    id: "code:read",
    title: "Read repository contents",
    description: "Read source code, commits, branches, issues and pull requests in accessible repositories.",
    severity: "low",
    category: "repository"
  },
  {
    id: "code:write",
    title: "Write repository contents",
    description: "Push commits, rewrite branches, edit issues and pull requests, and publish releases.",
    severity: "high",
    category: "repository"
  },
  {
    id: "repo:admin",
    title: "Change repository settings",
    description: "Manage collaborators, deploy keys, branch protection, repository secrets and other settings.",
    severity: "high",
    category: "repository"
  },
  {
    id: "repo:delete",
    title: "Delete repositories",
    description: "Permanently delete repositories, including all code, issues and releases.",
    severity: "critical",
    category: "repository"
  },
  {
    id: "secrets:manage",
    title: "Manage CI/CD secrets",
    description: "Create, overwrite or remove repository and organization secrets used by workflows.",
    severity: "high",
    category: "actions"
  },
  {
    id: "workflow:write",
    title: "Modify GitHub Actions workflows",
    description: "Add or change workflow files, which can execute code and expose repository secrets.",
    severity: "high",
    category: "actions"
  },
  {
    id: "actions:manage",
    title: "Manage Actions runs",
    description: "Cancel or rerun workflows, delete artifacts and caches, and disrupt or extract CI data.",
    severity: "high",
    category: "actions"
  },
  {
    id: "checks:write",
    title: "Write check results",
    description: "Create or update check runs, which can fake CI results and bypass required checks.",
    severity: "high",
    category: "actions"
  },
  {
    id: "variables:manage",
    title: "Manage Actions variables",
    description: "Change repository or organization variables used by workflows.",
    severity: "medium",
    category: "actions"
  },
  {
    id: "runners:manage",
    title: "Manage self-hosted runners",
    description: "Register or remove self-hosted runners, potentially redirecting CI jobs to attacker-controlled machines.",
    severity: "high",
    category: "actions"
  },
  {
    id: "org:admin",
    title: "Manage organization",
    description: "Add or remove members, change roles, manage teams, settings and organization secrets.",
    severity: "critical",
    category: "organization"
  },
  {
    id: "org:write",
    title: "Manage teams and projects",
    description: "Change organization membership, teams and projects.",
    severity: "high",
    category: "organization"
  },
  {
    id: "org:read",
    title: "Read organization membership",
    description: "Enumerate organization members, teams and roles.",
    severity: "low",
    category: "organization"
  },
  {
    id: "enterprise:admin",
    title: "Manage enterprise",
    description: "Change enterprise policies, members, organizations and security settings.",
    severity: "critical",
    category: "enterprise"
  },
  {
    id: "enterprise:read",
    title: "Read enterprise data",
    description: "Read enterprise policies, organizations and member information.",
    severity: "medium",
    category: "enterprise"
  },
  {
    id: "billing:manage",
    title: "Manage billing",
    description: "Read and change billing settings and spending limits.",
    severity: "high",
    category: "enterprise"
  },
  {
    id: "audit:read",
    title: "Read audit log",
    description: "Read enterprise audit events, which may contain sensitive operational data.",
    severity: "medium",
    category: "enterprise"
  },
  {
    id: "network:write",
    title: "Manage network configurations",
    description: "Change enterprise network configurations and private networking settings.",
    severity: "high",
    category: "enterprise"
  },
  {
    id: "network:read",
    title: "Read network configurations",
    description: "Read enterprise network configurations.",
    severity: "low",
    category: "enterprise"
  },
  {
    id: "packages:write",
    title: "Publish packages",
    description: "Publish or overwrite packages that downstream users may install.",
    severity: "high",
    category: "packages"
  },
  {
    id: "packages:read",
    title: "Read packages",
    description: "Download private packages.",
    severity: "low",
    category: "packages"
  },
  {
    id: "packages:delete",
    title: "Delete packages",
    description: "Delete packages, breaking downstream installs and potentially enabling supply-chain attacks.",
    severity: "critical",
    category: "packages"
  },
  {
    id: "keys:write",
    title: "Manage SSH and GPG keys",
    description: "Add, replace or remove keys, enabling persistent access or commit impersonation.",
    severity: "high",
    category: "identity"
  },
  {
    id: "keys:read",
    title: "Read SSH and GPG keys",
    description: "Enumerate public keys associated with the account.",
    severity: "low",
    category: "identity"
  },
  {
    id: "tokens:manage",
    title: "Manage personal access tokens",
    description: "Create, approve or revoke fine-grained personal access tokens for the organization.",
    severity: "critical",
    category: "identity"
  },
  {
    id: "webhooks:write",
    title: "Manage repository webhooks",
    description: "Create webhooks that exfiltrate repository events to an external endpoint.",
    severity: "medium",
    category: "hooks"
  },
  {
    id: "webhooks:read",
    title: "Read repository webhooks",
    description: "Read webhook configurations and target URLs.",
    severity: "low",
    category: "hooks"
  },
  {
    id: "org_webhooks:write",
    title: "Manage organization webhooks",
    description: "Create organization webhooks that exfiltrate events across all repositories.",
    severity: "high",
    category: "hooks"
  },
  {
    id: "gists:write",
    title: "Create or update gists",
    description: "Publish or modify gists, including secret gists.",
    severity: "low",
    category: "account"
  },
  {
    id: "notifications:write",
    title: "Manage notifications",
    description: "Mark notifications as read and change notification settings.",
    severity: "low",
    category: "account"
  },
  {
    id: "profile:write",
    title: "Modify profile",
    description: "Change the account's name, bio, email, company and other public profile fields.",
    severity: "medium",
    category: "account"
  },
  {
    id: "profile:read",
    title: "Read profile",
    description: "Read public and private profile fields.",
    severity: "low",
    category: "account"
  },
  {
    id: "email:read",
    title: "Read email addresses",
    description: "Read the account's email addresses, including private ones.",
    severity: "low",
    category: "account"
  },
  {
    id: "follow:write",
    title: "Follow or unfollow users",
    description: "Change the account's social graph.",
    severity: "low",
    category: "account"
  },
  {
    id: "projects:write",
    title: "Manage projects",
    description: "Create and modify projects, including items and fields.",
    severity: "medium",
    category: "projects"
  },
  {
    id: "projects:read",
    title: "Read projects",
    description: "Read project data.",
    severity: "low",
    category: "projects"
  },
  {
    id: "discussions:write",
    title: "Manage team discussions",
    description: "Create and modify team discussions.",
    severity: "medium",
    category: "organization"
  },
  {
    id: "discussions:read",
    title: "Read team discussions",
    description: "Read team discussions.",
    severity: "low",
    category: "organization"
  },
  {
    id: "codespaces:write",
    title: "Manage Codespaces",
    description: "Create, access and delete Codespaces, which may contain repository credentials.",
    severity: "medium",
    category: "codespaces"
  },
  {
    id: "copilot:manage",
    title: "Manage Copilot",
    description: "Manage Copilot seats, policies and settings.",
    severity: "high",
    category: "copilot"
  },
  {
    id: "status:write",
    title: "Write commit statuses",
    description: "Set commit statuses, which can influence merge decisions.",
    severity: "low",
    category: "repository"
  },
  {
    id: "deployments:write",
    title: "Write deployments",
    description: "Create and update deployments.",
    severity: "low",
    category: "repository"
  },
  {
    id: "public:write",
    title: "Write public repositories",
    description: "Push commits and edit issues or pull requests in public repositories.",
    severity: "medium",
    category: "repository"
  },
  {
    id: "issues:write",
    title: "Manage issues",
    description: "Create, edit or close issues and comments, which can be used for social engineering.",
    severity: "medium",
    category: "repository"
  },
  {
    id: "pages:write",
    title: "Publish GitHub Pages",
    description: "Deploy content to a GitHub Pages site, potentially impersonating the project.",
    severity: "medium",
    category: "repository"
  },
  {
    id: "security:write",
    title: "Dismiss security findings",
    description: "Dismiss or hide code scanning, secret scanning and Dependabot alerts.",
    severity: "high",
    category: "repository"
  },
  {
    id: "attestations:write",
    title: "Write artifact attestations",
    description: "Publish supply-chain attestations that downstream users may trust.",
    severity: "high",
    category: "packages"
  },
  {
    id: "invitations:write",
    title: "Manage repository invitations",
    description: "Accept or decline repository invitations.",
    severity: "low",
    category: "repository"
  },
  {
    id: "security:read",
    title: "Read security events",
    description: "Read code scanning and security alert data.",
    severity: "medium",
    category: "repository"
  }
];
var CAPABILITY_DEFINITIONS = CAPABILITY_META.map((capability) => ({
  ...capability,
  scopes: Object.values(SCOPE_DEFINITIONS).filter((scope) => scope.capabilities.includes(capability.id)).map((scope) => scope.name).sort(),
  permissions: Object.values(PERMISSION_DEFINITIONS).flatMap((permission) => {
    const grants = [];
    if (permission.readCapabilities.includes(capability.id)) {
      grants.push(`${permission.name}=read`);
    }
    if (permission.writeCapabilities.includes(capability.id)) {
      grants.push(`${permission.name}=write`);
    }
    return grants;
  }).sort()
})).sort((a, b) => a.id.localeCompare(b.id));
var CAPABILITY_BY_ID = Object.fromEntries(CAPABILITY_DEFINITIONS.map((capability) => [capability.id, capability]));
var SEVERITY_RANK = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3
};
function compareSeverity(a, b) {
  return SEVERITY_RANK[b] - SEVERITY_RANK[a];
}
function highestSeverity(capabilities) {
  if (capabilities.length === 0)
    return null;
  return capabilities.reduce((highest, capability) => SEVERITY_RANK[capability.severity] > SEVERITY_RANK[highest] ? capability.severity : highest, "low");
}
function buildCapabilities(matched) {
  return [...matched.entries()].map(([capabilityId, matchedBy]) => {
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
      matchedScopes: [...matchedBy].sort()
    };
  }).sort((a, b) => compareSeverity(a.severity, b.severity) || a.title.localeCompare(b.title));
}
function resolveCapabilities(scopes) {
  const matched = new Map;
  for (const scopeName of scopes) {
    const scope = SCOPE_DEFINITIONS[scopeName];
    if (!scope)
      continue;
    for (const capabilityId of scope.capabilities) {
      const set = matched.get(capabilityId) ?? new Set;
      set.add(scopeName);
      matched.set(capabilityId, set);
    }
  }
  return buildCapabilities(matched);
}
function resolveCapabilitiesFromPermissions(grants) {
  const matched = new Map;
  for (const grant of grants) {
    const permission = PERMISSION_DEFINITIONS[grant.permission];
    if (!permission)
      continue;
    const capabilityIds = grant.access === "read" ? permission.readCapabilities : permission.writeCapabilities;
    for (const capabilityId of capabilityIds) {
      const set = matched.get(capabilityId) ?? new Set;
      set.add(permissionGrantLabel(grant));
      matched.set(capabilityId, set);
    }
  }
  return buildCapabilities(matched);
}
function mergeCapabilities(...groups) {
  const matched = new Map;
  for (const group of groups) {
    for (const capability of group) {
      const set = matched.get(capability.id) ?? new Set;
      for (const source of capability.matchedScopes) {
        set.add(source);
      }
      matched.set(capability.id, set);
    }
  }
  return buildCapabilities(matched);
}

// src/report/sarif.ts
var RULE_URL = "https://github.com/momomo12312hgfv/patscope/blob/main/docs/scope-matrix.md#capabilities";
function sarifLevel(severity) {
  if (severity === "critical" || severity === "high")
    return "error";
  if (severity === "medium")
    return "warning";
  return "note";
}
function ruleFor(capability) {
  return {
    id: `patscope/${capability.id}`,
    name: capability.title.replace(/[^A-Za-z0-9]+/g, ""),
    shortDescription: { text: capability.title },
    fullDescription: { text: capability.description },
    helpUri: RULE_URL,
    properties: {
      tags: ["security", "github-token", capability.category],
      severity: capability.severity,
      capability: capability.id
    }
  };
}
function resultFor(report, capability) {
  return {
    ruleId: `patscope/${capability.id}`,
    level: sarifLevel(capability.severity),
    message: {
      text: `${capability.title}: ${capability.description} Granted by: ${capability.matchedScopes.join(", ")}. Token blast radius: ${report.score.level} (${report.score.value}/100).`
    },
    locations: [
      {
        logicalLocations: [
          {
            name: "GitHub token",
            fullyQualifiedName: "github.token",
            kind: "resource"
          }
        ]
      }
    ],
    partialFingerprints: {
      "patscope/v1": capability.id
    },
    properties: {
      severity: capability.severity,
      capability: capability.id,
      grantedBy: capability.matchedScopes,
      score: report.score.value,
      level: report.score.level
    }
  };
}
function renderSarif(report) {
  const sarif = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [
      {
        tool: {
          driver: {
            name: "patscope",
            informationUri: "https://github.com/momomo12312hgfv/patscope",
            version: package_default.version,
            rules: CAPABILITY_DEFINITIONS.map(ruleFor)
          }
        },
        invocations: [
          {
            executionSuccessful: true,
            startTimeUtc: report.generatedAt,
            toolExecutionNotifications: report.warnings.map((warning) => ({
              level: "note",
              message: { text: warning }
            }))
          }
        ],
        properties: {
          score: report.score.value,
          level: report.score.level,
          scoreKnown: report.scoreKnown,
          tokenType: report.token.type
        },
        results: report.capabilities.map((capability) => resultFor(report, capability))
      }
    ]
  };
  return JSON.stringify(sarif, null, 2);
}

// src/report/terminal.ts
var import_picocolors = __toESM(require_picocolors(), 1);
function severityColor(colors, severity, text) {
  switch (severity) {
    case "critical":
      return colors.red(colors.bold(text));
    case "high":
      return colors.magenta(text);
    case "medium":
      return colors.yellow(text);
    case "low":
      return colors.blue(text);
  }
}
function severityLabel(severity) {
  return severity.toUpperCase();
}
function truncate(value, length) {
  if (value.length <= length)
    return value;
  return `${value.slice(0, Math.max(0, length - 1))}…`;
}
function identityLine(report) {
  if (!report.identity)
    return "(unavailable)";
  const name = report.identity.name ? ` (${report.identity.name})` : "";
  return `@${report.identity.login}${name}`;
}
function scoreBar(value) {
  const filled = Math.max(0, Math.min(20, Math.round(value / 5)));
  return `${"█".repeat(filled)}${"░".repeat(20 - filled)}`;
}
function renderTerminal(report, color) {
  const c = import_picocolors.default.createColors(color);
  const lines = [];
  lines.push(`${c.bold("patscope")} ${package_default.version}`);
  const label = (value) => c.dim(value.padEnd(11));
  lines.push(`${label("identity")} ${identityLine(report)}`);
  lines.push(`${label("token")} ${report.token.redacted} ${c.dim(`(${report.token.typeLabel})`)}`);
  lines.push(`${label("scopes")} ${report.token.scopes.length > 0 ? report.token.scopes.length : "none"}`);
  if (report.token.permissions.length > 0) {
    lines.push(`${label("permissions")} ${report.token.permissions.length} ${c.dim("(self-reported)")}`);
  }
  lines.push(`${label("source")} ${report.token.source}`);
  if (report.repositories.length > 0) {
    const accessible = report.repositories.filter((repo) => repo.accessible).length;
    lines.push(`${label("repos")} ${report.repositories.length} probed, ${accessible} accessible`);
  }
  if (report.orgs.length > 0) {
    const shown = report.orgs.slice(0, 5).map((org) => org.login);
    const suffix = report.orgs.length > 5 ? ` +${report.orgs.length - 5} more` : "";
    lines.push(`${label("orgs")} ${shown.join(", ")}${suffix}`);
  }
  if (report.rateLimit?.remaining != null && report.rateLimit.limit != null) {
    lines.push(`${label("rate limit")} ${report.rateLimit.remaining}/${report.rateLimit.limit}`);
  }
  lines.push("");
  if (!report.scoreKnown) {
    lines.push(`${c.bold("Blast radius")}  ${c.yellow("UNKNOWN")}  permissions are not exposed by this token type`);
  } else {
    const level = severityLabel(report.score.level);
    const badge = severityColor(c, report.score.level, level.padEnd(8));
    const raw = report.score.rawValue !== report.score.value ? c.dim(` (raw ${report.score.rawValue})`) : "";
    lines.push(`${c.bold("Blast radius")}  ${badge} ${scoreBar(report.score.value)} ${report.score.value}/100${raw}`);
  }
  if (report.capabilities.length > 0) {
    lines.push("");
    lines.push(c.bold("Top risks"));
    for (const capability of report.capabilities.slice(0, 5)) {
      lines.push(`  ${severityColor(c, capability.severity, "!")} ${c.bold(capability.title)} ${c.dim(`[${capability.id}]`)}`);
      lines.push(`    ${c.dim(capability.description)}`);
      lines.push(`    ${c.dim("granted by")} ${capability.matchedScopes.join(", ")}`);
    }
    lines.push("");
    lines.push(c.bold("Capabilities"));
    lines.push(`  ${c.dim("SEVERITY".padEnd(9))}${c.dim("CAPABILITY".padEnd(36))}${c.dim("GRANTED BY")}`);
    for (const capability of report.capabilities) {
      lines.push(`  ${severityColor(c, capability.severity, severityLabel(capability.severity).padEnd(9))}${truncate(capability.title, 35).padEnd(36)}${capability.matchedScopes.join(", ")}`);
    }
  } else {
    lines.push("");
    lines.push(c.green("No capabilities matched the known scope matrix."));
  }
  if (report.warnings.length > 0) {
    lines.push("");
    lines.push(c.bold("Warnings"));
    for (const warning of report.warnings) {
      lines.push(`  ${c.yellow("!")} ${warning}`);
    }
  }
  lines.push("");
  lines.push(c.dim(report.token.source === "offline" ? "Offline scan. No network requests were made." : "Local-only scan. The token was sent only to api.github.com."));
  return lines.join(`
`);
}

// src/report/index.ts
function renderReport(report, format, color) {
  switch (format) {
    case "terminal":
      return renderTerminal(report, color);
    case "markdown":
      return renderMarkdown(report);
    case "json":
      return renderJson(report);
    case "sarif":
      return renderSarif(report);
    default:
      throw new Error(`Unsupported report format: ${String(format)}`);
  }
}
function isReportFormat(value) {
  return value === "terminal" || value === "markdown" || value === "json" || value === "sarif";
}

// src/github.ts
var API_BASE = "https://api.github.com";
var USER_AGENT = `patscope/${package_default.version}`;
function errorMessage(data, status) {
  if (data && typeof data === "object" && "message" in data) {
    return String(data.message);
  }
  return `GitHub API returned HTTP ${status}`;
}

class GitHubClient {
  token;
  constructor(token) {
    this.token = token;
  }
  async request(path, init = {}) {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(15000),
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": USER_AGENT,
          ...init.headers ?? {}
        }
      });
      const text = await response.text();
      let data = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      }
      return {
        ok: response.ok,
        status: response.status,
        headers: response.headers,
        data,
        error: response.ok ? null : errorMessage(data, response.status)
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        status: 0,
        headers: new Headers,
        data: null,
        error: `Could not reach api.github.com: ${message}`
      };
    }
  }
  getUser() {
    return this.request("/user");
  }
  getOrgs() {
    return this.request("/user/orgs?per_page=100");
  }
  getInstallationRepositories() {
    return this.request("/installation/repositories?per_page=1");
  }
  getRepo(fullName) {
    const [owner, repo] = fullName.split("/");
    if (!owner || !repo) {
      return Promise.resolve({
        ok: false,
        status: 400,
        headers: new Headers,
        data: null,
        error: "Invalid repository name. Expected owner/repo."
      });
    }
    return this.request(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  }
}
function orgsFromResponse(orgs) {
  if (!orgs)
    return [];
  return orgs.map((org) => ({ login: org.login, role: org.role ?? null })).sort((a, b) => a.login.localeCompare(b.login));
}

// src/score.ts
var SEVERITY_WEIGHTS = {
  critical: 50,
  high: 20,
  medium: 8,
  low: 2
};
var SEVERITY_FLOORS = {
  critical: 70,
  high: 45,
  medium: 20,
  low: 0
};
var LEVEL_THRESHOLDS = [
  { minimum: 70, level: "critical" },
  { minimum: 45, level: "high" },
  { minimum: 20, level: "medium" },
  { minimum: 0, level: "low" }
];
function scoreLevel(value) {
  return LEVEL_THRESHOLDS.find((threshold) => value >= threshold.minimum)?.level ?? "low";
}
function evaluateCapabilities(capabilities) {
  const breakdown = capabilities.map((capability) => ({
    capability: capability.id,
    title: capability.title,
    severity: capability.severity,
    weight: SEVERITY_WEIGHTS[capability.severity]
  }));
  const rawValue = breakdown.reduce((sum, item) => sum + item.weight, 0);
  const highest = highestSeverity(capabilities);
  const floor = highest ? SEVERITY_FLOORS[highest] : 0;
  const value = Math.min(100, Math.max(rawValue, floor));
  const floorApplied = floor > rawValue;
  return {
    value,
    rawValue,
    level: scoreLevel(value),
    highestSeverity: highest,
    floorApplied,
    breakdown
  };
}
function severityAtLeast(value, threshold) {
  const order = ["low", "medium", "high", "critical"];
  return order.indexOf(value) >= order.indexOf(threshold);
}

// src/token.ts
var TOKEN_PREFIXES = [
  ["github_pat_", "fine-grained-pat"],
  ["ghp_", "classic-pat"],
  ["gho_", "oauth"],
  ["ghu_", "github-app-user"],
  ["ghs_", "github-app-server"],
  ["ghr_", "github-app-refresh"]
];
var TYPE_LABELS = {
  "classic-pat": "classic PAT",
  "fine-grained-pat": "fine-grained PAT",
  oauth: "OAuth access token",
  "github-app-user": "GitHub App user token",
  "github-app-server": "GitHub App server token",
  "github-app-refresh": "GitHub App refresh token",
  unknown: "unknown token type"
};
function detectTokenType(token) {
  for (const [prefix, type] of TOKEN_PREFIXES) {
    if (token.startsWith(prefix))
      return type;
  }
  return "unknown";
}
function tokenTypeLabel(type) {
  return TYPE_LABELS[type];
}
function redactToken(token) {
  const prefix = TOKEN_PREFIXES.find(([candidate]) => token.startsWith(candidate))?.[0];
  return prefix ? `${prefix}****...redacted` : "****...redacted";
}
function normalizeScopes(raw) {
  if (!raw)
    return [];
  return [...new Set(raw.split(",").map((scope) => scope.trim()).filter(Boolean))].sort();
}
function redactSecrets(text) {
  return text.replace(/\b(?:github_pat_[A-Za-z0-9_]{20,}|gh[pousr]_[A-Za-z0-9]{20,})\b/g, (match) => redactToken(match));
}

// src/scan.ts
var MAX_REPO_PROBES = 50;
var REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
function identityFromUser(user) {
  return {
    login: user.login,
    name: user.name ?? null,
    twoFactor: user.two_factor_authentication ?? null,
    publicRepos: user.public_repos ?? null,
    privateRepos: user.total_private_repos ?? null,
    plan: user.plan?.name ?? null
  };
}
function rateLimitFromHeaders(headers) {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");
  if (!limit && !remaining && !reset)
    return null;
  return {
    limit: limit ? Number(limit) : null,
    remaining: remaining ? Number(remaining) : null,
    reset: reset ? new Date(Number(reset) * 1000).toISOString() : null
  };
}
function validPermissions(grants) {
  const valid = [];
  const unknown = [];
  for (const grant of grants) {
    if (PERMISSION_DEFINITIONS[grant.permission]) {
      valid.push(grant);
    } else {
      unknown.push(grant);
    }
  }
  return { valid, unknown };
}
async function probeRepositories(client, repos) {
  const results = [];
  for (const fullName of repos) {
    if (!REPO_PATTERN.test(fullName) || fullName.split("/").some((part) => part === "." || part === "..")) {
      results.push({
        fullName,
        private: null,
        accessible: false,
        status: null,
        error: "Invalid repository name. Expected owner/repo."
      });
      continue;
    }
    const response = await client.getRepo(fullName);
    results.push({
      fullName,
      private: response.data?.private ?? null,
      accessible: response.ok,
      status: response.status,
      error: response.ok ? null : response.error
    });
  }
  return results;
}
function buildReport(options, data) {
  const capabilities = mergeCapabilities(resolveCapabilities(data.scopes), resolveCapabilitiesFromPermissions(data.permissions));
  const score = evaluateCapabilities(capabilities);
  const tokenValue = options.token ?? "";
  return {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    identity: data.identity,
    token: {
      type: data.tokenType,
      typeLabel: tokenTypeLabel(data.tokenType),
      redacted: tokenValue ? redactToken(tokenValue) : "(not provided)",
      scopes: data.scopes,
      permissions: data.permissions,
      source: options.source
    },
    orgs: data.orgs,
    repositories: data.repositories,
    capabilities,
    score,
    warnings: data.warnings,
    rateLimit: data.rateLimit,
    scoreKnown: data.scoreKnown
  };
}
function offlineReport(options) {
  const scopes = [...new Set(options.scopes ?? [])].sort();
  const { valid: permissions, unknown: unknownPermissions } = validPermissions(options.permissions ?? []);
  const warnings = [
    "Offline mode: capabilities are computed only from the scopes and permissions you provided. No API calls were made."
  ];
  if (scopes.length === 0 && permissions.length === 0) {
    warnings.push("No scopes or permissions were provided, so no capabilities could be evaluated.");
  }
  const unknownScopes = scopes.filter((scope) => !SCOPE_DEFINITIONS[scope]);
  if (unknownScopes.length > 0) {
    warnings.push(`Unknown scopes were ignored: ${unknownScopes.join(", ")}.`);
  }
  if (unknownPermissions.length > 0) {
    warnings.push(`Unknown permissions were ignored: ${unknownPermissions.map((grant) => `${grant.permission}=${grant.access}`).join(", ")}.`);
  }
  const identity = options.login ? {
    login: options.login,
    name: null,
    twoFactor: null,
    publicRepos: null,
    privateRepos: null,
    plan: null
  } : null;
  return buildReport(options, {
    identity,
    tokenType: options.tokenType ?? "unknown",
    scopes,
    permissions,
    repositories: [],
    orgs: [],
    warnings,
    rateLimit: null,
    scoreKnown: true
  });
}
async function scanToken(options) {
  if (options.offline)
    return offlineReport(options);
  const token = options.token?.trim();
  if (!token) {
    throw new Error("No token found. Set GH_TOKEN or GITHUB_TOKEN, use --gh-account <name>, or pipe a token with --token-stdin.");
  }
  const tokenType = options.tokenType ?? detectTokenType(token);
  if (tokenType === "github-app-refresh") {
    throw new Error("Refresh tokens cannot be scanned. Use the corresponding access token instead.");
  }
  const client = new GitHubClient(token);
  const warnings = [];
  const userResponse = await client.getUser();
  const { valid: suppliedPermissions, unknown: unknownPermissions } = validPermissions(options.permissions ?? []);
  if (unknownPermissions.length > 0) {
    warnings.push(`Unknown permissions were ignored: ${unknownPermissions.map((grant) => `${grant.permission}=${grant.access}`).join(", ")}.`);
  }
  if (userResponse.status === 401) {
    throw new Error("GitHub rejected the token (401). It may be expired, revoked or mistyped.");
  }
  if (!userResponse.ok) {
    if (tokenType === "github-app-server") {
      const repositories = await client.getInstallationRepositories();
      if (repositories.ok) {
        const count = repositories.data?.total_count ?? 0;
        warnings.push(`GitHub App installation token detected. Repository access: ${count} repositor${count === 1 ? "y" : "ies"}. Installation permissions are not exposed by the API in v0.2.`);
        return buildReport(options, {
          identity: null,
          tokenType,
          scopes: [],
          permissions: suppliedPermissions,
          repositories: [],
          orgs: [],
          warnings,
          rateLimit: rateLimitFromHeaders(userResponse.headers),
          scoreKnown: suppliedPermissions.length > 0
        });
      }
    }
    const sso = userResponse.headers.get("x-github-sso");
    if (sso) {
      warnings.push(`SSO authorization may be required: ${sso}`);
    }
    throw new Error(userResponse.error ?? "GitHub rejected the token.");
  }
  const user = userResponse.data;
  if (!user) {
    throw new Error("GitHub returned an empty user response.");
  }
  const scopes = normalizeScopes(userResponse.headers.get("x-oauth-scopes"));
  const acceptedPermissions = userResponse.headers.get("x-accepted-github-permissions");
  const suppliedScopes = options.scopes ?? [];
  const apiScopes = tokenType === "fine-grained-pat" ? [] : scopes;
  const effectiveScopes = suppliedScopes.length > 0 ? [...new Set([...apiScopes, ...suppliedScopes])].sort() : apiScopes;
  if (suppliedScopes.length > 0) {
    warnings.push(`Additional scopes were supplied with --scopes: ${suppliedScopes.join(", ")}. The report combines them with scopes returned by GitHub.`);
  }
  if (tokenType === "fine-grained-pat") {
    warnings.push(suppliedPermissions.length > 0 ? "Fine-grained PAT permissions are self-reported via --permissions and cannot be verified through the GitHub API." : "Fine-grained PAT permissions are not exposed by the GitHub API. Use --permissions to provide them; without them the score is marked unknown.");
    if (acceptedPermissions) {
      warnings.push(`GitHub reported accepted permissions for /user: ${acceptedPermissions}`);
    }
  } else if ((tokenType === "classic-pat" || tokenType === "oauth") && scopes.length === 0) {
    warnings.push("GitHub returned no OAuth scopes. The token may have no scopes, or this may be a fine-grained/app token.");
  } else if (tokenType === "unknown") {
    warnings.push("Unrecognized token prefix. patscope treated it as a classic token and read the OAuth scopes returned by GitHub.");
  }
  const unknownScopes = effectiveScopes.filter((scope) => !SCOPE_DEFINITIONS[scope]);
  if (unknownScopes.length > 0) {
    warnings.push(`Unknown scopes were ignored: ${unknownScopes.join(", ")}.`);
  }
  let repoList = [...new Set((options.repos ?? []).map((repo) => repo.trim()).filter(Boolean))];
  if (repoList.length > MAX_REPO_PROBES) {
    warnings.push(`Only the first ${MAX_REPO_PROBES} repositories were probed; ${repoList.length - MAX_REPO_PROBES} were skipped.`);
    repoList = repoList.slice(0, MAX_REPO_PROBES);
  }
  const repositories = await probeRepositories(client, repoList);
  const orgsResponse = await client.getOrgs();
  if (!orgsResponse.ok) {
    warnings.push(`Could not read organization membership: ${orgsResponse.error ?? "unknown error"}`);
  }
  const scoreKnown = tokenType === "classic-pat" || tokenType === "oauth" || tokenType === "unknown" && scopes.length > 0 || suppliedScopes.length > 0 || suppliedPermissions.length > 0;
  return buildReport(options, {
    identity: identityFromUser(user),
    tokenType,
    scopes: effectiveScopes,
    permissions: suppliedPermissions,
    repositories,
    orgs: orgsFromResponse(orgsResponse.data),
    warnings,
    rateLimit: rateLimitFromHeaders(userResponse.headers),
    scoreKnown
  });
}

// src/types.ts
var SEVERITIES = ["low", "medium", "high", "critical"];

// src/action.ts
function input(name, fallback = "") {
  return (process.env[`INPUT_${name.toUpperCase()}`] ?? fallback).trim();
}
function parseSeverity(raw) {
  const value = raw.trim().toLowerCase();
  if (!SEVERITIES.includes(value)) {
    throw new Error(`Invalid fail-on value "${raw}". Expected one of: ${SEVERITIES.join(", ")}.`);
  }
  return value;
}
function parseActionFormat(raw) {
  const value = raw.trim().toLowerCase();
  if (!isReportFormat(value) || value === "terminal") {
    throw new Error(`Invalid format "${raw}". Expected markdown, json or sarif.`);
  }
  return value;
}
function setOutput(name, value) {
  const outputFile = process.env.GITHUB_OUTPUT;
  if (!outputFile)
    return;
  import_node_fs.appendFileSync(outputFile, `${name}=${value}
`, "utf8");
}
async function appendSummary(markdown) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile)
    return;
  await import_promises.appendFile(summaryFile, `${markdown}
`, "utf8");
}
async function runAction(options = {}) {
  const token = input("token");
  if (!token) {
    throw new Error("Input 'token' is required. Use a dedicated, low-privilege token.");
  }
  const failOn = parseSeverity(input("fail-on", "high"));
  const format = parseActionFormat(input("format", "markdown"));
  const outputFile = input("output-file") || (format === "sarif" ? "patscope-report.sarif" : "patscope-report.md");
  const permissionsInput = input("permissions");
  const reposInput = input("repos");
  const parsedPermissions = permissionsInput ? parsePermissionInput(permissionsInput) : { grants: [], errors: [] };
  if (parsedPermissions.errors.length > 0) {
    throw new Error(parsedPermissions.errors.join(" "));
  }
  const repos = reposInput ? reposInput.split(/[\s,]+/).map((repo) => repo.trim()).filter(Boolean) : undefined;
  try {
    const report = await scanToken({
      token,
      permissions: parsedPermissions.grants,
      repos,
      source: "github-action",
      offline: false
    });
    const output = renderReport(report, format, false);
    await import_promises.writeFile(outputFile, `${output}
`, "utf8");
    const markdown = format === "markdown" ? output : renderReport(report, "markdown", false);
    await appendSummary(markdown);
    if (!options.silent) {
      process.stdout.write(`${markdown}
`);
    }
    setOutput("score", String(report.score.value));
    setOutput("level", report.score.level);
    setOutput("report", outputFile);
    if (report.scoreKnown && severityAtLeast(report.score.level, failOn)) {
      if (!options.silent) {
        process.stderr.write(`patscope: score ${report.score.value}/100 (${report.score.level}) meets or exceeds fail-on=${failOn}
`);
      }
      process.exitCode = 1;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(redactSecrets(message));
  }
}

// src/action-entry.ts
runAction().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`patscope: ${message}
`);
  process.exitCode = 1;
});
