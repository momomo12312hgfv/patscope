# Report schema v2

`patscope scan --format json` returns a stable, machine-readable report. The schema version is `2` as of patscope v0.2.0.

## Top level

| Field | Type | Description |
| --- | --- | --- |
| `schemaVersion` | `2` | Report schema version |
| `generatedAt` | string | ISO 8601 timestamp |
| `identity` | object \| null | Token identity |
| `token` | object | Token metadata |
| `orgs` | array | Organizations visible to the token |
| `repositories` | array | Read-only repository probe results |
| `capabilities` | array | Capabilities granted by scopes and permissions |
| `score` | object | Blast-radius score and breakdown |
| `scoreKnown` | boolean | `false` when the token type does not expose permissions |
| `warnings` | array of strings | Non-fatal warnings |
| `rateLimit` | object \| null | GitHub API rate limit from the first request |

## `token`

| Field | Type | Description |
| --- | --- | --- |
| `type` | string | `classic-pat`, `fine-grained-pat`, `oauth`, `github-app-user`, `github-app-server`, `github-app-refresh` or `unknown` |
| `typeLabel` | string | Human-readable token type |
| `redacted` | string | Redacted token prefix; never the full token |
| `scopes` | array of strings | Classic OAuth scopes |
| `permissions` | array | Self-reported fine-grained permissions |
| `source` | string | `env:GH_TOKEN`, `stdin`, `gh:<account>`, `offline` or `github-action` |

### `token.permissions[]`

| Field | Type | Description |
| --- | --- | --- |
| `permission` | string | Namespaced permission name, e.g. `repo.contents` |
| `access` | string | `read` or `write` |

## `repositories[]`

| Field | Type | Description |
| --- | --- | --- |
| `fullName` | string | `owner/repo` |
| `private` | boolean \| null | Visibility, or `null` when unknown |
| `accessible` | boolean | Whether `GET /repos/{owner}/{repo}` succeeded |
| `status` | number \| null | HTTP status, or `null` for invalid input |
| `error` | string \| null | Error message when not accessible |

## `capabilities[]`

| Field | Type | Description |
| --- | --- | --- |
| `id` | string | Stable capability ID, e.g. `code:write` |
| `title` | string | Short title |
| `description` | string | What the capability enables |
| `severity` | string | `low`, `medium`, `high` or `critical` |
| `category` | string | Repository, actions, organization, etc. |
| `matchedScopes` | array of strings | Classic scopes and/or fine-grained grants such as `repo.contents=write` |

## `score`

| Field | Type | Description |
| --- | --- | --- |
| `value` | number | Final score, 0–100 |
| `rawValue` | number | Weighted sum before the floor and cap |
| `level` | string | `low`, `medium`, `high` or `critical` |
| `highestSeverity` | string \| null | Highest capability severity |
| `floorApplied` | boolean | Whether the floor raised the raw value |
| `breakdown` | array | Per-capability weights |

## Compatibility

Additive fields may be introduced in minor releases. A breaking change will bump `schemaVersion`. Consumers should ignore unknown fields.
