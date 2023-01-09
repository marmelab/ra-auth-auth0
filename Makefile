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

build-ra-auth-auth0:
	@echo "Transpiling ra-auth-auth0 files...";
	@cd ./packages/ra-auth-auth0 && yarn build

build-demo-react-admin:
	@echo "Transpiling demo files...";
	@cd ./packages/demo-react-admin && yarn build

build: build-ra-auth-auth0 build-demo-react-admin ## compile ES6 files to JS

lint: ## lint the code and check coding conventions
	@echo "Running linter..."
	@yarn lint

prettier: ## prettify the source code using prettier
	@echo "Running prettier..."
	@yarn prettier

test: build test-unit lint ## launch all tests

test-unit: ## launch unit tests
	echo "Running unit tests...";
	yarn test-unit;

run-demo:
	@cd ./packages/demo-react-admin && yarn start

DOCKER_COMPOSE = docker-compose -p ra-auth-auth0 -f ./docker-compose.yml

start: ## Start the project with docker.
	$(DOCKER_COMPOSE) up --force-recreate -d

logs: ## Display logs
	$(DOCKER_COMPOSE) logs -f

stop: ## Stop the project with docker.
	$(DOCKER_COMPOSE) down

publish: ## Publish the package
	cd packages/ra-auth-auth0 && npm publish
