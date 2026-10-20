import { Command } from "commander";
import { parsePermissionInput } from "../permissions";
import { renderReport, isReportFormat } from "../report";
import { scanToken } from "../scan";
import { severityAtLeast } from "../score";
import { SEVERITIES, type TokenType } from "../types";
import { getGhToken, parseScopeInput, readStdin, redactSecrets } from "../token";

interface ScanCliOptions {
  tokenStdin?: boolean;
  ghAccount?: string;
  offline?: boolean;
  scopes?: string;
  permissions?: string;
  repos?: string;
  login?: string;
  tokenType?: string;
  format: string;
  sarifLocation: string;
  failOn?: string;
  color: boolean;
}

const TOKEN_TYPES: TokenType[] = [
  "classic-pat",
  "fine-grained-pat",
  "oauth",
  "github-app-user",
  "github-app-server",
  "github-app-refresh",
  "unknown",
];

function parseTokenType(raw: string | undefined): TokenType | undefined {
  if (!raw) return undefined;
  if (!TOKEN_TYPES.includes(raw as TokenType)) {
    throw new Error(`Invalid token type "${raw}". Expected one of: ${TOKEN_TYPES.join(", ")}.`);
  }
  return raw as TokenType;
}

function parseSeverity(raw: string | undefined): (typeof SEVERITIES)[number] | undefined {
  if (!raw) return undefined;
  if (!SEVERITIES.includes(raw as (typeof SEVERITIES)[number])) {
    throw new Error(`Invalid severity "${raw}". Expected one of: ${SEVERITIES.join(", ")}.`);
  }
  return raw as (typeof SEVERITIES)[number];
}

export function registerScan(program: Command): void {
  program
    .command("scan")
    .description("Scan a GitHub token and report its blast radius")
    .option("--token-stdin", "read the token from stdin")
    .option("--gh-account <name>", "read the token from the gh CLI keyring for this account")
    .option("--offline", "do not call the GitHub API; evaluate --scopes and --permissions instead")
    .option("--scopes <scopes>", "comma-separated classic scopes for offline mode, or extra scopes online")
    .option("--permissions <permissions>", "fine-grained permissions, e.g. contents=write,metadata=read")
    .option("--repos <repos>", "comma-separated owner/repo list to probe for read access")
    .option("--login <login>", "login name to display in offline mode")
    .option("--token-type <type>", "override token type detection")
    .option("--format <format>", "output format: terminal, markdown, json or sarif", "terminal")
    .option("--sarif-location <path>", "file path used for SARIF physical locations", "patscope-report.md")
    .option("--fail-on <severity>", "exit with code 2 when the score is at or above this severity")
    .option("--no-color", "disable ANSI colors")
    .action(async (options: ScanCliOptions) => {
      if (options.tokenStdin && options.ghAccount) {
        throw new Error("Use either --token-stdin or --gh-account, not both.");
      }
      if (!isReportFormat(options.format)) {
        throw new Error(`Invalid format "${options.format}". Expected terminal, markdown, json or sarif.`);
      }

      const failOn = parseSeverity(options.failOn);
      const tokenType = parseTokenType(options.tokenType);
      const scopes = options.scopes ? parseScopeInput(options.scopes) : undefined;
      const repos = options.repos
        ? options.repos.split(/[\s,]+/).map((repo) => repo.trim()).filter(Boolean)
        : undefined;

      let permissions;
      if (options.permissions) {
        const parsed = parsePermissionInput(options.permissions);
        if (parsed.errors.length > 0) {
          throw new Error(parsed.errors.join(" "));
        }
        permissions = parsed.grants;
      }

      let token: string | undefined;
      let source = "offline";

      if (!options.offline) {
        if (options.tokenStdin) {
          token = await readStdin();
          source = "stdin";
        } else if (options.ghAccount) {
          token = getGhToken(options.ghAccount);
          source = `gh:${options.ghAccount}`;
        } else if (process.env.GH_TOKEN) {
          token = process.env.GH_TOKEN;
          source = "env:GH_TOKEN";
        } else if (process.env.GITHUB_TOKEN) {
          token = process.env.GITHUB_TOKEN;
          source = "env:GITHUB_TOKEN";
        } else {
          throw new Error(
            "No token found. Set GH_TOKEN or GITHUB_TOKEN, use --gh-account <name>, or pipe a token with --token-stdin.",
          );
        }

        if (!token.trim()) {
          throw new Error(`The token read from ${source} is empty.`);
        }
      }

      const report = await scanToken({
        token,
        tokenType,
        scopes,
        permissions,
        repos,
        login: options.login,
        source,
        offline: Boolean(options.offline),
      });

      const color =
        options.color !== false &&
        options.format === "terminal" &&
        Boolean(process.stdout.isTTY);

      process.stdout.write(`${renderReport(report, options.format, color, {
        sarifLocation: options.sarifLocation,
      })}\n`);

      if (failOn && report.scoreKnown && severityAtLeast(report.score.level, failOn)) {
        process.exitCode = 2;
      }
    })
    .addHelpText(
      "after",
      `
Examples:
  $ GH_TOKEN=ghp_... patscope scan
  $ patscope scan --gh-account momomo12312hgfv --format markdown
  $ cat token.txt | patscope scan --token-stdin --format json
  $ patscope scan --offline --scopes repo,workflow,delete_repo --login octocat
  $ patscope scan --permissions contents=write,pull_requests=write,metadata=read
  $ patscope scan --repos owner/repo,owner/other --permissions contents=read
  $ patscope scan --format sarif > patscope.sarif
`,
    );
}

export function formatError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return redactSecrets(message);
}
