import { resolveCapabilities } from "./capabilities";
import { GitHubClient, orgsFromResponse, type GitHubUser } from "./github";
import { evaluateCapabilities } from "./score";
import { SCOPE_DEFINITIONS } from "./scopes";
import { detectTokenType, normalizeScopes, redactToken, tokenTypeLabel } from "./token";
import type {
  Identity,
  Org,
  RateLimitInfo,
  Report,
  ScanOptions,
  ScoreResult,
  TokenType,
} from "./types";

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

function buildReport(
  options: ScanOptions,
  data: {
    identity: Identity | null;
    tokenType: TokenType;
    scopes: string[];
    orgs: Org[];
    warnings: string[];
    rateLimit: RateLimitInfo | null;
    scoreKnown: boolean;
  },
): Report {
  const capabilities = resolveCapabilities(data.scopes);
  const score: ScoreResult = evaluateCapabilities(capabilities);
  const tokenValue = options.token ?? "";

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    identity: data.identity,
    token: {
      type: data.tokenType,
      typeLabel: tokenTypeLabel(data.tokenType),
      redacted: tokenValue ? redactToken(tokenValue) : "(not provided)",
      scopes: data.scopes,
      source: options.source,
    },
    orgs: data.orgs,
    capabilities,
    score,
    warnings: data.warnings,
    rateLimit: data.rateLimit,
    scoreKnown: data.scoreKnown,
  };
}

function offlineReport(options: ScanOptions): Report {
  const scopes = [...new Set(options.scopes ?? [])].sort();
  const warnings: string[] = [
    "Offline mode: capabilities are computed only from the scopes you provided. No API calls were made.",
  ];

  const unknown = scopes.filter((scope) => !SCOPE_DEFINITIONS[scope]);
  if (unknown.length > 0) {
    warnings.push(`Unknown scopes were ignored: ${unknown.join(", ")}.`);
  }
  if (scopes.length === 0) {
    warnings.push("No scopes were provided, so no capabilities could be evaluated.");
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

  if (userResponse.status === 401) {
    throw new Error("GitHub rejected the token (401). It may be expired, revoked or mistyped.");
  }

  if (!userResponse.ok) {
    if (tokenType === "github-app-server") {
      const repositories = await client.getInstallationRepositories();
      if (repositories.ok) {
        const count = repositories.data?.total_count ?? 0;
        warnings.push(
          `GitHub App installation token detected. Repository access: ${count} repositor${count === 1 ? "y" : "ies"}. Installation permissions are not exposed by the API in v0.1.`,
        );
        return buildReport(options, {
          identity: null,
          tokenType,
          scopes: [],
          orgs: [],
          warnings,
          rateLimit: rateLimitFromHeaders(userResponse.headers),
          scoreKnown: false,
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
  const effectiveScopes =
    suppliedScopes.length > 0
      ? [...new Set([...scopes, ...suppliedScopes])].sort()
      : scopes;

  if (suppliedScopes.length > 0) {
    warnings.push(
      `Additional scopes were supplied with --scopes: ${suppliedScopes.join(", ")}. The report combines them with scopes returned by GitHub.`,
    );
  }

  if (tokenType === "fine-grained-pat") {
    warnings.push(
      "Fine-grained PAT permissions are not exposed by the GitHub API. v0.1 reports the token type and identity only; use --offline --scopes to evaluate known permissions.",
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

  const unknown = effectiveScopes.filter((scope) => !SCOPE_DEFINITIONS[scope]);
  if (unknown.length > 0) {
    warnings.push(`Unknown scopes were ignored: ${unknown.join(", ")}.`);
  }

  const orgsResponse = await client.getOrgs();
  if (!orgsResponse.ok) {
    warnings.push(`Could not read organization membership: ${orgsResponse.error ?? "unknown error"}`);
  }

  const scoreKnown =
    tokenType === "classic-pat" ||
    tokenType === "oauth" ||
    (tokenType === "unknown" && scopes.length > 0) ||
    suppliedScopes.length > 0;

  return buildReport(options, {
    identity: identityFromUser(user),
    tokenType,
    scopes: effectiveScopes,
    orgs: orgsFromResponse(orgsResponse.data),
    warnings,
    rateLimit: rateLimitFromHeaders(userResponse.headers),
    scoreKnown,
  });
}
