.PHONY: build help

help:
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: package.json ## install dependencies
	@if [ "$(CI)" != "true" ]; then \
		echo "Full install..."; \
		yarn; \
	fi
	@if [ "$(CI)" = "true" ]; then \
		echo "Frozen install..."; \
		yarn --frozen-lockfile; \
	fi

build-ra-auth0:
	@echo "Transpiling ra-auth0 files...";
	@cd ./packages/ra-auth0 && yarn -s build

build-demo:
	@echo "Transpiling demo files...";
	@cd ./packages/demo && yarn -s build

build: build-ra-auth0 build-demo ## compile ES6 files to JS

lint: ## lint the code and check coding conventions
	@echo "Running linter..."
	@yarn -s lint

prettier: ## prettify the source code using prettier
	@echo "Running prettier..."
	@yarn -s prettier

test: build test-unit lint ## launch all tests

test-unit: ## launch unit tests
	echo "Running unit tests...";
	yarn -s test-unit;

run-demo:
	@cd ./packages/demo && yarn start

run: run-demo