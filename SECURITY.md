# Security policy

## Reporting a vulnerability

Please do not open a public issue for security vulnerabilities.

Use GitHub's private vulnerability reporting:

1. Go to the repository's **Security** tab.
2. Select **Advisories**.
3. Click **Report a vulnerability**.

If private reporting is unavailable, open a minimal issue asking for a private contact channel. Do **not** include tokens, exploit details or sensitive data in the issue.

## What to include

- A description of the issue and its impact
- Steps to reproduce, using a throwaway token
- The patscope version and platform
- Any suggested fix

## Scope

In scope:

- Token disclosure through CLI output, Action logs, errors, reports or SARIF
- Unexpected network destinations
- Write operations performed by a scan
- Command injection or path traversal
- Dependency vulnerabilities that affect patscope

Out of scope:

- The security posture of a token you chose to scan
- Risks caused by running patscope on a compromised machine
- GitHub API behavior or GitHub account security settings
- Social engineering

## Safe harbor

We will not pursue legal action for good-faith research that follows this policy, avoids privacy violations, and does not degrade service for others.

## Token hygiene

Never paste a real token into an issue, pull request, discussion or chat. If you need to demonstrate a problem, use a revoked token or a clearly fake value.
