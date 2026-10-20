# patscope

> See the blast radius of your GitHub token — and shrink it.

[![CI](https://github.com/momomo12312hgfv/patscope/actions/workflows/ci.yml/badge.svg)](https://github.com/momomo12312hgfv/patscope/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/momomo12312hgfv/patscope)](https://github.com/momomo12312hgfv/patscope/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

`gh auth status` tells you which scopes a GitHub token has. It does not tell you what those scopes actually mean.

`patscope` turns a token into a readable capability map, a blast-radius score, and a least-privilege recipe. It runs locally, never prints the token, and only talks to `api.github.com`.

v0.2 adds fine-grained PAT support, repository access probes, SARIF output, and a GitHub Action that can fail a workflow when a token is too risky.

## Demo

```text
$ patscope scan --gh-account octocat \
    --permissions contents=write,pull_requests=write,metadata=read

patscope 0.2.0
identity    @octocat
token       github_pat_****...redacted (fine-grained PAT)
scopes      none
permissions 3 (self-reported)
source      gh:octocat

Blast radius  HIGH  █████████░░░░░░░░░░░ 45/100 (raw 22)

Top risks
  ! Write repository contents [code:write]
    Push commits, rewrite branches, edit issues and pull requests, and publish releases.
    granted by repo.contents=write, repo.pull_requests=write
  ! Read repository contents [code:read]
    Read source code, commits, branches, issues and pull requests.
    granted by repo.contents=write, repo.pull_requests=write

Local-only scan. The token was sent only to api.github.com.
```

## Why

Tokens are invisible power. A token with `repo`, `workflow` and `delete_repo` can read every private repository, change CI, and destroy the repository entirely. Fine-grained PATs are smaller, but their permissions are not exposed through the GitHub API, so developers still have to reason about them manually.

`patscope` answers three questions:

1. What can this token do if it leaks?
2. Which scopes or permissions are responsible?
3. What is the smallest token that still does my job?

## Install

### Download a binary

Grab the binary for your platform from [Releases](https://github.com/momomo12312hgfv/patscope/releases):

- `patscope-linux-x64`
- `patscope-linux-arm64`
- `patscope-darwin-x64`
- `patscope-darwin-arm64`
- `patscope-windows-x64.exe`

On macOS and Linux:

```bash
chmod +x patscope-*
sudo mv patscope-* /usr/local/bin/patscope
```

The binaries are self-contained and include the Bun runtime, so they are roughly 60–85 MB.

### From source

Requires [Bun](https://bun.sh) 1.2 or newer.

```bash
git clone https://github.com/momomo12312hgfv/patscope.git
cd patscope
bun install
bun run build
./dist/patscope --help
```

On Windows the binary is `dist\patscope.exe`.

## Usage

```bash
# Scan the active gh CLI account
patscope scan --gh-account octocat

# Scan a classic PAT from the environment
GH_TOKEN=ghp_... patscope scan

# Read a token from stdin (keeps it out of shell history)
cat token.txt | patscope scan --token-stdin

# Fine-grained PAT: provide the permissions you granted
patscope scan --token-stdin \
  --permissions contents=write,pull_requests=write,metadata=read

# Probe read access to specific repositories
patscope scan --repos owner/repo,owner/other --permissions contents=read

# Markdown report for a README or an issue
patscope scan --format markdown > report.md

# SARIF for code scanning or another SARIF consumer
patscope scan --format sarif > patscope.sarif

# Fail CI when the token is high risk or worse
patscope scan --fail-on high

# Evaluate permissions without making any network requests
patscope scan --offline \
  --permissions contents=write,workflows=write,metadata=read \
  --login octocat

# Explain a classic scope or a fine-grained permission
patscope explain repo
patscope explain contents=write
patscope explain --permissions

# Show a least-privilege recipe
patscope recipe push
patscope recipe ci
patscope recipe release
```

### Fine-grained permissions

GitHub does not expose a fine-grained PAT's permissions through the API. patscope therefore treats `--permissions` as **self-reported** and labels it that way in every report.

Permission names are namespaced by resource:

```bash
--permissions repo.contents=write,repo.workflows=write,repo.metadata=read
```

Short names such as `contents=write` work when they are unambiguous. Use the full name when the same short name exists in more than one resource, for example `repo.administration` versus `org.administration`.

See [docs/permission-matrix.md](docs/permission-matrix.md) for the full list.

### Repository probes

`--repos owner/repo` performs a read-only `GET /repos/{owner}/{repo}` for each repository and reports whether the token can see it. patscope does not test writes, deletes, or any destructive action.

### GitHub Action

```yaml
name: Token check

on:
  workflow_dispatch:

permissions:
  contents: read
  security-events: write

jobs:
  patscope:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: momomo12312hgfv/patscope@v0.2.0
        with:
          token: ${{ secrets.PAT_TO_SCAN }}
          fail-on: high
          format: sarif
          output-file: patscope.sarif
          permissions: contents=read,metadata=read
      - uses: github/codeql-action/upload-sarif@v4
        if: always()
        with:
          sarif_file: patscope.sarif
```

The action writes a Markdown report to the job summary, sets `score`, `level` and `report` outputs, and fails the job when the threshold is reached. See [docs/action.md](docs/action.md) for details.

### Output formats

| Format | Use case |
| --- | --- |
| `terminal` | Human-readable scan (default) |
| `markdown` | Paste into an issue, PR or report |
| `json` | Automation, dashboards, custom checks. See [docs/report-schema.md](docs/report-schema.md). |
| `sarif` | Code scanning and other SARIF consumers |

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Scan completed and did not cross the `--fail-on` threshold |
| `1` | Invalid input, token rejected, or network/API error |
| `2` | Score is at or above the `--fail-on` threshold |

## What it checks

- Token type (classic PAT, fine-grained PAT, OAuth, GitHub App token)
- Classic OAuth scopes and the capabilities they grant
- Self-reported fine-grained permissions and the capabilities they grant
- Identity, plan and organization membership (read-only)
- Optional read-only repository access probes
- Current API rate limit
- Unknown scopes, permissions and unsupported token types
- A weighted blast-radius score with a per-capability breakdown

`patscope` does **not** read repository contents, download code, or modify anything. It only performs read-only `GET` requests.

## Scoring

| Severity | Weight | Minimum score floor |
| --- | --- | --- |
| critical | 50 | 70 |
| high | 20 | 45 |
| medium | 8 | 20 |
| low | 2 | 0 |

The score is capped at 100. The final value is the greater of the weighted sum and the floor for the highest-severity capability. This keeps a single critical capability (such as `delete_repo`) from looking harmless.

The score is a communication tool, not a CVSS replacement. Every finding includes the scopes or permissions that granted it so you can verify the result yourself. See [docs/scope-matrix.md](docs/scope-matrix.md) for the full matrix.

## Supported tokens

| Token type | v0.2 support |
| --- | --- |
| Classic PAT (`ghp_`) | Full scan |
| OAuth token (`gho_`) | Full scan |
| Fine-grained PAT (`github_pat_`) | Self-reported permissions via `--permissions`; GitHub does not expose them through the API |
| GitHub App user token (`ghu_`) | Identity only |
| GitHub App server token (`ghs_`) | Installation repository count only |
| GitHub App refresh token (`ghr_`) | Rejected — it is not an access token |

## Privacy and security

- The token is sent **only** to `api.github.com`.
- The token is never printed: every report uses a redacted prefix.
- The token is never written to disk.
- There is no telemetry, analytics or crash reporting.
- `--token-stdin` and `--gh-account` are safer than putting a token in shell history.
- See [docs/threat-model.md](docs/threat-model.md) for the threat model and [SECURITY.md](SECURITY.md) for vulnerability reporting.

## Limitations

- Fine-grained PAT permissions are self-reported and cannot be verified through GitHub's API.
- Repository probes are read-only and do not test write, delete or administrative access.
- The scope matrix models classic OAuth scopes, not fine-grained permissions.
- Organization membership is read from `/user/orgs`; private memberships may be hidden.
- Token expiry and creation dates are not available through the API.
- The score is heuristic and should be used to start a conversation, not end one.

## Roadmap

- **v0.3** — repository-level blast radius, token diffing, signed releases, policy files
- **v1.0** — stable JSON schema, organization and repository checks, broader token coverage

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

```bash
bun install
bun run typecheck
bun test
bun run build
bun run build:action   # bundle the GitHub Action
bun run build:all      # cross-compile all release targets
bun run docs           # regenerate docs/scope-matrix.md and docs/permission-matrix.md
```

Project layout:

```text
src/
  cli.ts              CLI entry point
  action.ts           GitHub Action logic
  action-entry.ts     GitHub Action entry point
  scan.ts             token -> report pipeline
  token.ts            token input, detection and redaction
  github.ts           minimal GitHub API client
  scopes.ts           classic scope matrix
  permissions.ts      fine-grained permission matrix
  capabilities.ts     scope/permission -> capability mapping
  score.ts            weighted risk model
  recipes.ts          least-privilege recipes
  report/             terminal, Markdown, JSON and SARIF renderers
action.yml            GitHub Action metadata
action-dist/          committed Action bundle
docs/
  scope-matrix.md     generated scope and capability tables
  permission-matrix.md generated fine-grained permission table
  action.md           Action usage
  threat-model.md     assets, trust boundaries and mitigations
test/                 unit, CLI and Action tests
```

## License

MIT. See [LICENSE](LICENSE).
