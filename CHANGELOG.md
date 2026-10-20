# Changelog

## 0.2.0

- Add fine-grained PAT permission evaluation with `--permissions`
- Add namespaced permission definitions and `patscope explain --permissions`
- Add read-only repository access probes with `--repos`
- Add SARIF 2.1.0 output with `--format sarif`
- Add a GitHub Action with step summaries, outputs and failure thresholds
- Bump the JSON report schema to v2 (`permissions`, `repositories`)
- Add permission matrix, Action and report schema documentation
- Add Action bundle drift checks to CI and release verification

## 0.1.0

- Initial release
- Classic PAT and OAuth scope analysis
- Blast-radius score, terminal/Markdown/JSON reports
- Offline scope evaluation
- `explain` and `recipe` commands
- Cross-platform release binaries
