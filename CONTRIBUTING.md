# Contributing

Thanks for taking a look at patscope.

## Setup

```bash
git clone https://github.com/momomo12312hgfv/patscope.git
cd patscope
bun install
bun run typecheck
bun test
```

## Before opening a pull request

- Run `bun run typecheck` and `bun test`.
- Add or update tests for behavior changes.
- Keep the scope and permission matrices in sync. Run `bun run docs` after changing `src/scopes.ts`, `src/permissions.ts` or `src/capabilities.ts`.
- Run `bun run build:action` after changing Action code and commit `action-dist/index.cjs`.
- Do not commit tokens, `.env` files or generated reports that contain real account data.
- Keep changes focused. One pull request should solve one problem.

## Adding a scope

1. Add the scope to `src/scopes.ts` with a description, severity, category and capability IDs.
2. Add any new capability to `src/capabilities.ts`.
3. Run `bun run docs` to regenerate the tables.
4. Add a test in `test/capabilities.test.ts`.
5. Cite the GitHub documentation in the pull request description.

## Adding a fine-grained permission

1. Add the permission to `src/permissions.ts`. Use a namespaced name such as `repo.contents` or `org.members`.
2. Map its read and write access to capability IDs.
3. Add any new capability to `src/capabilities.ts`.
4. Run `bun run docs` to regenerate `docs/permission-matrix.md`.
5. Add a test in `test/permissions.test.ts`.

## Changing the GitHub Action

1. Update `src/action.ts` or `action.yml`.
2. Run `bun run build:action` and commit `action-dist/index.cjs`.
3. Run `bun test`; the Action tests cover reports, outputs and failure thresholds.
4. Update `docs/action.md` if inputs or outputs change.

## Adding a token type

1. Extend `TokenType` in `src/types.ts`.
2. Add prefix detection and a label in `src/token.ts`.
3. Update the GitHub client or scan pipeline if the token type needs special handling.
4. Add tests for detection and redaction.
5. Update the supported-token table in both README files.

## Code style

- TypeScript, strict mode, no `any` unless unavoidable.
- Prefer small pure functions for the scope/capability/score logic.
- Keep network calls in `src/github.ts`.
- Keep token handling in `src/token.ts`.
- Never log a token, even in debug code.

## Commit messages

Use short, imperative messages:

```text
Add delete_repo capability
Fix Markdown table escaping
Document fine-grained PAT limitation
```

## Security

See [SECURITY.md](SECURITY.md). Do not report vulnerabilities in public issues.
