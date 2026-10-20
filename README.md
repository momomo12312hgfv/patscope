# patscope

> See the blast radius of your GitHub token — and shrink it.

[![CI](https://github.com/momomo12312hgfv/patscope/actions/workflows/ci.yml/badge.svg)](https://github.com/momomo12312hgfv/patscope/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/momomo12312hgfv/patscope)](https://github.com/momomo12312hgfv/patscope/releases)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

`gh auth status` tells you which scopes a GitHub token has. It does not tell you what those scopes actually mean.

`patscope` turns a token into a readable capability map, a blast-radius score, and a least-privilege recipe. It runs locally, never prints the token, and only talks to `api.github.com`.

## Demo

```text
$ patscope scan --gh-account octocat

patscope 0.1.0
identity   @octocat
token      ghp_****...redacted (classic PAT)
scopes     6

Blast radius  CRITICAL ████████████████████ 100/100 (raw 148)

Top risks
  ! Delete repositories [repo:delete]
    Permanently delete repositories, including all code, issues and releases.
    granted by delete_repo
  ! Manage organization [org:admin]
    Add or remove members, change roles, manage teams, settings and organization secrets.
    granted by admin:org
  ! Modify GitHub Actions workflows [workflow:write]
    Add or change workflow files, which can execute code and expose repository secrets.
    granted by workflow

Capabilities
  SEVERITY CAPABILITY                          GRANTED BY
  CRITICAL Delete repositories                 delete_repo
  CRITICAL Manage organization                 admin:org
  HIGH     Change repository settings          repo
  HIGH     Modify GitHub Actions workflows     workflow
  HIGH     Write repository contents           repo

Local-only scan. The token was sent only to api.github.com.
```

## Why

Tokens are invisible power. A token with `repo`, `workflow` and `delete_repo` can read every private repository, change CI, and destroy the repository entirely. Most developers only find out after an incident.

`patscope` answers three questions:

1. What can this token do if it leaks?
2. Which scopes are responsible?
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

# Scan a token from the environment
GH_TOKEN=ghp_... patscope scan

# Read a token from stdin (keeps it out of shell history)
cat token.txt | patscope scan --token-stdin

# Markdown report for a README or an issue
patscope scan --format markdown > report.md

# Fail CI when the token is high risk or worse
patscope scan --fail-on high

# Evaluate scopes without making any network requests
patscope scan --offline --scopes repo,workflow,delete_repo --login octocat

# Explain a single scope
patscope explain repo

# Show a least-privilege recipe
patscope recipe push
patscope recipe ci
patscope recipe release
```

### Output formats

| Format | Use case |
| --- | --- |
| `terminal` | Human-readable scan (default) |
| `markdown` | Paste into an issue, PR or report |
| `json` | Automation, dashboards, custom checks |

### Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Scan completed and did not cross the `--fail-on` threshold |
| `1` | Invalid input, token rejected, or network/API error |
| `2` | Score is at or above the `--fail-on` threshold |

## What it checks

- Token type (classic PAT, fine-grained PAT, OAuth, GitHub App token)
- OAuth scopes and the capabilities they grant
- Identity, plan and organization membership (read-only)
- Current API rate limit
- Unknown scopes and unsupported token types
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

The score is a communication tool, not a CVSS replacement. Every finding includes the scopes that granted it so you can verify the result yourself. See [docs/scope-matrix.md](docs/scope-matrix.md) for the full scope and capability tables.

## Supported tokens

| Token type | v0.1 support |
| --- | --- |
| Classic PAT (`ghp_`) | Full scan |
| OAuth token (`gho_`) | Full scan |
| Fine-grained PAT (`github_pat_`) | Identity and type only; GitHub does not expose fine-grained permissions through the API. Combine `--offline --scopes` with known permissions. |
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

- Fine-grained PAT permissions are not exposed by GitHub's API. patscope will not guess them.
- The scope matrix models classic OAuth scopes, not fine-grained permissions.
- Organization membership is read from `/user/orgs`; private memberships may be hidden.
- Token expiry and creation dates are not available through the API.
- The score is heuristic and should be used to start a conversation, not end one.

## Roadmap

- **v0.2** — fine-grained PAT permission probes, SARIF output, a reusable GitHub Action
- **v0.3** — repository-level blast radius ("which repos can this token delete?"), token diffing
- **v1.0** — stable JSON schema, organization and repository checks, signed releases

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md).

## Development

```bash
bun install
bun run typecheck
bun test
bun run build
bun run build:all   # cross-compile all release targets
bun run docs        # regenerate docs/scope-matrix.md
```

Project layout:

```text
src/
  cli.ts              CLI entry point
  scan.ts             token -> report pipeline
  token.ts            token input, detection and redaction
  github.ts           minimal GitHub API client
  scopes.ts           classic scope matrix
  capabilities.ts     scope -> capability mapping
  score.ts            weighted risk model
  recipes.ts          least-privilege recipes
  report/             terminal, Markdown and JSON renderers
docs/
  scope-matrix.md     generated scope and capability tables
  threat-model.md     assets, trust boundaries and mitigations
test/                 unit and CLI tests
```

## License

MIT. See [LICENSE](LICENSE).
