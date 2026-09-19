# Security Policy

## Reporting

Report vulnerabilities privately to <SECURITY_CONTACT>. Do not open public issues.

## Scope

- Source in `src/` and `tests/`
- CI workflows in `.github/`

## Handling secrets

- Secrets live in the environment or a secret manager, never in git.
- `.env*` files are gitignored; provide `.env.example` with placeholder values.
- If a secret is ever committed: rotate it immediately, then purge history.

## Dependency policy

- Pin direct dependencies.
- Review automated dependency PRs (Dependabot/Renovate) promptly.
