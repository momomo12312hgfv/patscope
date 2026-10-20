import type { Org } from "./types";

const API_BASE = "https://api.github.com";
const USER_AGENT = "patscope/0.1.0";

export interface GitHubUser {
  login: string;
  name: string | null;
  email: string | null;
  two_factor_authentication: boolean | null;
  public_repos: number | null;
  total_private_repos: number | null;
  plan?: { name?: string | null } | null;
}

export interface GitHubOrg {
  login: string;
  role?: string | null;
}

export interface InstallationRepositories {
  total_count: number;
  repositories: Array<{ full_name: string }>;
}

export interface ApiResponse<T> {
  ok: boolean;
  status: number;
  headers: Headers;
  data: T | null;
  error: string | null;
}

function errorMessage(data: unknown, status: number): string {
  if (data && typeof data === "object" && "message" in data) {
    return String((data as { message: unknown }).message);
  }
  return `GitHub API returned HTTP ${status}`;
}

export class GitHubClient {
  constructor(private readonly token: string) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(15_000),
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${this.token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          "User-Agent": USER_AGENT,
          ...(init.headers ?? {}),
        },
      });

      const text = await response.text();
      let data: unknown = null;
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
        data: data as T | null,
        error: response.ok ? null : errorMessage(data, response.status),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        ok: false,
        status: 0,
        headers: new Headers(),
        data: null,
        error: `Could not reach api.github.com: ${message}`,
      };
    }
  }

  getUser(): Promise<ApiResponse<GitHubUser>> {
    return this.request<GitHubUser>("/user");
  }

  getOrgs(): Promise<ApiResponse<GitHubOrg[]>> {
    return this.request<GitHubOrg[]>("/user/orgs?per_page=100");
  }

  getInstallationRepositories(): Promise<ApiResponse<InstallationRepositories>> {
    return this.request<InstallationRepositories>("/installation/repositories?per_page=1");
  }
}

export function orgsFromResponse(orgs: GitHubOrg[] | null): Org[] {
  if (!orgs) return [];
  return orgs
    .map((org) => ({ login: org.login, role: org.role ?? null }))
    .sort((a, b) => a.login.localeCompare(b.login));
}
