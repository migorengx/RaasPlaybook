# Stack-agnostic quality gates. Wire real commands in as the stack is chosen.
# Agents run `make check` before claiming done.

.PHONY: lint format typecheck test check clean

lint:
	@echo "TODO: wire linter (e.g. ruff / eslint / clippy)"

format:
	@echo "TODO: wire formatter (e.g. ruff format / prettier / rustfmt)"

typecheck:
	@echo "TODO: wire type checker (e.g. mypy / tsc)"

test:
	@echo "TODO: wire test runner (e.g. pytest / vitest / cargo test)"

check: lint typecheck test
	@echo "All gates passed."

clean:
	@echo "TODO: wire clean (remove build artifacts)"
