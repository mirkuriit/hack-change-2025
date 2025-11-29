#!/usr/bin/make

SHELL = /bin/bash

include .env

postgres-run:
 	docker compose up -d
# 	sleep 5
# # 	poetry run drop-db
# 	poetry run init-db
# # 	poetry run alembic upgrade head


dev:
	poetry run uvicorn file_storage_api.app.main:app --reload --port 8000 --host 0.0.0.0

up: postgres-run dev

shutdown:
	docker stop postgres
	docker rm postgres