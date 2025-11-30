#!/usr/bin/make

ifneq ($(if $(MAKECMDGOALS),$(words $(MAKECMDGOALS)),1),1)
.SUFFIXES:
TARGET := $(if $(findstring :,$(firstword $(MAKECMDGOALS))),,$(firstword $(MAKECMDGOALS)))
PARAMS := $(if $(findstring :,$(firstword $(MAKECMDGOALS))),$(MAKECMDGOALS),$(wordlist 2,100000,$(MAKECMDGOALS)))
.DEFAULT_GOAL = help
.PHONY: ONLY_ONCE
ONLY_ONCE:
	$(MAKE) $(TARGET) COMMAND_ARGS="$(PARAMS)"
%: ONLY_ONCE
	@:
else

postgres-run:
	docker compose up -d

dev:
	uv run uvicorn src.main:app --reload --port 8000 --host 0.0.0.0

up: postgres-run dev

shutdown:
	docker stop postgres
	docker rm postgres

endif