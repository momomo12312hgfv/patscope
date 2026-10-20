import {
  mergeCapabilities,
  resolveCapabilities,
  resolveCapabilitiesFromPermissions,
} from "./capabilities";
import { GitHubClient, orgsFromResponse, type GitHubUser } from "./github";
import { PERMISSION_DEFINITIONS } from "./permissions";
import { evaluateCapabilities } from "./score";
import { SCOPE_DEFINITIONS } from "./scopes";
import { detectTokenType, normalizeScopes, redactToken, tokenTypeLabel } from "./token";
import type {
  Identity,
  Org,
  PermissionGrant,
  RateLimitInfo,
  Report,
  RepositoryInfo,
  ScanOptions,
  ScoreResult,
  TokenType,
} from "./types";

const MAX_REPO_PROBES = 50;
const REPO_PATTERN = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

function identityFromUser(user: GitHubUser): Identity {
  return {
    login: user.login,
    name: user.name ?? null,
    twoFactor: user.two_factor_authentication ?? null,
    publicRepos: user.public_repos ?? null,
    privateRepos: user.total_private_repos ?? null,
    plan: user.plan?.name ?? null,
  };
}

function rateLimitFromHeaders(headers: Headers): RateLimitInfo | null {
  const limit = headers.get("x-ratelimit-limit");
  const remaining = headers.get("x-ratelimit-remaining");
  const reset = headers.get("x-ratelimit-reset");

  if (!limit && !remaining && !reset) return null;

  return {
    limit: limit ? Number(limit) : null,
    remaining: remaining ? Number(remaining) : null,
    reset: reset ? new Date(Number(reset) * 1000).toISOString() : null,
  };
}

function validPermissions(grants: PermissionGrant[]): {
  valid: PermissionGrant[];
  unknown: PermissionGrant[];
} {
  const valid: PermissionGrant[] = [];
  const unknown: PermissionGrant[] = [];

  for (const grant of grants) {
    if (PERMISSION_DEFINITIONS[grant.permission]) {
      valid.push(grant);
    } else {
      unknown.push(grant);
    }
  }

  return { valid, unknown };
}

async function probeRepositories(
  client: GitHubClient,
  repos: string[],
): Promise<RepositoryInfo[]> {
  const results: RepositoryInfo[] = [];

  for (const fullName of repos) {
    if (
      !REPO_PATTERN.test(fullName) ||
      fullName.split("/").some((part) => part === "." || part === "..")
    ) {
      results.push({
        fullName,
        private: null,
        accessible: false,
        status: null,
        error: "Invalid repository name. Expected owner/repo.",
      });
      continue;
    }

    const response = await client.getRepo(fullName);
    results.push({
      fullName,
      private: response.data?.private ?? null,
      accessible: response.ok,
      status: response.status,
      error: response.ok ? null : response.error,
    });
  }

  return results;
}

function buildReport(
  options: ScanOptions,
  data: {
    identity: Identity | null;
    tokenType: TokenType;
    scopes: string[];
    permissions: PermissionGrant[];
    repositories: RepositoryInfo[];
    orgs: Org[];
    warnings: string[];
    rateLimit: RateLimitInfo | null;
    scoreKnown: boolean;
  },
): Report {
  const capabilities = mergeCapabilities(
    resolveCapabilities(data.scopes),
    resolveCapabilitiesFromPermissions(data.permissions),
  );
  const score: ScoreResult = evaluateCapabilities(capabilities);
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
      source: options.source,
    },
    orgs: data.orgs,
    repositories: data.repositories,
    capabilities,
    score,
    warnings: data.warnings,
    rateLimit: data.rateLimit,
    scoreKnown: data.scoreKnown,
  };
}

function offlineReport(options: ScanOptions): Report {
  const scopes = [...new Set(options.scopes ?? [])].sort();
  const { valid: permissions, unknown: unknownPermissions } = validPermissions(
    options.permissions ?? [],
  );
  const warnings: string[] = [
    "Offline mode: capabilities are computed only from the scopes and permissions you provided. No API calls were made.",
  ];

  if (scopes.length === 0 && permissions.length === 0) {
    warnings.push("No scopes or permissions were provided, so no capabilities could be evaluated.");
  }

  const unknownScopes = scopes.filter((scope) => !SCOPE_DEFINITIONS[scope]);
  if (unknownScopes.length > 0) {
    warnings.push(`Unknown scopes were ignored: ${unknownScopes.join(", ")}.`);
  }
  if (unknownPermissions.length > 0) {
    warnings.push(
      `Unknown permissions were ignored: ${unknownPermissions
        .map((grant) => `${grant.permission}=${grant.access}`)
        .join(", ")}.`,
    );
  }

  const identity: Identity | null = options.login
    ? {
        login: options.login,
        name: null,
        twoFactor: null,
        publicRepos: null,
        privateRepos: null,
        plan: null,
      }
    : null;

  return buildReport(options, {
    identity,
    tokenType: options.tokenType ?? "unknown",
    scopes,
    permissions,
    repositories: [],
    orgs: [],
    warnings,
    rateLimit: null,
    scoreKnown: true,
  });
}

export async function scanToken(options: ScanOptions): Promise<Report> {
  if (options.offline) return offlineReport(options);

  const token = options.token?.trim();
  if (!token) {
    throw new Error(
      "No token found. Set GH_TOKEN or GITHUB_TOKEN, use --gh-account <name>, or pipe a token with --token-stdin.",
    );
  }

  const tokenType = options.tokenType ?? detectTokenType(token);
  if (tokenType === "github-app-refresh") {
    throw new Error(
      "Refresh tokens cannot be scanned. Use the corresponding access token instead.",
    );
  }

  const client = new GitHubClient(token);
  const warnings: string[] = [];
  const userResponse = await client.getUser();
  const { valid: suppliedPermissions, unknown: unknownPermissions } = validPermissions(
    options.permissions ?? [],
  );

  if (unknownPermissions.length > 0) {
    warnings.push(
      `Unknown permissions were ignored: ${unknownPermissions
        .map((grant) => `${grant.permission}=${grant.access}`)
        .join(", ")}.`,
    );
  }

  if (userResponse.status === 401) {
    throw new Error("GitHub rejected the token (401). It may be expired, revoked or mistyped.");
  }

  if (!userResponse.ok) {
    if (tokenType === "github-app-server") {
      const repositories = await client.getInstallationRepositories();
      if (repositories.ok) {
        const count = repositories.data?.total_count ?? 0;
        warnings.push(
          `GitHub App installation token detected. Repository access: ${count} repositor${count === 1 ? "y" : "ies"}. Installation permissions are not exposed by the API in v0.2.`,
        );
        return buildReport(options, {
          identity: null,
          tokenType,
          scopes: [],
          permissions: suppliedPermissions,
          repositories: [],
          orgs: [],
          warnings,
          rateLimit: rateLimitFromHeaders(userResponse.headers),
          scoreKnown: suppliedPermissions.length > 0,
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
  const effectiveScopes =
    suppliedScopes.length > 0
      ? [...new Set([...apiScopes, ...suppliedScopes])].sort()
      : apiScopes;

  if (suppliedScopes.length > 0) {
    warnings.push(
      `Additional scopes were supplied with --scopes: ${suppliedScopes.join(", ")}. The report combines them with scopes returned by GitHub.`,
    );
  }

  if (tokenType === "fine-grained-pat") {
    warnings.push(
      suppliedPermissions.length > 0
        ? "Fine-grained PAT permissions are self-reported via --permissions and cannot be verified through the GitHub API."
        : "Fine-grained PAT permissions are not exposed by the GitHub API. Use --permissions to provide them; without them the score is marked unknown.",
    );
    if (acceptedPermissions) {
      warnings.push(`GitHub reported accepted permissions for /user: ${acceptedPermissions}`);
    }
  } else if ((tokenType === "classic-pat" || tokenType === "oauth") && scopes.length === 0) {
    warnings.push(
      "GitHub returned no OAuth scopes. The token may have no scopes, or this may be a fine-grained/app token.",
    );
  } else if (tokenType === "unknown") {
    warnings.push(
      "Unrecognized token prefix. patscope treated it as a classic token and read the OAuth scopes returned by GitHub.",
    );
  }

  const unknownScopes = effectiveScopes.filter((scope) => !SCOPE_DEFINITIONS[scope]);
  if (unknownScopes.length > 0) {
    warnings.push(`Unknown scopes were ignored: ${unknownScopes.join(", ")}.`);
  }

  let repoList = [...new Set((options.repos ?? []).map((repo) => repo.trim()).filter(Boolean))];
  if (repoList.length > MAX_REPO_PROBES) {
    warnings.push(
      `Only the first ${MAX_REPO_PROBES} repositories were probed; ${repoList.length - MAX_REPO_PROBES} were skipped.`,
    );
    repoList = repoList.slice(0, MAX_REPO_PROBES);
  }
  const repositories = await probeRepositories(client, repoList);

  const orgsResponse = await client.getOrgs();
  if (!orgsResponse.ok) {
    warnings.push(`Could not read organization membership: ${orgsResponse.error ?? "unknown error"}`);
  }

  const scoreKnown =
    tokenType === "classic-pat" ||
    tokenType === "oauth" ||
    (tokenType === "unknown" && scopes.length > 0) ||
    suppliedScopes.length > 0 ||
    suppliedPermissions.length > 0;

  return buildReport(options, {
    identity: identityFromUser(user),
    tokenType,
    scopes: effectiveScopes,
    permissions: suppliedPermissions,
    repositories,
    orgs: orgsFromResponse(orgsResponse.data),
    warnings,
    rateLimit: rateLimitFromHeaders(userResponse.headers),
    scoreKnown,
  });
}
