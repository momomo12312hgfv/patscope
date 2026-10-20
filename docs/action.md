# GitHub Action

The patscope Action scans a token, writes a report to the job summary, and fails the job when the risk threshold is reached.

## Example

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
        id: patscope
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
      - run: echo "Score ${{ steps.patscope.outputs.score }} (${{ steps.patscope.outputs.level }})"
```

## Inputs

| Input | Required | Default | Description |
| --- | --- | --- | --- |
| `token` | yes | — | Token to scan. Use a dedicated, low-privilege token. |
| `fail-on` | no | `high` | `low`, `medium`, `high` or `critical` |
| `format` | no | `markdown` | `markdown`, `json` or `sarif` |
| `output-file` | no | `patscope-report.md` / `.sarif` | Report path |
| `permissions` | no | — | Self-reported fine-grained permissions, e.g. `contents=write,metadata=read` |
| `repos` | no | — | Comma-separated `owner/repo` list for read-only probes |

## Outputs

| Output | Description |
| --- | --- |
| `score` | Blast-radius score from 0 to 100 |
| `level` | `low`, `medium`, `high` or `critical` |
| `report` | Path to the generated report |

## Permissions

The Action itself needs only the permissions required by the job:

```yaml
permissions:
  contents: read
  security-events: write   # only when uploading SARIF to code scanning
```

The token being scanned is separate. Prefer a dedicated token with the smallest scope that still represents the thing you want to check.

## Behavior

- The report is always written to the path in `output-file`.
- A Markdown version is written to `GITHUB_STEP_SUMMARY`, even when `format` is `json` or `sarif`.
- `score`, `level` and `report` are written to `GITHUB_OUTPUT`.
- The job fails when `scoreKnown` is true and the level meets or exceeds `fail-on`.
- The token is never printed; all output uses the same redaction as the CLI.

## SARIF and code scanning

`--format sarif` writes SARIF 2.1.0 with one rule per capability. GitHub Code Scanning requires a physical location, so patscope points every result at a generated Markdown report next to the SARIF file. For a custom path, use the CLI flag `--sarif-location`.

Upload the file with:

```yaml
- uses: github/codeql-action/upload-sarif@v4
  if: always()
  with:
    sarif_file: patscope.sarif
```

## Fine-grained tokens

GitHub does not expose fine-grained PAT permissions through the API. Provide them explicitly:

```yaml
with:
  token: ${{ secrets.FINEGRAINED_PAT }}
  permissions: contents=write,pull_requests=write,metadata=read
```

The report labels these permissions as self-reported. See [permission-matrix.md](permission-matrix.md) for names.

## Security notes

- Do not use your main personal token. Create a dedicated token for this job.
- Do not echo the token or pass it through `--token` on a shell command line.
- The Action only performs read-only `GET` requests against `api.github.com`.
- Store the token in GitHub Actions secrets, never in the workflow file.
