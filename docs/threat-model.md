# Threat model

patscope handles a high-value secret: a GitHub token. This document describes what we protect, where trust boundaries are, and what the tool deliberately does not do.

## Assets

| Asset | Why it matters |
| --- | --- |
| GitHub token | Can read or modify code, CI, packages and organization settings depending on scopes |
| Token-bearing environment | Shell history, environment variables, CI logs and process arguments |
| Report output | Contains identity, scopes, self-reported permissions and repository names; may be pasted into issues |
| Repository and CI secrets | Reachable through overprivileged tokens, but never accessed by patscope |
| Local machine | A compromised machine can read the token before patscope runs |
| GitHub Actions secret | The token passed to the Action may be exposed in logs if the workflow is misconfigured |

## Trust boundaries

1. **Shell / CI → patscope.** The token enters through `GH_TOKEN`, `GITHUB_TOKEN`, stdin, or the `gh` keyring. Environment variables and shell history are outside patscope's control.
2. **patscope → api.github.com.** The token is sent over HTTPS to a fixed host. patscope does not follow arbitrary URLs from user input.
3. **patscope → terminal / report.** The token must not cross this boundary. Reports include a redacted prefix only.
4. **Report → third party.** A Markdown or JSON report may be shared publicly. It contains identity and organization metadata, but not the token or email address.

## Threats and mitigations

| Threat | Mitigation |
| --- | --- |
| Token printed in output or an error | Every renderer uses `redactToken`; top-level errors pass through `redactSecrets` |
| Token stored on disk | patscope never writes the token; it reads it into memory and exits |
| Token exposed in shell history | No `--token` flag; use `--token-stdin` or `--gh-account` |
| Token sent to a third party | No telemetry; the only network destination is `api.github.com` |
| Token used for writes | The API client only calls read-only `GET` endpoints |
| Malicious API response | Responses are parsed as JSON and treated as untrusted data |
| Supply-chain compromise | Small dependency surface (`commander`, `picocolors`), lockfile committed, CI runs typecheck, tests and an Action bundle drift check |
| Report leaks personal data | The report includes login, display name, orgs, scopes and repository names; it intentionally excludes email addresses |
| Self-reported permissions are wrong | Reports label them as self-reported and warn that they cannot be verified through the API |
| Action leaks the token | The Action uses the same redaction path as the CLI, never prints the token, and expects the token to come from a secret |
| Overprivileged token remains in use | The report shows capabilities and provides least-privilege recipes; remediation is left to the user |
| Running on an untrusted machine | Out of scope: malware can read the token before or after patscope runs |

## Non-goals

patscope is **not**:

- a secret scanner for repositories;
- a penetration-testing or exploitation tool;
- a token generator or token broker;
- a replacement for GitHub's audit log, secret scanning, or organization security settings;
- a guarantee that a token is safe. The score is a heuristic based on documented scopes.

## Residual risks

- Classic PAT scopes are coarse. A token may be "minimal" for a task and still grant broad access.
- Fine-grained PAT permissions are not exposed by GitHub's API. patscope relies on the user's `--permissions` input and cannot verify it.
- Repository probes are read-only and only cover repositories explicitly passed with `--repos`.
- Organization membership returned by `/user/orgs` may omit private memberships.
- A shared JSON or SARIF report reveals the account's login, display name, plan, organizations and probed repository names. Review it before publishing.
- A compromised local machine can access the token regardless of patscope's behavior.
- A GitHub Actions workflow that echoes its inputs can leak the token outside patscope's control.

## Reporting a vulnerability

See [SECURITY.md](../SECURITY.md). Never include a real token in a report, issue or pull request.
